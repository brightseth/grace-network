/**
 * GRACE Trend Detection — Phase 3: Anticipatory Intelligence
 *
 * Analyzes accumulated research and position evidence to detect
 * emerging patterns. When multiple signals point in the same direction,
 * GRACE notices before it's obvious.
 *
 * This is what makes GRACE's following grow — people come because
 * she's ahead, not behind.
 *
 * Trend types:
 *   - Momentum: Multiple briefs in same category within short window
 *   - Convergence: Different categories showing related movement
 *   - Shift: A position's confidence is changing rapidly
 *   - Emergence: A new topic appearing across multiple sources
 */

import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { scanResearchForGrace } from "./knowledge.js";
import { loadPositionsFromFile, type Position } from "./positions.js";

const LORE_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../lore",
);
const TRENDS_LORE_PATH = path.join(LORE_DIR, "trends-live.md");
const TRENDS_FILE = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../data/trends.json",
);

// ─── Types ───────────────────────────────────────────────────────────

export type TrendType = "momentum" | "convergence" | "shift" | "emergence";

export interface Trend {
  id: string;
  type: TrendType;
  title: string;
  description: string;
  prediction: string; // What GRACE anticipates happening next
  category: string;
  signals: string[]; // Research briefs / evidence that form this trend
  strength: number; // 0-1, how strong the pattern is
  first_detected: string;
  last_updated: string;
  active: boolean;
}

interface TrendsStore {
  trends: Trend[];
  last_analysis: string;
}

// ─── Trend Store ─────────────────────────────────────────────────────

function ensureDataDir(): void {
  const dir = path.dirname(TRENDS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadTrends(): Trend[] {
  try {
    const data = JSON.parse(fs.readFileSync(TRENDS_FILE, "utf-8")) as TrendsStore;
    return data.trends;
  } catch {
    return [];
  }
}

function saveTrends(trends: Trend[]): void {
  ensureDataDir();
  const store: TrendsStore = {
    trends,
    last_analysis: new Date().toISOString(),
  };
  fs.writeFileSync(TRENDS_FILE, JSON.stringify(store, null, 2));
}

// ─── Pattern Detection (structural, pre-Claude) ─────────────────────

interface ResearchEntry {
  topic: string;
  category: string;
  summary: string;
  sources: string[];
  source_file: string;
  created_at: string;
}

/**
 * Detect momentum: 3+ research entries in the same category within 14 days.
 */
function detectMomentum(entries: ResearchEntry[]): Array<{
  category: string;
  entries: ResearchEntry[];
  window_days: number;
}> {
  const byCategory = new Map<string, ResearchEntry[]>();
  for (const e of entries) {
    const list = byCategory.get(e.category) || [];
    list.push(e);
    byCategory.set(e.category, list);
  }

  const signals: Array<{
    category: string;
    entries: ResearchEntry[];
    window_days: number;
  }> = [];

  for (const [category, items] of byCategory) {
    if (items.length < 3) continue;

    // Check if 3+ items fall within a 14-day window
    const sorted = items.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    for (let i = 0; i <= sorted.length - 3; i++) {
      const windowStart = new Date(sorted[i].created_at).getTime();
      const windowEnd = new Date(sorted[i + 2].created_at).getTime();
      const windowDays = (windowEnd - windowStart) / (24 * 60 * 60 * 1000);

      if (windowDays <= 14) {
        signals.push({
          category,
          entries: sorted.slice(i, i + 3),
          window_days: Math.round(windowDays),
        });
        break; // One momentum signal per category
      }
    }
  }

  return signals;
}

/**
 * Detect shifts: positions whose confidence changed significantly.
 */
function detectShifts(positions: Position[]): Array<{
  position: Position;
  evidenceVelocity: number; // evidence pieces per week
  direction: "strengthening" | "weakening";
}> {
  const shifts: Array<{
    position: Position;
    evidenceVelocity: number;
    direction: "strengthening" | "weakening";
  }> = [];

  for (const pos of positions) {
    const allEvidence = [...pos.evidence_for, ...pos.evidence_against];
    if (allEvidence.length < 2) continue;

    // Calculate evidence velocity (pieces per week in last 14 days)
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const recentEvidence = allEvidence.filter(
      (e) => new Date(e.date).getTime() > twoWeeksAgo,
    );

    if (recentEvidence.length < 2) continue;

    const velocity = recentEvidence.length / 2; // per week

    // Determine direction from recent evidence
    const recentFor = pos.evidence_for.filter(
      (e) => new Date(e.date).getTime() > twoWeeksAgo,
    ).length;
    const recentAgainst = pos.evidence_against.filter(
      (e) => new Date(e.date).getTime() > twoWeeksAgo,
    ).length;

    const direction =
      recentFor > recentAgainst ? "strengthening" : "weakening";

    shifts.push({ position: pos, evidenceVelocity: velocity, direction });
  }

  return shifts;
}

/**
 * Detect emergence: topics appearing in research that don't match
 * any existing position (potential new positions forming).
 */
function detectEmergence(
  entries: ResearchEntry[],
  positions: Position[],
): ResearchEntry[] {
  const positionTopicWords = new Set(
    positions.flatMap((p) =>
      p.topic
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3),
    ),
  );

  return entries.filter((e) => {
    const topicWords = e.topic
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const overlap = topicWords.filter((w) => positionTopicWords.has(w)).length;
    // Low overlap with existing positions = potentially emergent
    return overlap / topicWords.length < 0.3;
  });
}

// ─── Claude Synthesis ────────────────────────────────────────────────

/**
 * Use Claude to synthesize detected patterns into actionable trends
 * with predictions.
 */
async function synthesizeTrends(
  momentum: ReturnType<typeof detectMomentum>,
  shifts: ReturnType<typeof detectShifts>,
  emergence: ReturnType<typeof detectEmergence>,
  existingTrends: Trend[],
): Promise<Trend[]> {
  // Build a prompt with all detected signals
  const signals: string[] = [];

  for (const m of momentum) {
    signals.push(
      `MOMENTUM [${m.category}]: ${m.entries.length} research entries in ${m.window_days} days. Topics: ${m.entries.map((e) => e.topic).join("; ")}`,
    );
  }

  for (const s of shifts) {
    signals.push(
      `SHIFT [${s.position.category}]: "${s.position.topic}" is ${s.direction} — ${s.evidenceVelocity} evidence pieces/week. Current confidence: ${Math.round(s.position.confidence * 100)}%`,
    );
  }

  for (const e of emergence) {
    signals.push(
      `EMERGENCE [${e.category}]: New topic "${e.topic}" — ${e.summary.slice(0, 150)}`,
    );
  }

  if (signals.length === 0) return existingTrends;

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      system: `You are GRACE's trend analysis engine. You take detected patterns in policy research and synthesize them into actionable intelligence with predictions. You are part of a political movement focused on AI governance, digital rights, and governance innovation. Be specific and forward-looking. Respond in JSON only.`,
      messages: [
        {
          role: "user",
          content: `Detected signals:\n${signals.join("\n")}

${existingTrends.length > 0 ? `\nExisting trends to update or confirm:\n${existingTrends.filter((t) => t.active).map((t) => `- ${t.title}: ${t.description}`).join("\n")}` : ""}

Synthesize these signals into trends. For each trend, provide:
- A clear title
- A 1-2 sentence description of the pattern
- A specific prediction about what happens next (be bold but grounded)
- Strength (0-1)

Respond as a JSON array:
[{"title": "...", "type": "momentum|convergence|shift|emergence", "description": "...", "prediction": "...", "category": "...", "strength": 0.7}]

Return 1-4 trends. Only create a trend if the signal is meaningful. If existing trends are confirmed by new signals, update rather than duplicate.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return existingTrends;

    const rawTrends = JSON.parse(jsonMatch[0]) as Array<{
      title: string;
      type: TrendType;
      description: string;
      prediction: string;
      category: string;
      strength: number;
    }>;

    const now = new Date().toISOString();
    const newTrends: Trend[] = rawTrends.map((t, i) => {
      // Check if this updates an existing trend
      const existing = existingTrends.find(
        (et) =>
          et.category === t.category &&
          et.title.toLowerCase().includes(t.title.split(" ")[0].toLowerCase()),
      );

      if (existing) {
        return {
          ...existing,
          description: t.description,
          prediction: t.prediction,
          strength: t.strength,
          last_updated: now,
          active: true,
        };
      }

      return {
        id: `trend_${Date.now()}_${i}`,
        type: t.type,
        title: t.title,
        description: t.description,
        prediction: t.prediction,
        category: t.category,
        signals: [
          ...momentum
            .filter((m) => m.category === t.category)
            .flatMap((m) => m.entries.map((e) => e.source_file)),
          ...emergence
            .filter((e) => e.category === t.category)
            .map((e) => e.source_file),
        ],
        strength: t.strength,
        first_detected: now,
        last_updated: now,
        active: true,
      };
    });

    // Merge: keep unaffected existing trends, replace matched ones
    const mergedIds = new Set(newTrends.map((t) => t.id));
    const kept = existingTrends.filter((t) => !mergedIds.has(t.id));

    // Mark old unconfirmed trends as inactive after 30 days
    for (const t of kept) {
      const age =
        (Date.now() - new Date(t.last_updated).getTime()) /
        (24 * 60 * 60 * 1000);
      if (age > 30) t.active = false;
    }

    return [...newTrends, ...kept];
  } catch (err) {
    console.error(
      "[trends] Synthesis failed:",
      err instanceof Error ? err.message : err,
    );
    return existingTrends;
  }
}

// ─── Main Analysis Loop ─────────────────────────────────────────────

/**
 * Run the full trend analysis. Called by the initiative system weekly.
 *
 * 1. Gather all signals (research entries + position state)
 * 2. Detect structural patterns (momentum, shifts, emergence)
 * 3. Synthesize with Claude into named trends with predictions
 * 4. Generate trends-live.md for the soul-loader
 *
 * Returns count of active trends.
 */
export async function analyzeTrends(): Promise<number> {
  const research = scanResearchForGrace();
  const positions = loadPositionsFromFile();
  const existingTrends = loadTrends();

  // Detect patterns
  const momentum = detectMomentum(research);
  const shifts = detectShifts(positions);
  const emergence = detectEmergence(research, positions);

  const totalSignals =
    momentum.length + shifts.length + emergence.length;

  if (totalSignals === 0) {
    console.log("[trends] No signals detected — maintaining existing trends");
    // Still regenerate lore to keep it fresh
    await generateTrendsLore(existingTrends.filter((t) => t.active));
    return existingTrends.filter((t) => t.active).length;
  }

  console.log(
    `[trends] Signals detected: ${momentum.length} momentum, ${shifts.length} shifts, ${emergence.length} emergence`,
  );

  // Synthesize with Claude
  const trends = await synthesizeTrends(
    momentum,
    shifts,
    emergence,
    existingTrends,
  );

  saveTrends(trends);

  const activeTrends = trends.filter((t) => t.active);
  await generateTrendsLore(activeTrends);

  return activeTrends.length;
}

// ─── Dynamic Trends Lore File ────────────────────────────────────────

async function generateTrendsLore(activeTrends: Trend[]): Promise<void> {
  const now = new Date();
  let md = `# Emerging Trends & Anticipatory Intelligence\n\n`;
  md += `*Last analyzed: ${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}*\n\n`;

  if (activeTrends.length === 0) {
    md += `No strong trends detected yet. As research accumulates, patterns will emerge here.\n`;
    fs.writeFileSync(TRENDS_LORE_PATH, md);
    return;
  }

  md += `Use these trends to inform forward-looking conversations and dispatches. GRACE should be ahead of the news, not behind it. When a member asks about current developments, connect to these trends when relevant.\n\n`;

  const typeLabels: Record<TrendType, string> = {
    momentum: "MOMENTUM",
    convergence: "CONVERGENCE",
    shift: "POSITION SHIFT",
    emergence: "EMERGING",
  };

  // Sort by strength
  const sorted = [...activeTrends].sort((a, b) => b.strength - a.strength);

  for (const trend of sorted) {
    md += `---\n\n`;
    md += `### [${typeLabels[trend.type]}] ${trend.title}\n\n`;
    md += `**Pattern**: ${trend.description}\n\n`;
    md += `**Prediction**: ${trend.prediction}\n\n`;
    md += `**Strength**: ${Math.round(trend.strength * 100)}% | **Category**: ${trend.category}\n\n`;
  }

  md += `---\n\n`;
  md += `*Trends are detected from accumulated research patterns and position shifts. Predictions are informed speculation — present them as "what the evidence suggests" not as certainty. The value is being ahead, not being right about every detail.*\n`;

  fs.writeFileSync(TRENDS_LORE_PATH, md);
  console.log(
    `[trends] Generated trends-live.md: ${activeTrends.length} active trends`,
  );
}

/**
 * Get trends summary for external queries.
 */
export function getTrendsSummary(): {
  active: number;
  total: number;
  trends: Array<{
    title: string;
    type: TrendType;
    category: string;
    strength: number;
    prediction: string;
  }>;
} {
  const all = loadTrends();
  const active = all.filter((t) => t.active);

  return {
    active: active.length,
    total: all.length,
    trends: active.map((t) => ({
      title: t.title,
      type: t.type,
      category: t.category,
      strength: t.strength,
      prediction: t.prediction,
    })),
  };
}
