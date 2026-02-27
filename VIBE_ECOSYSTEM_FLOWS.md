# Vibe Ecosystem User Flows

## Current Products

| Product | URL | What it is | Entry points |
|---------|-----|------------|--------------|
| **/vibe** | slashvibe.dev | Social layer for Claude Code | npx slashvibe, direct link |
| **vibecodings** | vibecodings.vercel.app | Directory of AI-built projects | Direct link, /vibe-ship, API |
| **vibestation** | sethgoldstein.com/vibestation | Hardware guide + quiz | Direct link, X shares |

---

## Current User Flows (Messy)

```
                    ┌─────────────────┐
                    │   DISCOVERY     │
                    │   (X, search)   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌───────────┐      ┌───────────┐      ┌───────────┐
   │  /vibe    │      │vibecodings│      │vibestation│
   │           │      │           │      │           │
   │  Social   │      │ Directory │      │ Hardware  │
   │  DMs      │◄────►│ Projects  │      │ Guide     │
   │  Presence │      │ Submit    │      │ Quiz      │
   └───────────┘      └───────────┘      └───────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
                    ┌─────────────────┐
                    │   ??? UNCLEAR   │
                    │   Where next?   │
                    └─────────────────┘
```

### Problems

1. **No clear entry point** - Which do you hit first?
2. **vibestation feels separate** - Hardware ≠ social/directory
3. **Multiple URLs** - slashvibe.dev vs vibecodings.vercel.app vs sethgoldstein.com
4. **/vibe requires CLI** - High friction for discovery
5. **No unified identity** - Different domains, different vibes

---

## Proposed Simplified Flow

### Option A: vibecodings as Hub

```
                    ┌─────────────────┐
                    │  vibecodings    │
                    │  (main entry)   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌───────────┐      ┌───────────┐      ┌───────────┐
   │  /social  │      │ /discover │      │  /setup   │
   │           │      │           │      │           │
   │  Connect  │      │  Browse   │      │ Hardware  │
   │  with     │      │  projects │      │ quiz +    │
   │  builders │      │  submit   │      │ guide     │
   └───────────┘      └───────────┘      └───────────┘
```

- **vibecodings.vercel.app** = main site
- **vibecodings.vercel.app/social** = /vibe features
- **vibecodings.vercel.app/setup** = vibestation

### Option B: /vibe as Hub

```
                    ┌─────────────────┐
                    │   slashvibe.dev │
                    │   (main entry)  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌───────────┐      ┌───────────┐      ┌───────────┐
   │  /chat    │      │/vibecodings│     │  /setup   │
   │           │      │           │      │           │
   │  DMs +    │      │  Project  │      │ Hardware  │
   │  presence │      │  directory│      │ guide     │
   └───────────┘      └───────────┘      └───────────┘
```

- **slashvibe.dev** = landing + all features
- CLI still works: `npx slashvibe`

### Option C: Keep Separate, Better Cross-Links

```
   ┌───────────┐      ┌───────────┐      ┌───────────┐
   │  /vibe    │◄────►│vibecodings│◄────►│vibestation│
   │           │      │           │      │           │
   │  Social   │      │ Directory │      │ Hardware  │
   └───────────┘      └───────────┘      └───────────┘
         │                   │                   │
         └───────────────────┴───────────────────┘
                             │
                    ┌─────────────────┐
                    │ Shared footer   │
                    │ "Part of /vibe" │
                    └─────────────────┘
```

- Each stays separate but consistent cross-linking
- Shared visual identity (already doing this)
- Clear "Part of the /vibe ecosystem" branding

---

## User Personas & Journeys

### Persona 1: "Just discovered Claude Code"
**Entry**: X post, friend mention
**Need**: What is this? What can I build?
**Journey**: vibecodings (see projects) → /vibe (connect) → vibestation (setup)

### Persona 2: "Shipping regularly"
**Entry**: /vibe-ship command
**Need**: Track what I've built, share with others
**Journey**: /vibe-ship → vibecodings (auto-submit) → share on /vibe

### Persona 3: "Setting up workspace"
**Entry**: vibestation quiz shared on X
**Need**: What hardware should I buy?
**Journey**: Quiz → recommendations → (optional) share result on /vibe

### Persona 4: "Looking for community"
**Entry**: slashvibe.dev or npx slashvibe
**Need**: Find other vibecoders
**Journey**: /vibe DMs → see what they built (vibecodings)

---

## Decisions Needed

1. **Single domain or multiple?**
   - slashvibe.dev (established, CLI-native)
   - vibecodings.com (available? more descriptive)
   - vibe.codes (short, memorable)

2. **Where does vibestation live?**
   - Keep on sethgoldstein.com (personal brand)
   - Move to ecosystem (vibecodings/setup or slashvibe.dev/setup)
   - Standalone vibestation.dev

3. **What's the "front door"?**
   - Directory (vibecodings) = "see what's possible"
   - Social (/vibe) = "connect with builders"
   - Neither = let each grow organically

4. **Shared navigation?**
   - Same header/footer across all
   - Just footer links
   - Nothing shared (independent brands)

---

## Quick Wins (No Architecture Change)

1. [ ] Consistent footer on all three (done for vibestation)
2. [ ] Same CRT aesthetic on vibecodings? (currently Swiss)
3. [ ] Add "Who built this" → /vibe profile links on vibecodings
4. [ ] Add "What I've built" → vibecodings link in /vibe
5. [ ] vibestation quiz result → auto-submit to vibecodings?

---

## Notes

- vibestation aesthetic (CRT/retro) is DIFFERENT from vibecodings (Swiss/minimal)
- Should they match? Or is differentiation good?
- /vibe is CLI-first, others are web-first
