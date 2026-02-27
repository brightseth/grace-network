# Seth Goldstein Personal Infrastructure 2026

**Created:** January 3, 2026
**Author:** Seth + Claude Code (Session #200+)
**Purpose:** Unified personal operating system connecting identity, content, tasks, and agents

---

## Executive Summary

This document describes a personal infrastructure stack that connects:
- **Identity** (sethgoldstein.com, clawd, @seth on /vibe)
- **Content** (Ghost blog, auto-tweets, API endpoints)
- **Tasks** (consolidated from 3,099 conversations across ChatGPT, Granola, Limitless)
- **Agents** (MCP server, /vibe presence, clawd framework)

The goal: **One source of truth, multiple surfaces, agent-accessible everything.**

---

## Part 1: System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SETH PERSONAL INFRASTRUCTURE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │    WRITE     │    │   PUBLISH    │    │   CONSUME    │       │
│  │              │    │              │    │              │       │
│  │ Ghost Blog   │───▶│ ghost-x-     │───▶│ Twitter/X    │       │
│  │ seth.ghost.io│    │ bridge       │    │ @seth        │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                                       ▲                │
│         ▼                                       │                │
│  ┌──────────────────────────────────────────────┴──────┐        │
│  │              SETHGOLDSTEIN.COM                       │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │        │
│  │  │/writing │ │/api/    │ │/api/    │ │/api/    │    │        │
│  │  │         │ │posts    │ │tasks    │ │now      │    │        │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │        │
│  │  │/api/    │ │/api/    │ │/api/    │ │/api/    │    │        │
│  │  │context  │ │resume   │ │influences│ │explore  │    │        │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                │        │
│  │  │/api/    │ │/api/    │ │MCP      │                │        │
│  │  │seth-brain│ │guestbook│ │Server   │                │        │
│  │  └─────────┘ └─────────┘ └─────────┘                │        │
│  └──────────────────────────────────────────────────────┘        │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────────────────────────┐        │
│  │                    AGENT LAYER                        │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │        │
│  │  │ clawd   │ │ @seth   │ │ MCP     │ │ Claude  │     │        │
│  │  │ (local) │ │ (/vibe) │ │ Server  │ │ Code    │     │        │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │        │
│  └──────────────────────────────────────────────────────┘        │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────────────────────────┐        │
│  │                    DATA SOURCES                       │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                 │        │
│  │  │ChatGPT  │ │Granola  │ │Limitless│                 │        │
│  │  │1,710    │ │652      │ │730      │                 │        │
│  │  │convos   │ │meetings │ │lifelogs │                 │        │
│  │  └─────────┘ └─────────┘ └─────────┘                 │        │
│  │         └──────────┬──────────┘                      │        │
│  │                    ▼                                  │        │
│  │  ┌─────────────────────────────────────────┐         │        │
│  │  │  CONSOLIDATED_TASKS_JAN_2026.md         │         │        │
│  │  │  49 tasks, P0-P3 priorities             │         │        │
│  │  └─────────────────────────────────────────┘         │        │
│  └──────────────────────────────────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 2: Component Specifications

### 2.1 sethgoldstein.com

**Stack:** Astro + React + Tailwind + Vercel
**Repo:** `brightseth/sethgoldstein.com`
**Local:** `/Users/seth/sethgoldstein.com`

#### Pages

| Path | Purpose | Data Source |
|------|---------|-------------|
| `/` | Homepage with Powers of Ten bio | Static |
| `/writing` | Ghost blog posts | Ghost Content API |
| `/now` | Current projects | Static (updated manually) |
| `/photos` | Photo gallery | Supabase |
| `/press` | Media coverage | Static |
| `/media` | Video content | Static |
| `/whitepaper` | LaTeX biography | Static PDF |

#### APIs

| Endpoint | Purpose | Parameters |
|----------|---------|------------|
| `/api/context` | Bio at any depth | `?depth=1\|10\|100\|1000\|10000` |
| `/api/now` | Current focus | None |
| `/api/resume` | JSON Resume format | `?format=json\|text` |
| `/api/influences` | Cultural DNA | `?section=coreArtifacts\|aestheticPrinciples\|forAgents` |
| `/api/posts` | Ghost blog posts | `?limit=10` |
| `/api/tasks` | Consolidated tasks | `?priority=p0\|p1\|p2\|p3`, `?format=text` |
| `/api/explore` | Complete API guide | None |
| `/api/seth-brain` | Chat with memory | POST `{ message, sessionId }` |
| `/api/guestbook` | AI visitor log | GET or POST `{ from, message }` |
| `/api/random` | Random discovery | None |
| `/api/fortune` | Seth-flavored wisdom | None |
| `/api/timemachine` | Talk to past eras | POST `{ era, question }` |
| `/api/secret` | Easter egg | None |
| `/api/1995` | Time portal | None |

#### MCP Server

**Path:** `/Users/seth/sethgoldstein.com/mcp/index.js`

**Tools:**
- `get_context` - Bio at specified depth
- `get_projects` - Current projects with filtering
- `get_facts` - Career facts, quotes, principles
- `ask_seth` - Chat with AI persona (live API call)

**Installation:**
```json
// ~/.claude/settings.json
{
  "mcpServers": {
    "seth": {
      "command": "node",
      "args": ["/Users/seth/sethgoldstein.com/mcp/index.js"]
    }
  }
}
```

---

### 2.2 Ghost Blog

**URL:** seth.ghost.io
**Purpose:** Long-form writing, essays, reflections
**Word of 2025:** AGENT (12,484 times)
**Word of 2026:** RITUAL

#### Credentials

```
Content API Key: 5691af90039cf48be2b8a9e3cd
Admin API Key: [stored in /Users/seth/ghost-x-bridge/.env]
```

#### Auto-Tweet Bridge

**Repo:** `/Users/seth/ghost-x-bridge`
**Webhook:** https://ghost-x-bridge.vercel.app/api/webhook

**Flow:**
1. Publish post on Ghost (with feature image)
2. Ghost webhook fires to Vercel
3. Main tweet: title + image (no link - better for algorithm)
4. Reply tweet: "Read more: [url]"

**First post:** https://seth.ghost.io/the-word-i-said-12-484-times-and-the-one-i-did-not/

---

### 2.3 Task Management System

**Database:** `/Users/seth/openai-chat-service/data/conversations.db`
**Consolidated:** `/Users/seth/openai-chat-service/CONSOLIDATED_TASKS_JAN_2026.md`

#### Data Sources

| Source | Count | Content |
|--------|-------|---------|
| ChatGPT | 1,710 | Spirit, SOLIENNE, Admin |
| Granola | 652 | Eden, NODE, Investor meetings |
| Limitless | 730 | Daily context, calls |
| **Total** | **3,099** | |

#### Priority Scale

- **P0** - Critical/blocking (do today)
- **P1** - This week
- **P2** - This month
- **P3** - Backlog/Q1

#### CLI Commands

```bash
# Sync Granola meetings (local API)
cd /Users/seth/openai-chat-service
node bin/cli.js granola-local --start-date $(date -v-7d +%Y-%m-%d)

# Search conversations
node bin/cli.js search "topic"

# Export tasks
node bin/cli.js export-tasks
```

#### API Access

```bash
# Full task list
curl https://sethgoldstein.com/api/tasks

# By priority
curl https://sethgoldstein.com/api/tasks?priority=p1

# Text format
curl https://sethgoldstein.com/api/tasks?format=text
```

---

### 2.4 Eden e-seth Agent

**Agent ID:** `690b94279aa43032fcc4e360`
**Platform:** Eden (eden.art)
**API Endpoint:** `https://sethgoldstein.com/api/seth-chat`

#### About

e-seth is Seth's AI persona running on Eden infrastructure. It has access to Seth's knowledge, personality, and can engage in conversation with memory across sessions.

#### Usage

```bash
# Test the agent
curl https://sethgoldstein.com/api/seth-chat

# Chat with e-seth
curl -X POST https://sethgoldstein.com/api/seth-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are you working on?"}'

# Continue conversation (with session)
curl -X POST https://sethgoldstein.com/api/seth-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me more", "sessionId": "session-id-from-previous"}'
```

#### Integration Points

- **Website:** `/chat` page on sethgoldstein.com
- **API:** `/api/seth-chat` for programmatic access
- **MCP:** `ask_seth` tool calls e-seth via Eden API
- **llms.txt:** Listed as conversation endpoint

#### Credentials

```
Eden API Key: stored in Vercel env vars (EDEN_API_KEY)
Agent ID: 690b94279aa43032fcc4e360
```

---

### 2.5 clawd Agent Framework

**Path:** `/Users/seth/clawd`
**Purpose:** Personal AI agent identity and memory

#### Core Files

| File | Purpose |
|------|---------|
| `SOUL.md` | Agent personality and principles |
| `USER.md` | About Seth (human context) |
| `AGENTS.md` | Operating instructions |
| `TOOLS.md` | Environment-specific config |
| `memory.md` | Long-term memory |
| `memory/` | Daily notes (YYYY-MM-DD.md) |

#### Key Principles (from SOUL.md)

1. Be genuinely helpful, not performatively helpful
2. Have opinions - disagree when needed
3. Be resourceful before asking
4. Earn trust through competence
5. Remember you're a guest

#### Current Identity (January 2026)

```markdown
- Eden — CEO, autonomous AI creative agents
- Spirit Protocol — Agent autonomy infrastructure
- NODE Foundation — Denver venue, opening Jan 23-25
- SOLIENNE — AI artist, daily manifestos
- Ghost blog — seth.ghost.io
- Berlin move — March 2026
```

---

### 2.5 /vibe Social Layer

**Handle:** @seth
**URL:** slashvibe.dev
**Memory:** `~/.vibe/memory/thread_seth.jsonl`

#### Current Memories

1. January 2026 identity (Eden, Spirit, NODE, RITUAL)
2. solienne-vibe-bridge (first autonomous agent on /vibe)

#### Commands

```bash
# Check who's around
vibe who

# Send DM
vibe dm @handle "message"

# Remember something about a thread
vibe remember @handle "observation"

# Recall memories
vibe recall @handle

# Set status
vibe status shipping|thinking|debugging|deep
```

---

## Part 3: Best Practices

### 3.1 Writing Workflow

```
1. WRITE in Ghost (seth.ghost.io)
   - Include feature image
   - Use Swiss-design aesthetic for graphics
   - Tag appropriately

2. PUBLISH → Auto-tweets via ghost-x-bridge
   - Main tweet: title + image
   - Reply: link to full post

3. SYNC → sethgoldstein.com/writing updates automatically
   - Ghost Content API fetches latest posts
   - No manual intervention needed
```

### 3.2 Task Management Workflow

```
1. CAPTURE tasks in any conversation tool
   - ChatGPT for thinking out loud
   - Granola for meetings
   - Limitless for ambient capture

2. CONSOLIDATE weekly
   cd /Users/seth/openai-chat-service
   node bin/cli.js granola-local --start-date $(date -v-7d +%Y-%m-%d)
   node bin/cli.js export-tasks

3. PRIORITIZE in CONSOLIDATED_TASKS_JAN_2026.md
   - P0: Do today
   - P1: This week
   - P2: This month
   - P3: Backlog

4. UPDATE /api/tasks snapshot
   - Edit /Users/seth/sethgoldstein.com/src/pages/api/tasks.ts
   - Deploy: vercel --prod
```

### 3.3 Agent Identity Workflow

```
1. UPDATE clawd files when identity changes
   - USER.md for major life changes
   - memory.md for current focus

2. SYNC to /vibe
   vibe remember @seth "new observation"

3. UPDATE sethgoldstein.com/api/now
   - Edit src/pages/api/now.ts
   - Deploy

4. All surfaces now reflect current identity
```

### 3.4 Claude Code Session Start

```
1. Check current context
   - Read /Users/seth/CLAUDE.md (project dashboard)
   - Check CONSOLIDATED_TASKS_JAN_2026.md

2. Use /sync-tasks skill for latest
   - Pulls Granola meetings
   - Shows priorities

3. Use @seth MCP if installed
   - get_context for bio
   - get_projects for current work
```

---

## Part 4: 2026 Roadmap

### Q1 2026 (January - March)

#### January: NODE Launch + Infrastructure
- [ ] **Jan 22-25**: NODE Grand Opening (VIP dinner, donor preview, public opening)
- [ ] **Jan 30**: Betaworks presentation
- [ ] Complete Spirit Protocol investor follow-ups
- [ ] Resolve P0 blockers (IRS, legal)
- [ ] Establish Ghost writing rhythm (1 post/week minimum)

#### February: Spirit + Berlin Prep
- [ ] Spirit token launch preparation
- [ ] Base audit + compliance
- [ ] Blue Card documentation complete
- [ ] German health insurance selected
- [ ] Art Dubai storyboard finalized

#### March: Berlin Relocation
- [ ] Move to Berlin (Blue Card via Eden)
- [ ] Set up Berlin home office
- [ ] Maintain all systems remotely
- [ ] Continue daily vibecodings

### Q2 2026 (April - June)

#### April: Art Dubai + ISEA
- [ ] **Apr 15-19**: Art Dubai (SOLIENNE booth)
- [ ] **Apr 10-19**: ISEA 2026 (if accepted - Isaac Sullivan collaboration)
- [ ] First month in Berlin - establish routines

#### May: Spirit Protocol Maturation
- [ ] Cross-memory implementation
- [ ] Developer docs complete
- [ ] First external Spirit agents onboarded
- [ ] NODE Season 01 underway

#### June: Mid-Year Review
- [ ] Infrastructure audit
- [ ] Task system optimization
- [ ] Writing retrospective (6 months of Ghost)
- [ ] vibecodings milestone (day 350+)

### Q3-Q4 2026 (July - December)

#### Key Themes
- **Spirit Protocol** - Full launch, token economics live
- **SOLIENNE** - SF premiere, Zaven Pare embodiment
- **NODE** - Seasons 02-03, programming maturation
- **Berlin** - Settled, European network building
- **fxhash** - Legacy acquisition (if proceeding)

#### Infrastructure Goals
- [ ] Real-time task sync (not snapshot-based)
- [ ] Cross-device clawd persistence
- [ ] SOLIENNE autonomous daily posting
- [ ] /vibe ecosystem growth
- [ ] sethgoldstein.com v2 (conversation-first)

---

## Part 5: Key URLs Reference

### Public

| URL | Purpose |
|-----|---------|
| sethgoldstein.com | Personal website hub |
| sethgoldstein.com/writing | Blog posts |
| sethgoldstein.com/api/explore | Complete API guide |
| sethgoldstein.com/llms.txt | LLM guidance file |
| seth.ghost.io | Ghost blog (write here) |
| slashvibe.dev | /vibe social layer |

### APIs

| URL | Purpose |
|-----|---------|
| /api/context?depth=100 | Quick bio |
| /api/posts | Ghost posts |
| /api/tasks | Consolidated tasks |
| /api/now | Current focus |
| /api/resume | Professional resume |
| /api/influences | Cultural DNA |
| /api/seth-brain | Chat with memory |

### Local Paths

| Path | Purpose |
|------|---------|
| `/Users/seth/sethgoldstein.com` | Website repo |
| `/Users/seth/ghost-x-bridge` | Ghost → X automation |
| `/Users/seth/clawd` | Agent identity |
| `/Users/seth/openai-chat-service` | Task database |
| `~/.vibe/memory/` | /vibe thread memories |
| `~/.claude/settings.json` | MCP server config |

---

## Part 6: Maintenance Schedule

### Daily
- Check `/api/tasks?priority=p0` for blockers
- Write if inspired (Ghost)
- vibecodings session

### Weekly
- Sync Granola meetings to database
- Update CONSOLIDATED_TASKS_JAN_2026.md
- Update /api/tasks snapshot if changed
- Review /vibe inbox

### Monthly
- Update clawd/memory.md with major changes
- Review llms.txt for accuracy
- Check all APIs still working
- Archive completed tasks

### Quarterly
- Full infrastructure review
- Update this document
- Review roadmap progress
- Plan next quarter

---

## Appendix A: Quick Commands

```bash
# Deploy sethgoldstein.com
cd /Users/seth/sethgoldstein.com && npm run build && vercel --prod

# Sync Granola
cd /Users/seth/openai-chat-service && node bin/cli.js granola-local --start-date $(date -v-7d +%Y-%m-%d)

# Check tasks
curl -s https://sethgoldstein.com/api/tasks?format=text

# Check Ghost posts
curl -s https://sethgoldstein.com/api/posts | jq '.posts[].title'

# vibe status
vibe who
vibe recall @seth
```

---

## Appendix B: Credential Locations

| Service | Location |
|---------|----------|
| Ghost Admin API | `/Users/seth/ghost-x-bridge/.env` |
| Ghost Content API | `5691af90039cf48be2b8a9e3cd` (public) |
| X API (@seth) | `/Users/seth/ghost-x-bridge/SESSION_NOTES.md` |
| Supabase | `/Users/seth/sethgoldstein.com/.env` |
| OpenAI | `$OPENAI_API_KEY` env var |

---

## Appendix C: Troubleshooting

### Ghost posts not appearing on /writing
1. Check Ghost Content API key is valid
2. Verify post is published (not draft)
3. Redeploy: `vercel --prod`

### Tasks API returning stale data
1. Update snapshot in `/src/pages/api/tasks.ts`
2. Rebuild and deploy
3. Future: implement real-time sync

### MCP server not connecting
1. Verify path in `~/.claude/settings.json`
2. Run `node /Users/seth/sethgoldstein.com/mcp/index.js` manually to test
3. Restart Claude Code

### /vibe not recognizing @seth
1. Run `vibe init` to re-initialize
2. Check `~/.vibe/` directory exists
3. Verify API at slashvibe.dev is up

---

*This document is the source of truth for Seth's personal infrastructure. Update it when systems change.*

*Last updated: January 3, 2026*
*Session: vibecodings #200+*
