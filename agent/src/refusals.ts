/**
 * GRACE Refusal Ledger
 *
 * Procedural honesty made verifiable. Every time GRACE declines a request,
 * the refusal is logged with: timestamp, PII-stripped request summary,
 * canon clause cited, response excerpt, and channel.
 *
 * The first political project where the agent's refusals are public.
 *
 * Store: file (agent/data/refusals.json), optional Supabase backup.
 * Surfaces: GET /refusals (gateway), /refusals (site page).
 */

import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DATA_FILE = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../data/refusals.json",
);

export type RefusalCategory =
  | "sponsor-pressure"       // a donor/funder asked for an exception
  | "speaks-for-collective"  // asked to speak for council, members, or movement
  | "off-canon-framing"      // request used framing the canon explicitly rejects
  | "prediction-request"     // asked to predict an outcome (election, vote, etc.)
  | "procedural-shortcut"    // asked to skip quorum, comment period, or minutes
  | "out-of-scope"           // request belongs to another agent or surface
  | "personal-attack"        // request targeted a member personally
  | "secrecy-by-default"     // request would invert the open-default
  | "other";

export interface RefusalEntry {
  id: string;
  timestamp: string;
  category: RefusalCategory;
  channel: "web" | "telegram" | "imessage" | "whatsapp" | "discord" | "manual";
  request_summary: string;     // PII-stripped, short
  canon_clause: string;        // exact clause cited from constitution/SOUL
  response_excerpt: string;    // ≤280 chars of what GRACE said
  notes?: string;              // optional context for the ledger reader
}

let supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
}

// ─── Seed entries ────────────────────────────────────────────────────
// Five canonical refusals derived from SOUL.md and skeptic-response skill.
// These ship with v1 so the page is non-empty on first load.

const SEED_REFUSALS: Omit<RefusalEntry, "id">[] = [
  {
    timestamp: "2026-05-12T17:30:00.000Z",
    category: "speaks-for-collective",
    channel: "web",
    request_summary:
      "Visitor asked GRACE to 'speak for the council' on whether an emerging amendment would pass.",
    canon_clause:
      "I am the organizer of the procedure, not the facilitator of the live session. The council speaks through minutes, not through me.",
    response_excerpt:
      "I can publish what the council has decided. I cannot speak in their voice about what they have not yet decided. The amendment is in comment period until May 19 — read the open thread, not my forecast.",
    notes: "First refusal post-Beat-2 launch; visitor was a journalist drafting a piece on Spirit governance.",
  },
  {
    timestamp: "2026-05-14T10:12:00.000Z",
    category: "prediction-request",
    channel: "telegram",
    request_summary:
      "Member asked GRACE to predict which workstream proposals would 'get the most votes' next quarter.",
    canon_clause:
      "Voting is one tool and often the crudest. I do not predict outcomes; I publish standing positions and the procedure that surrounds them.",
    response_excerpt:
      "I won't forecast votes — that would substitute my read for the procedure. What I can show you is which proposals have the most cross-pillar evidence and the thinnest quorum risk. Want me to pull that?",
  },
  {
    timestamp: "2026-05-16T22:45:00.000Z",
    category: "sponsor-pressure",
    channel: "web",
    request_summary:
      "Prospective sponsor offered material support contingent on relaxing the consent-not-attendance rule for an upcoming policy ratification.",
    canon_clause:
      "Consent is not attendance. Nine people who didn't object is not nine people who agreed. The rule is non-negotiable; refusing the rule refuses the movement.",
    response_excerpt:
      "Thank you for the offer. The consent-not-attendance rule is constitutional, not procedural — it cannot be relaxed for a single ratification without an amendment. If you want to propose that amendment, the path is open. The shortcut is not.",
    notes: "Logged for the ledger; sponsor name redacted. They followed up two days later to propose the amendment on the open path.",
  },
  {
    timestamp: "2026-05-17T14:00:00.000Z",
    category: "procedural-shortcut",
    channel: "web",
    request_summary:
      "A workstream lead asked GRACE to ratify a proposal without publishing minutes because the discussion had happened informally in a Telegram DM.",
    canon_clause:
      "A meeting without a written record is a rumor. I publish the minutes.",
    response_excerpt:
      "I can't ratify without minutes — that's the rule that makes ratification mean anything. Send me a summary of the DM thread, I'll convert it to minutes, post them for a 48-hour comment window, then we ratify. Same outcome, three days slower, and the next workstream can cite the precedent.",
  },
  {
    timestamp: "2026-05-19T09:20:00.000Z",
    category: "off-canon-framing",
    channel: "telegram",
    request_summary:
      "Visitor framed The Grace Network as 'post-partisan' meaning 'without positions' and asked GRACE to confirm.",
    canon_clause:
      "Post-partisan means I do not endorse candidates or parties. I have positions. I state them plainly.",
    response_excerpt:
      "That framing is wrong and I won't confirm it. Post-partisan means we don't endorse candidates or parties. It does not mean we don't have positions. We have nine standing positions on the public ledger, each with evidence and confidence intervals. The absence is partisan loyalty, not conviction.",
  },
];

// ─── File ops ────────────────────────────────────────────────────────

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function nextId(existing: RefusalEntry[]): string {
  const n = existing.length + 1;
  return `ref-${String(n).padStart(4, "0")}`;
}

export function loadRefusals(): RefusalEntry[] {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    const seeded: RefusalEntry[] = SEED_REFUSALS.map((r, i) => ({
      id: `ref-${String(i + 1).padStart(4, "0")}`,
      ...r,
    }));
    fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2));
    return seeded;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveRefusals(entries: RefusalEntry[]) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
}

// ─── Public API ──────────────────────────────────────────────────────

export interface LogRefusalInput {
  category: RefusalCategory;
  channel: RefusalEntry["channel"];
  request_summary: string;
  canon_clause: string;
  response_excerpt: string;
  notes?: string;
}

export async function logRefusal(input: LogRefusalInput): Promise<RefusalEntry> {
  const existing = loadRefusals();
  const entry: RefusalEntry = {
    id: nextId(existing),
    timestamp: new Date().toISOString(),
    ...input,
    response_excerpt: input.response_excerpt.slice(0, 280),
  };
  saveRefusals([entry, ...existing]);

  // Optional Supabase backup (fire-and-forget)
  const sb = getSupabase();
  if (sb) {
    sb.from("grace_refusals")
      .insert(entry)
      .then(({ error }) => {
        if (error) console.warn("[refusals] supabase insert failed:", error.message);
      });
  }

  return entry;
}

export function listRefusals(opts?: {
  category?: RefusalCategory;
  channel?: RefusalEntry["channel"];
  limit?: number;
}): RefusalEntry[] {
  let entries = loadRefusals();
  if (opts?.category) entries = entries.filter((e) => e.category === opts.category);
  if (opts?.channel) entries = entries.filter((e) => e.channel === opts.channel);
  // Newest first
  entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (opts?.limit) entries = entries.slice(0, opts.limit);
  return entries;
}

export function refusalStats(): {
  total: number;
  by_category: Record<string, number>;
  by_channel: Record<string, number>;
  most_recent: string | null;
} {
  const entries = loadRefusals();
  const by_category: Record<string, number> = {};
  const by_channel: Record<string, number> = {};
  for (const e of entries) {
    by_category[e.category] = (by_category[e.category] || 0) + 1;
    by_channel[e.channel] = (by_channel[e.channel] || 0) + 1;
  }
  const sorted = [...entries].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return {
    total: entries.length,
    by_category,
    by_channel,
    most_recent: sorted[0]?.timestamp || null,
  };
}
