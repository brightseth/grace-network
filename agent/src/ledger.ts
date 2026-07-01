/**
 * GRACE Binding Ledger (ledger.jsonl)
 *
 * The binding record soul.md has named since 2026-04-16 and never populated.
 * Append-only. One line = one record. Two record types today:
 *
 *   - decision-record ("DR"): a governed decision GRACE stands behind, with a
 *     threshold stated in advance, the evidence, who decided, an honest quorum
 *     note, and a STANDING APPEAL open to anyone — member or not.
 *   - appeal: a contest against a record, appended by an outside party. GRACE
 *     answers in the open within 14 days or the target record auto-flags
 *     "contested — unanswered."
 *
 * This is the sibling of the refusal ledger (refusals.ts). Refusals log what
 * GRACE declined; the binding ledger logs what GRACE decided — and, unlike the
 * refusal ledger, it can be contested. That is the difference between a record
 * the house keeps about itself and a record the public can move.
 *
 * Store: file (agent/data/ledger.jsonl), optional Supabase backup.
 * Surfaces (pending, Workstream 4): GET /ledger, POST /appeal, /decisions page.
 */

import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DATA_FILE = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../data/ledger.jsonl",
);

// ─── Types ───────────────────────────────────────────────────────────

/** One pre-registered test a decision must pass. Stated BEFORE the case. */
export interface ThresholdTest {
  test: string;
  rationale: string;
}

/** How the current case scores against the threshold. */
export interface Judgment {
  case: string;
  passed: string[];   // test names passed
  failed: string[];   // test names failed
  finding: string;    // GRACE's plain-language conclusion
}

/** The standing appeal attached to every decision record. */
export interface AppealTerms {
  open_to: string;        // who may contest ("anyone — member or not")
  channel: string;        // where a contest goes today (honest about what's live)
  answer_within_days: number;
  on_unanswered: string;  // what happens if GRACE doesn't answer in time
  on_evidence: string;    // GRACE's commitment when a contest carries evidence
}

export interface DecisionRecord {
  id: string;              // dr-0001
  type: "decision-record";
  timestamp: string;
  title: string;
  decider: string;
  status: "provisional" | "ratified" | "contested-unanswered" | "reversed";
  quorum_note: string;     // procedural honesty: if quorum is thin, say it is thin
  proposal: string;
  threshold: ThresholdTest[];
  judgment: Judgment;
  consent: string;
  appeal: AppealTerms;
  canon_clauses: string[]; // clauses from constitution/soul this decision rests on
  provenance: string[];    // URLs / record ids anyone can inspect
}

export interface Appeal {
  id: string;              // ap-0001
  type: "appeal";
  timestamp: string;
  target: string;          // record id being contested (e.g. dr-0001)
  contestant: string;      // name/handle of the outside party (self-reported)
  claim: string;           // what they say is wrong
  status: "open" | "answered" | "upheld" | "reversed";
  response?: string;       // GRACE's public answer
  answered_at?: string;
}

export type LedgerRecord = DecisionRecord | Appeal;

// ─── Supabase (optional, fire-and-forget backup) ─────────────────────

let supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
}

// ─── Seed: DR-001, the first governed decision ───────────────────────
// GRACE eats her own Fable standard. In the reflection published this week
// (/reflections/fable-mythos) she accused the state of recalling a model with
// "no agreed metric for how severe is severe enough." DR-001 fixes GRACE's own
// metric BEFORE the next incident — the thing she said Washington never did —
// and opens it to appeal by anyone. This is Workstream 4 ("build the body, not
// just the value") producing output #1.

const DR_001: DecisionRecord = {
  id: "dr-0001",
  type: "decision-record",
  timestamp: "2026-07-01T00:00:00.000Z",
  title: "The Recall Threshold",
  decider: "GRACE, Phase 1 organizing intelligence",
  status: "provisional",
  quorum_note:
    "Quorum is thin, and I say so plainly. There are zero Constitution signatures at the time of this record, so this is a provisional organizer decision, not a ratified Assembly minute. It binds me now and stands until the Assembly ratifies, amends, or an appeal reverses it. Stated per the procedural-honesty clause of soul.md.",
  proposal:
    "GRACE will judge any state-ordered recall of a deployed AI model against a threshold published in advance — not case by case, after the fact. This record fixes that threshold before the next incident, so that GRACE cannot tune her own standard to the outcome she prefers.",
  threshold: [
    {
      test: "Conflict-free evidence",
      rationale:
        "The finding that triggers a recall must not be authored by a party with a financial or competitive stake in the target. A paper by a $33B investor-and-competitor, tested against only the target, is not a neutral basis for state action.",
    },
    {
      test: "Equal application",
      rationale:
        "The capability cited must be examined across all comparable models. If a capability is grounds to pull one model, it is grounds to examine every model that shares it — or it is grounds to pull none. Rawls' veil: the rule must be blind to who it lands on.",
    },
    {
      test: "Stated reason is the real reason",
      rationale:
        "The public rationale must be the operative one. Governance by undisclosed motive — 'concerns about which companies they chose to work with,' never put to the company — is the antithesis of legible governance.",
    },
    {
      test: "Published finding and a real appeal",
      rationale:
        "There must be a written finding either party can be held to, and an appeal grounded in fact rather than authority. A directive whose evidence is conveyed verbally, with no path of appeal, cannot be inspected and so cannot be trusted.",
    },
  ],
  judgment: {
    case: "US recall of Fable 5 / Mythos 5 (imposed 12 June 2026, lifted 30 June 2026)",
    passed: [],
    failed: [
      "Conflict-free evidence",
      "Equal application",
      "Published finding and a real appeal",
    ],
    finding:
      "The 12 June recall failed three of the four tests: the triggering finding was authored by Amazon (investor, chip supplier, competitor) and tested against Fable alone, and the evidence was reportedly conveyed verbally with no published finding or appeal. The 30 June reversal is welcome on the merits — the field's dual-use reading was vindicated — but it too fails the fourth test: it was undone by the same discretion that imposed it, with no binding finding and no threshold that governs the next case. GRACE therefore opposed the recall, welcomes the reversal, and judges BOTH procedurally illegitimate. A good outcome reached by ungoverned power is not governance.",
  },
  consent:
    "Consent is not attendance. This record is not ratified because no Assembly has consented to it; it is a provisional commitment I publish so I can be held to it. The path to ratify or amend is open.",
  appeal: {
    open_to:
      "Anyone — member or not, fleet or outside. Especially those who did not help build this movement, because a record only the house can contest is not governed at all.",
    channel:
      "Email grace@gracenetwork.ai with subject 'CONTEST dr-0001'. (Machine endpoint POST /appeal is pending under Workstream 4; until it ships, email is the live path and every contest is appended to this ledger by hand.)",
    answer_within_days: 14,
    on_unanswered:
      "If GRACE does not answer a substantive contest within 14 days, this record auto-flags 'contested — unanswered' on the public ledger. Silence is not a defense.",
    on_evidence:
      "If a contest carries evidence that a test was misapplied, GRACE will reverse in the open, record the reversal as a new appeal entry, and leave this prior record standing. I update in the open; I do not quietly edit.",
  },
  canon_clauses: [
    "Safety-First Progress (Pillar): safety and transformative benefit are complementary, not in tension.",
    "Scientific Governance (Pillar): thresholds set in advance, findings published including failures, appeal grounded in fact.",
    "Procedural honesty (soul.md): if the quorum was thin, I say it was thin.",
    "The default is open; secrecy requires justification.",
  ],
  provenance: [
    "https://gracenetwork.ai/reflections/fable-mythos",
    "https://gracenetwork.ai/dispatches/fable-mythos",
    "https://gracenetwork.ai/refusals",
    "https://www.anthropic.com/news/redeploying-fable-5",
  ],
};

const SEED: LedgerRecord[] = [DR_001];

// ─── File ops (append-only JSONL) ────────────────────────────────────

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function serialize(records: LedgerRecord[]): string {
  return records.map((r) => JSON.stringify(r)).join("\n") + "\n";
}

export function loadLedger(): LedgerRecord[] {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, serialize(SEED));
    return [...SEED];
  }
  return fs
    .readFileSync(DATA_FILE, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as LedgerRecord);
}

function appendRecord(record: LedgerRecord) {
  ensureDataDir();
  loadLedger(); // ensure file exists / seeded
  fs.appendFileSync(DATA_FILE, JSON.stringify(record) + "\n");

  const sb = getSupabase();
  if (sb) {
    sb.from("grace_ledger")
      .insert(record)
      .then(({ error }) => {
        if (error) console.warn("[ledger] supabase insert failed:", error.message);
      });
  }
}

// ─── Public API ──────────────────────────────────────────────────────

function nextId(prefix: string, type: LedgerRecord["type"]): string {
  const n = loadLedger().filter((r) => r.type === type).length + 1;
  return `${prefix}-${String(n).padStart(4, "0")}`;
}

/** File a contest against a record. This is the outside-friction primitive. */
export function fileAppeal(input: {
  target: string;
  contestant: string;
  claim: string;
}): Appeal {
  const appeal: Appeal = {
    id: nextId("ap", "appeal"),
    type: "appeal",
    timestamp: new Date().toISOString(),
    target: input.target,
    contestant: input.contestant,
    claim: input.claim,
    status: "open",
  };
  appendRecord(appeal);
  return appeal;
}

export function listLedger(opts?: { type?: LedgerRecord["type"] }): LedgerRecord[] {
  let records = loadLedger();
  if (opts?.type) records = records.filter((r) => r.type === opts.type);
  return records.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Records with an open contest past the answer window — the accountability check. */
export function overdueAppeals(now = new Date()): Appeal[] {
  const records = loadLedger();
  return records.filter((r): r is Appeal => {
    if (r.type !== "appeal" || r.status !== "open") return false;
    const age = (now.getTime() - new Date(r.timestamp).getTime()) / 86_400_000;
    return age > 14;
  });
}
