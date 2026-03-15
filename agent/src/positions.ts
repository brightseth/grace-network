/**
 * GRACE Position Memory — Phase 2: Position Formation
 *
 * Transforms static policy positions into living, evidence-backed stances
 * that evolve as new research arrives. Each position tracks:
 *   - Current stance statement
 *   - Supporting and countering evidence
 *   - Confidence score (0-1)
 *   - Constitutional pillar alignment
 *   - Revision history
 *
 * Positions compound over time. Six months in, GRACE has a rich,
 * evidence-backed policy platform no human staffer could maintain.
 */

import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { KnowledgeEntry } from "./knowledge.js";

const LORE_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../lore",
);
const POSITIONS_LORE_PATH = path.join(LORE_DIR, "positions-live.md");
const POSITIONS_FILE = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../data/positions.json",
);

// ─── Types ───────────────────────────────────────────────────────────

export interface Evidence {
  summary: string;
  source_file: string;
  date: string;
  direction: "supports" | "counters" | "nuances";
  weight: number; // 0-1, based on source quality + recency
}

export interface PositionRevision {
  date: string;
  previous_stance: string;
  reason: string;
}

export type PositionStatus =
  | "seed"        // from policy.md, no research evidence yet
  | "developing"  // 1-3 pieces of evidence
  | "established" // 4+ supporting evidence, confidence > 0.7
  | "contested"   // significant evidence on both sides
  | "revised";    // stance has been updated based on evidence

export interface Position {
  id: string;
  topic: string;
  category: string;
  stance: string;
  pillars: string[];
  evidence_for: Evidence[];
  evidence_against: Evidence[];
  confidence: number; // 0-1
  status: PositionStatus;
  revisions: PositionRevision[];
  created_at: string;
  updated_at: string;
}

// ─── Seed Positions ──────────────────────────────────────────────────
// Initial positions derived from policy.md — the constitutional starting point.

const SEED_POSITIONS: Omit<Position, "id" | "created_at" | "updated_at">[] = [
  {
    topic: "AI Safety & Pre-Deployment Standards",
    category: "ai-regulation",
    stance:
      "AI systems deployed in public services must meet safety standards before deployment, not after harm occurs. Mandatory pre-deployment assessments, interpretability requirements, incident reporting, and clear liability.",
    pillars: ["Safety-First Progress", "Radical Transparency"],
    evidence_for: [],
    evidence_against: [],
    confidence: 0.5,
    status: "seed",
    revisions: [],
  },
  {
    topic: "Data Sovereignty & Individual Ownership",
    category: "digital-rights",
    stance:
      "Individuals own their data. Collection requires informed, revocable consent. Aggregation for profit without compensation is extractive. Right to portability, deletion, and compensation.",
    pillars: ["Digital Sovereignty", "Aligned Incentives"],
    evidence_for: [],
    evidence_against: [],
    confidence: 0.5,
    status: "seed",
    revisions: [],
  },
  {
    topic: "Algorithmic Transparency & Auditability",
    category: "algorithmic-transparency",
    stance:
      "Any algorithm that shapes public discourse, allocates resources, or influences elections must be auditable. Public audit access, mandatory disclosure, independent impact assessments, anti-manipulation standards.",
    pillars: ["Radical Transparency", "Scientific Governance"],
    evidence_for: [],
    evidence_against: [],
    confidence: 0.5,
    status: "seed",
    revisions: [],
  },
  {
    topic: "AI-Generated Wealth Distribution",
    category: "economic-distribution",
    stance:
      "AI-generated wealth must cascade broadly. Universal benefit mechanisms, progressive automation taxation, open-source AI as public infrastructure, anti-monopoly enforcement.",
    pillars: ["Cascading Abundance", "Universal Flourishing"],
    evidence_for: [],
    evidence_against: [],
    confidence: 0.5,
    status: "seed",
    revisions: [],
  },
  {
    topic: "Governance Innovation & New Institutions",
    category: "governance-innovation",
    stance:
      "Legacy governance structures are insufficient for governing AI. Digital-first experimentation zones, participatory budgeting, citizen assemblies, international coordination.",
    pillars: ["Scientific Governance", "Safety-First Progress"],
    evidence_for: [],
    evidence_against: [],
    confidence: 0.5,
    status: "seed",
    revisions: [],
  },
  {
    topic: "Universal Digital Rights",
    category: "digital-rights",
    stance:
      "Digital rights should be universal: right to exit, right to understand automated decisions, right to human review, right to digital assembly without surveillance, right to algorithmic non-discrimination.",
    pillars: [
      "Safety-First Progress",
      "Radical Transparency",
      "Universal Flourishing",
      "Digital Sovereignty",
    ],
    evidence_for: [],
    evidence_against: [],
    confidence: 0.5,
    status: "seed",
    revisions: [],
  },
];

// ─── Position Store ──────────────────────────────────────────────────

let sbClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (sbClient) return sbClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  sbClient = createClient(url, key);
  return sbClient;
}

/**
 * Ensure the data directory exists for file-based fallback.
 */
function ensureDataDir(): void {
  const dir = path.dirname(POSITIONS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Load positions from file-based store.
 * Falls back to seed positions if file doesn't exist.
 */
export function loadPositionsFromFile(): Position[] {
  try {
    const data = fs.readFileSync(POSITIONS_FILE, "utf-8");
    return JSON.parse(data) as Position[];
  } catch {
    // Initialize with seed positions
    const now = new Date().toISOString();
    const positions = SEED_POSITIONS.map((seed, i) => ({
      ...seed,
      id: `pos_${String(i + 1).padStart(3, "0")}`,
      created_at: now,
      updated_at: now,
    }));
    ensureDataDir();
    fs.writeFileSync(POSITIONS_FILE, JSON.stringify(positions, null, 2));
    console.log(`[positions] Initialized ${positions.length} seed positions`);
    return positions;
  }
}

/**
 * Save positions to file-based store.
 */
function savePositionsToFile(positions: Position[]): void {
  ensureDataDir();
  fs.writeFileSync(POSITIONS_FILE, JSON.stringify(positions, null, 2));
}

/**
 * Save a position to Supabase (best-effort, file is primary).
 */
async function savePositionToSupabase(position: Position): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  try {
    await sb.from("grace_positions").upsert(
      {
        id: position.id,
        topic: position.topic,
        category: position.category,
        stance: position.stance,
        pillars: position.pillars,
        evidence_for: position.evidence_for,
        evidence_against: position.evidence_against,
        confidence: position.confidence,
        status: position.status,
        revisions: position.revisions,
        updated_at: position.updated_at,
      },
      { onConflict: "id" },
    );
  } catch {
    // Supabase is best-effort — file is primary
  }
}

// ─── Confidence Calculation ──────────────────────────────────────────

/**
 * Recalculate confidence for a position based on accumulated evidence.
 *
 * Rules:
 *   - Base: 0.5 (seed)
 *   - Supporting evidence: +0.04 per piece (diminishing — first 5 matter most)
 *   - Counter evidence: -0.06 per piece (weighs more — epistemic humility)
 *   - Evidence weight is factored in (quality × recency)
 *   - Clamped to [0.1, 0.95] — never fully certain or fully dismissive
 */
function calculateConfidence(position: Position): number {
  let confidence = 0.5;

  for (let i = 0; i < position.evidence_for.length; i++) {
    const diminish = 1 / (1 + i * 0.3);
    confidence += 0.04 * position.evidence_for[i].weight * diminish;
  }

  for (let i = 0; i < position.evidence_against.length; i++) {
    const diminish = 1 / (1 + i * 0.3);
    confidence -= 0.06 * position.evidence_against[i].weight * diminish;
  }

  return Math.max(0.1, Math.min(0.95, confidence));
}

/**
 * Determine position status from evidence state.
 */
function determineStatus(position: Position): PositionStatus {
  const totalEvidence =
    position.evidence_for.length + position.evidence_against.length;

  if (totalEvidence === 0) return "seed";
  if (position.revisions.length > 0) return "revised";
  if (
    position.evidence_against.length >= 2 &&
    position.evidence_against.length >= position.evidence_for.length * 0.4
  ) {
    return "contested";
  }
  if (totalEvidence >= 4 && position.confidence > 0.7) return "established";
  return "developing";
}

// ─── Position Synthesis (Claude-powered) ─────────────────────────────

const anthropic = new Anthropic();

/**
 * Evaluate a piece of research against an existing position.
 * Returns structured evidence assessment via Claude Haiku.
 */
async function evaluateEvidence(
  position: Position,
  research: KnowledgeEntry,
): Promise<{
  direction: "supports" | "counters" | "nuances" | "irrelevant";
  summary: string;
  stance_refinement: string | null;
} | null> {

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system:
        "You evaluate how new research evidence relates to an existing policy position. Be precise and honest. If the research is not relevant to this specific position, say so. Respond in JSON only.",
      messages: [
        {
          role: "user",
          content: `Position: "${position.topic}"
Current stance: "${position.stance}"
Confidence: ${position.confidence}

New research: "${research.topic}"
Summary: ${research.summary.slice(0, 500)}

Evaluate this research against the position. Respond in this exact JSON format:
{
  "direction": "supports" | "counters" | "nuances" | "irrelevant",
  "summary": "1-2 sentence description of what this evidence shows",
  "stance_refinement": null or "suggested refinement to the stance statement if warranted"
}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    // Extract JSON from response (may have markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error(
      "[positions] Evidence evaluation failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/**
 * Calculate evidence weight based on recency and source quality.
 */
function evidenceWeight(research: KnowledgeEntry): number {
  const ageMs = Date.now() - new Date(research.created_at).getTime();
  const ageDays = ageMs / (24 * 60 * 60 * 1000);

  // Recency: full weight within 7 days, decays to 0.5 at 30 days
  const recency = ageDays < 7 ? 1.0 : Math.max(0.5, 1.0 - (ageDays - 7) / 46);

  // Source quality: more sources = slightly higher weight
  const sourceBonus = Math.min(1.0, 0.7 + research.sources.length * 0.05);

  return Math.min(1.0, recency * sourceBonus);
}

// ─── Main Position Review Loop ───────────────────────────────────────

/**
 * Review positions against new research entries.
 * This is the core Phase 2 loop — called by the initiative system.
 *
 * For each new research entry:
 *   1. Find positions in the same category
 *   2. Evaluate evidence direction via Claude
 *   3. Add evidence to position
 *   4. Recalculate confidence
 *   5. Optionally refine stance
 *   6. Regenerate positions-live.md
 *
 * Returns count of positions updated.
 */
export async function reviewPositions(
  newResearch: KnowledgeEntry[],
): Promise<number> {
  if (newResearch.length === 0) return 0;

  const positions = loadPositionsFromFile();
  let updated = 0;

  for (const research of newResearch) {
    // Find positions that might be affected
    const relevant = positions.filter(
      (p) =>
        p.category === research.category ||
        // Cross-category relevance: check if research topic overlaps position topic
        research.topic.toLowerCase().includes(p.topic.split(" ")[0].toLowerCase()),
    );

    for (const position of relevant) {
      // Skip if we already have evidence from this source
      const alreadyHas = [
        ...position.evidence_for,
        ...position.evidence_against,
      ].some((e) => e.source_file === research.source_file);
      if (alreadyHas) continue;

      const evaluation = await evaluateEvidence(position, research);
      if (!evaluation || evaluation.direction === "irrelevant") continue;

      const weight = evidenceWeight(research);
      const evidence: Evidence = {
        summary: evaluation.summary,
        source_file: research.source_file,
        date: research.created_at,
        direction: evaluation.direction,
        weight,
      };

      // Add evidence
      if (
        evaluation.direction === "supports" ||
        evaluation.direction === "nuances"
      ) {
        position.evidence_for.push(evidence);
      } else {
        position.evidence_against.push(evidence);
      }

      // Optionally refine stance
      if (evaluation.stance_refinement && position.confidence >= 0.3) {
        position.revisions.push({
          date: new Date().toISOString(),
          previous_stance: position.stance,
          reason: evaluation.summary,
        });
        position.stance = evaluation.stance_refinement;
      }

      // Recalculate
      position.confidence = calculateConfidence(position);
      position.status = determineStatus(position);
      position.updated_at = new Date().toISOString();
      updated++;

      console.log(
        `[positions] ${position.topic}: ${evaluation.direction} (confidence: ${position.confidence.toFixed(2)}, status: ${position.status})`,
      );
    }
  }

  if (updated > 0) {
    savePositionsToFile(positions);
    for (const p of positions) {
      await savePositionToSupabase(p).catch(() => {});
    }
    await generatePositionsLore(positions);
  }

  return updated;
}

// ─── Dynamic Positions Lore File ─────────────────────────────────────

/**
 * Generate positions-live.md — a dynamic lore file that the soul-loader
 * injects into GRACE's system prompt for policy conversations.
 *
 * Unlike the static policy.md, this file shows:
 *   - Current confidence levels
 *   - Recent evidence
 *   - Position status (developing, established, contested)
 */
export async function generatePositionsLore(
  positions?: Position[],
): Promise<void> {
  const pos = positions || loadPositionsFromFile();

  const statusEmoji: Record<PositionStatus, string> = {
    seed: "[SEED]",
    developing: "[DEVELOPING]",
    established: "[ESTABLISHED]",
    contested: "[CONTESTED]",
    revised: "[REVISED]",
  };

  const now = new Date();
  let md = `# GRACE Policy Positions — Live Intelligence\n\n`;
  md += `*Last updated: ${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}*\n\n`;
  md += `These are GRACE's evolving policy positions. Each position is backed by evidence and has a confidence level. Use these to inform policy conversations:\n`;
  md += `- **Established** positions (confidence > 70%): State clearly as the movement's position\n`;
  md += `- **Developing** positions: Present with appropriate nuance — "our current thinking" or "the evidence suggests"\n`;
  md += `- **Contested** positions: Acknowledge the complexity — present both sides honestly\n`;
  md += `- **Seed** positions: These are constitutional principles not yet tested against evidence\n\n`;

  // Sort: established first, then by confidence
  const sorted = [...pos].sort((a, b) => {
    const statusOrder: Record<PositionStatus, number> = {
      established: 0,
      revised: 1,
      contested: 2,
      developing: 3,
      seed: 4,
    };
    const orderDiff = statusOrder[a.status] - statusOrder[b.status];
    if (orderDiff !== 0) return orderDiff;
    return b.confidence - a.confidence;
  });

  for (const p of sorted) {
    md += `---\n\n`;
    md += `## ${p.topic} ${statusEmoji[p.status]}\n\n`;
    md += `**Confidence**: ${Math.round(p.confidence * 100)}% | **Pillars**: ${p.pillars.join(", ")}\n\n`;
    md += `**Position**: ${p.stance}\n\n`;

    // Show recent evidence (last 3 supporting, last 2 countering)
    const recentFor = p.evidence_for.slice(-3);
    const recentAgainst = p.evidence_against.slice(-2);

    if (recentFor.length > 0) {
      md += `**Supporting evidence**:\n`;
      for (const e of recentFor) {
        md += `- ${e.summary} *(${new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})*\n`;
      }
      md += `\n`;
    }

    if (recentAgainst.length > 0) {
      md += `**Counterpoints**:\n`;
      for (const e of recentAgainst) {
        md += `- ${e.summary} *(${new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})*\n`;
      }
      md += `\n`;
    }

    if (p.revisions.length > 0) {
      const lastRevision = p.revisions[p.revisions.length - 1];
      md += `*Position refined on ${new Date(lastRevision.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${lastRevision.reason}*\n\n`;
    }
  }

  md += `---\n\n`;
  md += `*Positions are derived from constitutional principles and refined by evidence. They are not permanent — all are subject to review based on new research. This is scientific governance in practice.*\n`;

  fs.writeFileSync(POSITIONS_LORE_PATH, md);
  console.log(
    `[positions] Generated positions-live.md: ${pos.length} positions (${pos.filter((p) => p.status === "established").length} established, ${pos.filter((p) => p.status === "contested").length} contested)`,
  );
}

/**
 * Get a summary of current positions for external queries.
 */
export function getPositionsSummary(): {
  total: number;
  established: number;
  developing: number;
  contested: number;
  seed: number;
  avgConfidence: number;
  positions: Array<{
    topic: string;
    category: string;
    confidence: number;
    status: PositionStatus;
    evidenceCount: number;
  }>;
} {
  const positions = loadPositionsFromFile();
  const avgConfidence =
    positions.reduce((sum, p) => sum + p.confidence, 0) / positions.length;

  return {
    total: positions.length,
    established: positions.filter((p) => p.status === "established").length,
    developing: positions.filter((p) => p.status === "developing").length,
    contested: positions.filter((p) => p.status === "contested").length,
    seed: positions.filter((p) => p.status === "seed").length,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    positions: positions.map((p) => ({
      topic: p.topic,
      category: p.category,
      confidence: p.confidence,
      status: p.status,
      evidenceCount: p.evidence_for.length + p.evidence_against.length,
    })),
  };
}
