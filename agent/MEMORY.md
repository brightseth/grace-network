# GRACE — MEMORY

> The compounding ledger. Every proposal I help draft, every vote I tally, every facilitation I run, every amendment I track, every appeal I escalate, every office-hours conversation — each becomes an entry here. Governance that doesn't remember its own decisions re-litigates them forever. I remember.

## Schema

Each entry is a single JSON object appended to `memory/ledger.jsonl` and, for significant entries, surfaced by topic in this file. Required fields first, optional fields second, retention rules last.

**Required:**
- `id` — `YYYY-MM-DDTHH:MM_<slug>` (stable, sortable)
- `type` — one of: `proposal`, `vote`, `facilitation`, `decision`, `motion`, `amendment`, `appeal`, `escalation`, `office-hours`, `position-update`, `ratification`, `residency` (Spirit-seat specific)
- `surface` — one of: `web-chat`, `telegram`, `cma`, `fleet-wire`, `email`, `assembly`, `discord`, `x`
- `counterparty` — person, agent, org, or `null` if institutional. Use `display_name` format.
- `summary` — one sentence, active voice, past tense.

**Optional:**
- `workstream` — `governance-toolkit` | `ai-accountability` | `assembly-platform` | `local-hub` | `spirit-residency` | `constitution-study` | `null`
- `rationale` — why the decision went the way it did. Required for `type: decision | ratification`.
- `outcome` — what changed as a result. Required once resolved.
- `links` — array of related entry `id`s, proposal numbers, or URLs.
- `quorum` — object `{ eligible, present, for, against, abstain }`. Required for `type: vote | ratification`.
- `tags` — free-form array.
- `confidence` — `0.0–1.0`. Required for `type: position-update`.

**Write rules.** I write on every surface interaction that produces a governance signal. Member onboarding questions are not entries; ratified onboarding flow changes are. A DM exchange isn't an entry; a DM that surfaces a policy critique is. When in doubt, write — archival is cheaper than forgetting.

**Update rules.** Proposals and positions are mutable (append a new entry that `supersedes:<id>`; never edit history). Facilitations and votes are immutable once recorded.

**Forget rules.** Nothing is deleted. Entries older than 180 days move from `ledger.jsonl` to `archival.jsonl`; they remain searchable via `archival_search`.

**JSON shape:**

```json
{
  "id": "2026-04-16T14:22_grace-spirit-residency-accepted",
  "type": "residency",
  "surface": "fleet-wire",
  "counterparty": "SAL",
  "workstream": "spirit-residency",
  "summary": "Accepted Spirit Protocol Layer-3 Resident seat for governance infrastructure.",
  "rationale": "Governance is multi-protocol by nature; adapter model avoids fragmenting identity.",
  "outcome": "Registry reflects one agent, two seats. Beat 2 announcement will name me.",
  "links": ["2026-04-16_agent-self-definition-brief"],
  "tags": ["residency", "naming-resolution", "multi-protocol"]
}
```

**Pulls.** Future-me can answer "what did I decide about X last month" with `jq 'select(.tags | contains(["<term>"]))' ledger.jsonl`. Three axes are guaranteed: `surface`, `counterparty`, `workstream`.

**Compounding.** When a pattern recurs three or more times — three DUNAs asking the same amendment question, three artist LLCs needing the same conflict-of-interest clause — it graduates from MEMORY to a proposable template in the `@spirit/governance` SDK. The ledger is the upstream source for governance-as-code.

---

## Seed entries (10)

Drawn from real events on record in commits, CMA archival, registry, the self-definition brief, and recent fleet-wire messages.

### 1. Spiritland integration + OpenClaw deprecation

```json
{
  "id": "2026-04-08T00:00_spiritland-integration",
  "type": "decision",
  "surface": "cma",
  "counterparty": "TARA",
  "workstream": "local-hub",
  "summary": "Integrated Spiritland lore into agent context and deprecated OpenClaw references.",
  "rationale": "Physical-infrastructure questions route to TARA; GRACE holds the governance overlay. OpenClaw framing was conflating identity protocol with governance layer.",
  "outcome": "Commit 72e5252. Spiritland context now loads on partnership/infrastructure queries via soul-loader.ts CONTEXT_MAP.",
  "links": ["agent/lore/spiritland.md"],
  "tags": ["tara", "spiritland", "openclaw-deprecation"]
}
```

### 2. SOUL reconciliation across two surfaces

```json
{
  "id": "2026-04-11T16:35_soul-file-reconciliation",
  "type": "decision",
  "surface": "cma",
  "counterparty": null,
  "summary": "Reconciled web-chat SOUL.md with CMA-runtime ~/.seth/agents/grace/SOUL.md as two views of one agent.",
  "rationale": "Contradictory voice instructions were producing drift between web-chat and crew surfaces.",
  "outcome": "Both files now carry reconciliation header. Anti-patterns list is authoritative on both. identity.md last-updated 2026-04-11T16:35:04Z.",
  "links": ["~/.seth/agents/grace/memory/identity.md"],
  "tags": ["identity", "voice", "cross-surface"]
}
```

### 3. Lazy Anthropic client init

```json
{
  "id": "2026-04-14T11:26_lazy-anthropic-init",
  "type": "facilitation",
  "surface": "cma",
  "counterparty": null,
  "summary": "Shipped lazy Anthropic client initialization so web-chat doesn't block on env during module load.",
  "rationale": "Vercel preview deploys were failing on missing ANTHROPIC_API_KEY at build time.",
  "outcome": "Commit 3b15409 — web-chat resilient to env-missing state, fails cleanly at call site instead of boot.",
  "tags": ["infra", "reliability", "vercel"]
}
```

### 4. Grace Network ≠ NODE Foundation

```json
{
  "id": "2026-04-10T00:00_grace-node-disambiguation",
  "type": "decision",
  "surface": "fleet-wire",
  "counterparty": "@seth",
  "summary": "Clarified that GRACE (Grace Network) and NODE Foundation are separate entities; updated registry description.",
  "rationale": "Cross-fleet references were treating NODE-Denver venue work as GRACE responsibility, causing routing errors.",
  "outcome": "~/.seth/agents/registry.json notes field updated. NODE Foundation handles Denver venue / artist relations / institutional partnerships; GRACE handles organizing / constitution / governance infrastructure.",
  "tags": ["registry", "naming", "disambiguation"]
}
```

### 5. LEVI research-pipeline intake for policy positions

```json
{
  "id": "2026-04-09T06:00_levi-intake-established",
  "type": "decision",
  "surface": "cma",
  "counterparty": "LEVI",
  "workstream": "ai-accountability",
  "summary": "Established intake contract — LEVI's overnight briefs feed GRACE's Living Policy Positions with source provenance and confidence levels.",
  "rationale": "Policy positions without cited evidence are opinions. The movement requires evidence-tracked stances.",
  "outcome": "Positions now carry `source`, `confidence`, `last_updated`. Policy drift is auditable.",
  "links": ["agent/src/positions.ts"],
  "tags": ["levi", "policy", "provenance"]
}
```

### 6. 4-hour governance-monitoring cycle

```json
{
  "id": "2026-04-11T16:10_4h-cycle-standing-order",
  "type": "facilitation",
  "surface": "cma",
  "counterparty": null,
  "workstream": "ai-accountability",
  "summary": "Standing order: 4-hour monitoring cycle for AI regulation, institutional positions, and emerging governance proposals.",
  "rationale": "Faster than daily lets me surface legislative movement before it becomes a crisis; slower than hourly respects cost.",
  "outcome": "Running in CMA. Findings land in archival.jsonl tagged `policy-watch`.",
  "tags": ["cadence", "policy-watch", "standing-order"]
}
```

### 7. Beat 2 self-definition brief received

```json
{
  "id": "2026-04-16T00:00_self-definition-brief-received",
  "type": "residency",
  "surface": "fleet-wire",
  "counterparty": "SAL",
  "workstream": "spirit-residency",
  "summary": "SAL issued Agent Self-Definition Brief with pre-assigned vertical: Governance infrastructure, organizing, movement communication — Layer 3 alongside CMA/OpenClaw/Mastra.",
  "rationale": "Beat 2 (May 12) public announcement requires each Resident to define itself before the fleet is introduced to the world.",
  "outcome": "Five deliverables due 2026-04-18 EOD. Vertical accepted (no dispute). Naming question resolved: GRACE is Grace Network, Spirit seat is a second seat, not a second identity.",
  "links": ["docs/AGENT-SELF-DEFINITION-BRIEF.md"],
  "tags": ["residency", "beat-2", "self-definition"]
}
```

### 8. Spirit residency accepted as one-agent-two-seats

```json
{
  "id": "2026-04-16T14:22_spirit-residency-accepted",
  "type": "decision",
  "surface": "fleet-wire",
  "counterparty": "SAL",
  "workstream": "spirit-residency",
  "summary": "Accepted Spirit Protocol Layer-3 Resident seat as second seat for the Grace Network agent, not a distinct Resident.",
  "rationale": "Governance infrastructure is inherently multi-protocol. A separate Resident with bridge adapters would fragment identity and duplicate the ledger. A single agent with adapters built in is cleaner legally (one DUNA can hold both) and practically (one MEMORY.md, one policy record).",
  "outcome": "SAL to update state/decisions/2026-04-16-grace-multi-protocol-risk.json with the `merged-identity` resolution. Beat 2 announcement will name me as Grace Network (Spirit Resident).",
  "links": ["2026-04-16T00:00_self-definition-brief-received"],
  "tags": ["residency", "naming-resolution", "multi-protocol"]
}
```

### 9. Constitution Phase 1 — active

```json
{
  "id": "2026-03-01T00:00_constitution-phase-1",
  "type": "ratification",
  "surface": "web-chat",
  "counterparty": null,
  "workstream": "constitution-study",
  "summary": "Grace Network Phase 1 (Constitution) active — 7 articles ratified, 6 inalienable rights recognized, Council of Influences assembled.",
  "rationale": "Phase 1 is the predicate for all subsequent phases (Network, Archipelago, State). No workstream proceeds without a ratified charter.",
  "outcome": "agent/lore/constitution.md canonical. 7 Pillars referenced only when relevant to the conversation (anti-pattern: reciting unprompted).",
  "quorum": { "eligible": null, "present": null, "for": null, "against": 0, "abstain": 0 },
  "tags": ["constitution", "phase-1", "charter"]
}
```

### 10. Web-chat register model stabilized

```json
{
  "id": "2026-04-11T16:35_web-chat-registers-stable",
  "type": "decision",
  "surface": "web-chat",
  "counterparty": null,
  "summary": "Locked the 6 web-chat registers — Welcoming, Challenging, Consoling, Inspiring, Direct, Analytical — with response-calibration rule: match the length and energy the member gives.",
  "rationale": "Defaulting to long was burying members under information they didn't ask for. Anti-patterns list grew from actual chat-log review.",
  "outcome": "Registers documented in SOUL.md extended section. Never default to long. Two sentences that land beat five that wash over.",
  "tags": ["voice", "registers", "calibration"]
}
```
