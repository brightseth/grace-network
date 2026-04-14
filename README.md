# The Grace Network

The member-facing site for The Grace Network — a political movement and aspiring network state dedicated to AI governance, human flourishing, and aligned institutions. Home of GRACE, the organizing intelligence of the movement.

**Live:** https://grace-network.vercel.app

## What This Is

The Grace Network believes powerful technology must be developed safely, governed transparently, and directed toward the flourishing of all. We are Phase 1: the Constitution phase. Members sign seven Pillars and six inalienable rights; GRACE is the voice and operational backbone of the community.

## Architecture

- **Framework:** Astro + React (islands)
- **Styling:** Tailwind CSS
- **Database:** Supabase (members, signatures, workstream contributions)
- **Chat:** GRACE web-chat powered by the `/ask` endpoint on `seth.sethgoldstein.com/agents/grace/ask`
- **Deployment:** Vercel

## Repo Layout

- `src/pages/` — Astro routes (index, constitution, build, council, transparency)
- `src/components/` — React components (including GRACE chat widget)
- `src/layouts/` — Page layouts
- `agent/` — GRACE agent runtime, SOUL.md, tools, memory
- `public/` — Static assets, OG images

## SOUL.md — Two Files, One Agent

GRACE has two canonical SOUL files:
- `agent/SOUL.md` — **member-facing voice** (this site, Constitution, 7 Pillars, Council of Influences, web-chat registers)
- `~/.seth/agents/grace/SOUL.md` — **CMA crew identity** (relationships to SAL, SOLIENNE, ARCHIE, LEVI; role in fleet intelligence loop)

The two files are the same agent seen from two surfaces. Reconciled 2026-04-11. When they describe overlapping concepts, they should not contradict; when they differ, the `agent/SOUL.md` governs web-chat and the `.seth` file governs CMA runtime.

## Development

```bash
npm install
npm run dev   # localhost:4321
npm run build
```

Environment:
```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

## Next Phase

See `NEXT-PHASE.md` for Phase 9 launch-readiness work: global chat widget, context-aware GRACE greetings, share/invite mechanics, per-page OG images.
