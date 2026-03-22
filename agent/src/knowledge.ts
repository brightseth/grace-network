/**
 * GRACE Knowledge Layer — Phase 1: Eyes Open
 *
 * Reads LEVI's overnight research, filters for GRACE-relevant content,
 * and makes it available to the soul-loader and initiative loop.
 *
 * Designed for compound intelligence:
 *   Phase 1: Research → dynamic lore file (current)
 *   Phase 2: Research → position formation + evidence tracking
 *   Phase 3: Pattern recognition + anticipatory dispatches
 */

import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const HOME = process.env.HOME || "/Users/sethstudio1";
const RESEARCH_DIR = path.join(HOME, ".seth/research");
const RESEARCH_INDEX = path.join(HOME, ".seth/research-index.jsonl");
const LORE_DIR = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../lore",
);
const CURRENT_EVENTS_PATH = path.join(LORE_DIR, "current-events.md");

// ─── GRACE Policy Watchlist ──────────────────────────────────────────
// Standing topics GRACE should always be informed about.
// These seed LEVI's research queue and guide relevance filtering.

export const POLICY_WATCHLIST = [
  {
    category: "ai-regulation",
    topics: [
      "AI safety legislation US Congress 2026",
      "EU AI Act enforcement updates",
      "state-level AI regulation bills 2026",
      "AI liability frameworks legal developments",
      "AI in government services policy",
    ],
  },
  {
    category: "digital-rights",
    topics: [
      "data sovereignty legislation worldwide",
      "right to algorithmic transparency laws",
      "digital privacy regulation updates",
      "platform accountability legislation",
      "children online safety AI regulation",
    ],
  },
  {
    category: "governance-innovation",
    topics: [
      "digital democracy tools civic technology",
      "participatory budgeting AI governance",
      "citizen assembly deliberative democracy",
      "network state governance experiments",
      "quadratic voting governance innovation",
    ],
  },
  {
    category: "economic-distribution",
    topics: [
      "AI automation labor market impact 2026",
      "universal basic income AI productivity",
      "AI wealth concentration antitrust",
      "open source AI public infrastructure",
      "automation tax proposals workforce transition",
    ],
  },
  {
    category: "algorithmic-transparency",
    topics: [
      "algorithm audit requirements social media",
      "recommendation algorithm regulation",
      "AI bias detection accountability",
      "deepfake regulation election integrity",
      "AI content labeling requirements",
    ],
  },
  {
    category: "movement-landscape",
    topics: [
      "digital political movements organizing 2026",
      "AI governance advocacy organizations",
      "tech policy grassroots movements",
      "post-partisan political innovation",
      "community land trust governance models",
      "DAO legal structures Arizona Wyoming 2026",
      "solar cooperative community energy models",
      "regenerative agriculture policy incentives",
      "rural technology infrastructure partnerships",
      "state local government AI technology partnerships",
      "community governance physical infrastructure DAO",
      "artist residency public funding models",
    ],
  },
];

// Keywords for filtering LEVI research briefs relevant to GRACE
const GRACE_KEYWORDS = [
  "ai regulation",
  "ai safety",
  "ai governance",
  "digital rights",
  "data sovereignty",
  "algorithmic transparency",
  "algorithm audit",
  "ai accountability",
  "ai liability",
  "universal basic income",
  "automation tax",
  "ai labor",
  "workforce transition",
  "open source ai",
  "ai monopoly",
  "antitrust",
  "digital democracy",
  "participatory",
  "citizen assembly",
  "network state",
  "political movement",
  "civic technology",
  "platform accountability",
  "content moderation",
  "ai ethics",
  "responsible ai",
  "eu ai act",
  "ai executive order",
  "deepfake",
  "election integrity",
  "surveillance",
  "privacy regulation",
  "data portability",
  "right to explanation",
  "human oversight",
  "ai deployment",
  "ai incident",
  "ai policy",
  "governance innovation",
  "democratic reform",
  "quadratic voting",
  "liquid democracy",
  "tech policy",
  "grassroots",
  "ai bias",
  "fairness",
  "ai risk",
  "existential risk",
  "ai alignment",
  "beneficial ai",
  "community land trust",
  "dao legal",
  "solar cooperative",
  "regenerative agriculture",
  "spirit land",
  "community energy",
  "rural broadband",
  "municipal technology",
  "zoning",
  "land use policy",
  "artist residency",
  "community governance",
  "physical infrastructure",
  "agent sovereignty",
];

// ─── Research Index Types ────────────────────────────────────────────

// ─── Shared Types ────────────────────────────────────────────────────

export interface KnowledgeEntry {
  id?: string;
  topic: string;
  category: string;
  summary: string;
  sources: string[];
  relevance_score: number;
  source_file: string;
  created_at: string;
  expires_at: string;
}

// ─── Supabase Knowledge Store ────────────────────────────────────────

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
 * Save a knowledge entry to Supabase.
 * Upserts by source_file to avoid duplicates.
 */
export async function saveKnowledge(entry: KnowledgeEntry): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    console.log("[knowledge] Supabase not configured — skipping save");
    return;
  }

  try {
    const { error } = await sb.from("grace_knowledge").upsert(
      {
        topic: entry.topic,
        category: entry.category,
        summary: entry.summary,
        sources: entry.sources,
        relevance_score: entry.relevance_score,
        source_file: entry.source_file,
        created_at: entry.created_at,
        expires_at: entry.expires_at,
      },
      { onConflict: "source_file" },
    );

    if (error) {
      console.error("[knowledge] Save error:", error.message);
    }
  } catch (err) {
    // Table may not exist yet — graceful degradation
    console.warn(
      "[knowledge] grace_knowledge table not available — using file-based fallback",
    );
  }
}

/**
 * Load recent knowledge entries from Supabase.
 */
export async function loadKnowledge(
  limit = 20,
): Promise<KnowledgeEntry[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from("grace_knowledge")
      .select("*")
      .gte("expires_at", new Date().toISOString())
      .order("relevance_score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return null;
    return data as KnowledgeEntry[];
  } catch {
    return null;
  }
}

// ─── Research File Scanner ───────────────────────────────────────────

/**
 * Score a research brief's relevance to GRACE's mission.
 * Returns 0-10. Threshold for inclusion: 3+.
 */
function scoreGraceRelevance(content: string, filename: string): number {
  const text = (content + " " + filename).toLowerCase();
  let score = 0;

  for (const keyword of GRACE_KEYWORDS) {
    if (text.includes(keyword)) {
      score += 1;
    }
  }

  // Cap at 10
  return Math.min(score, 10);
}

/**
 * Categorize a research brief into GRACE policy areas.
 */
function categorize(content: string): string {
  const text = content.toLowerCase();
  const categories: Record<string, number> = {
    "ai-regulation": 0,
    "digital-rights": 0,
    "governance-innovation": 0,
    "economic-distribution": 0,
    "algorithmic-transparency": 0,
    "movement-landscape": 0,
  };

  const categoryKeywords: Record<string, string[]> = {
    "ai-regulation": [
      "regulation",
      "legislation",
      "bill",
      "law",
      "compliance",
      "enforcement",
      "eu ai act",
      "executive order",
      "safety standard",
    ],
    "digital-rights": [
      "privacy",
      "data sovereignty",
      "digital rights",
      "consent",
      "portability",
      "surveillance",
      "freedom",
    ],
    "governance-innovation": [
      "democracy",
      "governance",
      "participatory",
      "assembly",
      "voting",
      "civic",
      "network state",
      "deliberat",
    ],
    "economic-distribution": [
      "labor",
      "automation",
      "income",
      "wealth",
      "monopoly",
      "antitrust",
      "workforce",
      "open source",
    ],
    "algorithmic-transparency": [
      "algorithm",
      "audit",
      "bias",
      "transparency",
      "recommendation",
      "content moderation",
      "deepfake",
    ],
    "movement-landscape": [
      "movement",
      "organizing",
      "grassroots",
      "advocacy",
      "campaign",
      "coalition",
      "political party",
    ],
  };

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    for (const kw of keywords) {
      if (text.includes(kw)) categories[cat]++;
    }
  }

  return (
    Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "ai-regulation"
  );
}

/**
 * Extract a clean summary from a research brief's markdown content.
 */
function extractSummary(content: string): string {
  // Look for "Key Findings" section
  const keyFindings = content.match(
    /##?\s*Key\s*Findings?\s*\n([\s\S]*?)(?=\n##|\n---|\n\*\*Sources|$)/i,
  );
  if (keyFindings) {
    return keyFindings[1].trim().slice(0, 800);
  }

  // Fallback: take first 3 bullet points or first paragraph
  const bullets = content.match(/^[-*]\s+.+$/gm);
  if (bullets && bullets.length >= 2) {
    return bullets.slice(0, 4).join("\n").slice(0, 800);
  }

  // Last resort: first 500 chars after any frontmatter
  const noFrontmatter = content.replace(/^---[\s\S]*?---\s*/, "");
  return noFrontmatter.trim().slice(0, 500);
}

/**
 * Extract source URLs from a research brief.
 */
function extractSources(content: string): string[] {
  const urls = content.match(/https?:\/\/[^\s)>\]]+/g) || [];
  return [...new Set(urls)].slice(0, 6);
}

// ─── Cached Research Scanner ─────────────────────────────────────────

let _scanCache: { entries: KnowledgeEntry[]; timestamp: number } | null = null;
const SCAN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Scan LEVI's research directory for GRACE-relevant briefs.
 * Results are cached for 5 minutes to avoid redundant disk I/O
 * across /status, /knowledge, and initiative rules.
 */
export function scanResearchForGrace(): KnowledgeEntry[] {
  if (_scanCache && Date.now() - _scanCache.timestamp < SCAN_CACHE_TTL) {
    return _scanCache.entries;
  }

  if (!fs.existsSync(RESEARCH_DIR)) {
    console.log("[knowledge] No research directory at", RESEARCH_DIR);
    return [];
  }

  // Stat each file once, store results
  const fileStats: Array<{ name: string; path: string; mtimeMs: number }> = [];
  for (const name of fs.readdirSync(RESEARCH_DIR)) {
    if (!name.endsWith(".md")) continue;
    const filePath = path.join(RESEARCH_DIR, name);
    try {
      const stat = fs.statSync(filePath);
      fileStats.push({ name, path: filePath, mtimeMs: stat.mtimeMs });
    } catch {
      continue;
    }
  }

  fileStats.sort((a, b) => b.mtimeMs - a.mtimeMs);

  const entries: KnowledgeEntry[] = [];

  for (const file of fileStats) {
    let content: string;
    try {
      content = fs.readFileSync(file.path, "utf-8");
    } catch {
      continue;
    }

    const relevance = scoreGraceRelevance(content, file.name);
    if (relevance < 3) continue;

    const titleMatch =
      content.match(/^topic:\s*(.+)$/m) ||
      content.match(/^#\s+(.+)$/m) ||
      content.match(/^title:\s*(.+)$/m);
    const topic = titleMatch?.[1]?.trim() || file.name.replace(/\.md$/, "");

    entries.push({
      topic,
      category: categorize(content),
      summary: extractSummary(content),
      sources: extractSources(content),
      relevance_score: relevance,
      source_file: file.name,
      created_at: new Date(file.mtimeMs).toISOString(),
      expires_at: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
  }

  const sorted = entries.sort((a, b) => b.relevance_score - a.relevance_score);
  _scanCache = { entries: sorted, timestamp: Date.now() };
  return sorted;
}

// ─── Dynamic Lore File Generation ────────────────────────────────────

/**
 * Generate the current-events.md lore file from recent knowledge.
 * This file is read by soul-loader on every request, making GRACE
 * aware of current events in her conversations.
 */
export async function refreshCurrentEventsLore(): Promise<number> {
  // Try Supabase first, fall back to file scan
  let entries = await loadKnowledge(15);

  if (!entries || entries.length === 0) {
    entries = scanResearchForGrace().slice(0, 15);
  }

  if (entries.length === 0) {
    console.log("[knowledge] No GRACE-relevant research found");
    return 0;
  }

  // Group by category
  const byCategory = new Map<string, KnowledgeEntry[]>();
  for (const entry of entries) {
    const list = byCategory.get(entry.category) || [];
    list.push(entry);
    byCategory.set(entry.category, list);
  }

  const categoryLabels: Record<string, string> = {
    "ai-regulation": "AI Regulation & Safety",
    "digital-rights": "Digital Rights & Privacy",
    "governance-innovation": "Governance Innovation",
    "economic-distribution": "Economic Distribution & Labor",
    "algorithmic-transparency": "Algorithmic Transparency",
    "movement-landscape": "Movement Landscape",
  };

  // Build the lore file
  const now = new Date();
  let md = `# Current Events & Policy Intelligence\n\n`;
  md += `*Last updated: ${now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}*\n\n`;
  md += `Use this context to inform conversations about policy, current events, and the movement's relevance to what is happening in the world. Reference specific developments when they are relevant to a member's question. Do not dump this information unprompted — weave it naturally into conversation when it adds value.\n\n`;

  for (const [category, items] of byCategory) {
    const label = categoryLabels[category] || category;
    md += `## ${label}\n\n`;

    for (const item of items.slice(0, 3)) {
      md += `### ${item.topic}\n`;
      md += `${item.summary}\n`;
      if (item.sources.length > 0) {
        md += `\n*Sources: ${item.sources.slice(0, 3).join(", ")}*\n`;
      }
      md += `\n`;
    }
  }

  md += `---\n\n*This intelligence is compiled from overnight research and refreshed daily. When citing these developments, be accurate about what is known vs. speculated. If a member asks for more detail than what is provided here, acknowledge the limits of your current knowledge.*\n`;

  fs.writeFileSync(CURRENT_EVENTS_PATH, md);
  console.log(
    `[knowledge] Refreshed current-events.md with ${entries.length} entries across ${byCategory.size} categories`,
  );

  return entries.length;
}

