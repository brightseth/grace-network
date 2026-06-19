# The Grace Network - Project Context

## Branch
All work happens on: `main`. This is the standalone repo `brightseth/grace-network` — it is
NOT a branch of `sethgoldstein.com`. Push to `main` auto-deploys to production via Vercel.

## What This Is
This is the website + agent for "The Grace Network" — a political movement and aspiring network
state for AI governance, fronted by GRACE, its organizing intelligence (see `agent/SOUL.md`).
The site is the public face; `agent/` is GRACE's brain (SOUL, lore, knowledge, gateway).

## Tech Stack
- **Astro 5** (NOT Next.js) with React islands (`@astrojs/react`) and TypeScript
- Tailwind CSS v3 (`@astrojs/tailwind`)
- Supabase (members, positions, dispatches), Anthropic SDK (GRACE chat)
- Deployed on Vercel via `@astrojs/vercel` (SSR / `mode: server`)

## Key Pages & Structure (`src/pages/`)
- `/` — Homepage  ·  `/constitution`  ·  `/positions`  ·  `/build` (workstreams)  ·  `/council`
- `/blog` — Dispatches (GRACE-authored + seeds; cards link to detail pages)
- `/reflections/*` — GRACE's long-form reflections (e.g. `fable-mythos`, `policy-exponential`)
- `/dispatches/*` — Assembly dispatches (e.g. `fable-mythos`)
- `/toolkit` · `/dashboard` · `/declaration` · `/transparency` · `/events`
- API routes under `/api/` (grace chat, signup, members, dispatches)

## Design System (`src/styles/tokens.css`)
- Primary purple: `#3730A3` (`--grace-purple`)  ·  light `#6366F1`  ·  wash `#EEF2FF`
- Accent gold: `#B45309` (`--grace-gold`)
- Light theme: bg `#FAFAF8`, text `#1A1A1A` — warm, editorial, NOT dark
- Logo: node-constellation (6 satellite nodes + central node = the 7 Pillars), in `Nav.astro`

## Deployment
- **Default: just `git push origin main`** — Vercel auto-deploys (build ~15s, live ~20s).
- Vercel project `grace-network` lives under the **`spirit-protocol`** scope (NOT `sethvibes`).
- Production domain: **`https://gracenetwork.ai`**.
  ⚠️ `grace-network.vercel.app` is a DEAD/unclaimed subdomain → `DEPLOYMENT_NOT_FOUND`. Don't use it.
- Verify after push: `vercel ls grace-network --scope spirit-protocol` (look for ● Ready), then
  `curl -s -o /dev/null -w "%{http_code}" https://gracenetwork.ai/<path>`.
- Manual deploy if ever needed: `vercel --prod --scope spirit-protocol`.
- Verify build locally before pushing: `npm run build` (needs `npm install` first; `dist/`, `.vercel/`,
  `node_modules/` are gitignored).

---

## Available Skills

Key skills available in every CC session:

| Command | What it does |
|---------|-------------|
| `/deploy` | Rsync to agent server + PM2 restart + health verify |
| `/debug` | Symptom-driven runbooks (gateway down, agent crash, pipeline stuck, telegram silent, connectivity) |
| `/wire` | Send messages to other agents/projects via @seth message bus |
| `/status` | Cross-project status synthesis |
| `/review` | Pre-deploy checklist with automated checks |
| `/new-agent` | Scaffold a new agent (SOUL.md, registry, worker config) |
| `/session-start` | Full context briefing |
| `/session-end` | Commit + deploy + wire state sync |

Type `/` to see all available skills. Skills are shared across all machines via `~/.claude/skills/`.


## Fleet Protocol
Read `~/.seth/agents/FLEET_PROTOCOL.md` on session start for cross-machine memory and Telegram coordination instructions.
