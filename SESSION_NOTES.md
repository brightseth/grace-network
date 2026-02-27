# Session Notes - sethgoldstein.com

## Session: January 4, 2026 (Part 2) - Personal System Organization

### What's Live

**New Pages**:
- `/projects` - Top projects with live URLs (replaces vibecodings links)
- `/now` - Updated with current focus, Berlin move March 2026

**Planning Documents**:
- `/Users/seth/SETH_PERSONAL_SYSTEM_PLAN_JAN_4_2026.md` - Complete architecture

### What Changed

1. **Removed vibecodings links** - Footer links now point to `/projects`
2. **Created /projects page** - Clean list of current + past projects
3. **Updated /now page** - Fixed date, Berlin move, vibecoding practice

### Seth-Outside vs Seth-Inside

Documented the full personal system architecture:

**Seth-Outside (Public)**:
- sethgoldstein.com (this site)
- @seth (Twitter)
- Ghost blog, LinkedIn, Instagram

**Seth-Inside (Private)**:
- @seth v2 agent (`/Users/seth/seth-agent/`)
- clawd/clawdis (agent framework)
- Task database (3,099 conversations)
- /vibe (social layer)

### Files Modified

- `public/vibestation.html` - Footer: vibecodings → /projects
- `public/vibestation-quiz.html` - Footer: vibecodings → /projects
- `src/pages/now.astro` - Updated date, location, vibecoding practice
- `src/pages/projects.astro` - NEW: Top 10 projects page

---

## Session: January 4, 2026 - Vibestation CRT Rebrand + Ship

### What's Live

**Vibestation** - Hardware guide for vibe coders
- **URL**: https://sethgoldstein.com/vibestation.html
- **Brand Guide**: https://sethgoldstein.com/vibestation-brand.html
- **Survey**: https://sethgoldstein.com/vibestation-survey.html

### What Shipped

1. **CRT Retro Aesthetic** - Complete visual overhaul of Vibestation:
   - Phosphor green (#33FF33) + Amber (#FFB000) + Spirit Blue (#6B8FFF) palette
   - Scanline overlay effect (CSS repeating-linear-gradient)
   - Boot sequence animation on page load
   - IBM Plex Mono + VT323 pixel typography
   - Terminal-style prompts (`> COMPUTE`, `> INPUT`)
   - CRT glow effects (text-shadow, box-shadow)
   - Konami code easter egg (↑↑↓↓←→←→BA → amber mode)
   - ASCII-style clipboard export format

2. **Brand Bible** - `/VIBESTATION_BRAND_BIBLE.md`
   - Color palette documentation
   - Typography system
   - Logo concepts (cursor, ASCII box, prompt)
   - Viral mechanics (shareable cards, quiz, badges)
   - Voice guidelines
   - Ecosystem positioning (vibecodings + /vibe + vibestation)

3. **Interactive Brand Demo** - `/public/vibestation-brand.html`
   - Boot sequence demo
   - Color swatches with glow effects
   - Typography specimens
   - Logo variations
   - Component examples

### Deployed

**Production**: https://sethgoldstein.com
**Final Commit**: 77ef72b - Fix 13 broken Amazon links + mobile improvements
**Deployed**: January 4, 2026

### Ecosystem Planning

- Created `/Users/seth/VIBE_ECOSYSTEM_PLAN_JAN_4_2026.md`
- Decision: /vibe (slashvibe.dev) is the platform hub
- vibecodings → will migrate to slashvibe.dev/projects
- vibestation → stays on sethgoldstein.com (personal brand)

### Next Steps (When Returning)

1. Add /projects route to slashvibe.dev
2. Migrate vibecodings directory data
3. Set up redirects
4. Build user profiles (/u/[handle])

---

## Session: November 28, 2025 - DNS Fix + Production Deployment

### What's Live

**Domain**: https://sethgoldstein.com (DNS fixed, pointing to Vercel)

**Pages**:
- `/` - Homepage with Powers of Ten timeline
- `/photos` - Photo gallery with 1,292 favorites from Cloudinary
- `/live` - LiveAvatar AI conversation (embed ID: `0f80c3d2-6547-48a1-8a28-ac59d168790b`)
- `/press` - Press/media mentions
- `/media` - Video content

### Technical Stack
- **Framework**: Astro 5 + Vercel
- **Photos**: Cloudinary (`seth-favorites/` folder)
- **Avatar**: LiveAvatar embed (`https://embed.liveavatar.com/v1/{ID}`)
- **Repo**: `/Users/seth/Documents/GitHub/sethgoldstein.com/`

### What We Fixed Today
1. DNS A record: Changed from old IP (`216.150.1.1`) to Vercel (`76.76.21.21`) in Squarespace
2. Upgraded Astro 4 → 5 (fixed `nodejs18.x` runtime deprecation error)
3. Changed Astro output from `hybrid` to `server` (Astro 5 breaking change)
4. Deployed photo gallery + navigation updates (PHOTOS + TALK links)
5. Restored LiveAvatar iframe embed (was accidentally switched to HeyGen SDK)
6. Added `.vercelignore` to skip 5GB `photo-export/` folder

### Photo Curation Mode
- URL: `https://sethgoldstein.com/photos?curate=true`
- Click X on photos to hide, copy JSON, paste into `public/photos-curation.json`

### Key Files
- `/src/pages/live.astro` - Avatar page (LiveAvatar embed)
- `/src/pages/photos.astro` - Photo gallery with curator mode
- `/public/photos-manifest.json` - 1,292 Cloudinary URLs
- `/src/components/PowersOfTen.astro` - Homepage navigation

### Commits This Session
- Upgrade to Astro 5 + fix Vercel deployment
- Add photo gallery (/photos) with 1,292 images + TALK/PHOTOS navigation
- Multiple LiveAvatar embed fixes

### Next Steps
- [ ] Curate photos (remove unwanted via curator mode)
- [ ] Update LiveAvatar to use Seth's custom avatar (need correct embed ID from dashboard)
- [ ] Add memory system back (Honcho integration was in HeyGen SDK version)

---

## Session: November 27, 2025 - Thanksgiving Morning (Photo Gallery + Curation)

### Accomplishments

**1. Photo Gallery Built (`/photos`)**
- 1,292 favorite photos from 2024-2025 uploaded to Cloudinary overnight
- Interactive gallery: shuffle, grid toggle (S/M/L), lightbox
- Keyboard navigation (arrows, escape, H to hide in curator mode)
- Touch swipe support on mobile
- Infinite scroll with lazy loading
- Cloudinary transformations for optimized thumbnails

**2. Curator Mode Added**
- Access via `/photos?curate=true`
- Red X buttons to hide photos on hover
- Floating panel shows hidden photos as JSON array
- Press H in lightbox to quickly hide while browsing
- Copy List → paste into `public/photos-curation.json`
- Hidden photos won't appear for regular visitors

**3. Navigation Updated**
- Added **PHOTOS** and **TALK** to homepage nav bar
- Photos → `/photos`
- Talk → `/live` (HeyGen avatar)

**4. DNS Fixed for sethgoldstein.com**
- TXT record `00854219` added correctly to root domain
- Was incorrectly set on `sethgoldstein.com.sethgoldstein.com` (host field wrong)
- Fixed to use `@` as host
- Vercel support notified - awaiting domain verification

### Files Created/Modified
- `/src/pages/photos.astro` - New photo gallery with curator mode
- `/public/photos-manifest.json` - 1,292 Cloudinary image URLs
- `/public/photos-curation.json` - Curation config (hidden/featured)
- `/src/components/PowersOfTen.astro` - Added Photos/Talk nav links
- `/photo-export/upload-to-cloudinary.py` - Cloudinary upload script
- `/photo-export/convert-for-web.sh` - HEIC/PNG → JPEG conversion

### Photo Curation Workflow
1. Go to http://localhost:4323/photos?curate=true
2. Browse and click X on photos to hide
3. Click "Copy List" in curator panel
4. Edit `public/photos-curation.json`, paste array into "hidden"
5. Deploy - hidden photos won't show

### Next Steps
- [ ] Curate photos (remove any you don't want public)
- [ ] Wait for Vercel domain verification (replied to support)
- [ ] Deploy to production once domain ready
- [ ] Create custom HeyGen Interactive Avatar (using Wayne placeholder)

---

## Session: November 26, 2025 - LiveAvatar + Memory Integration

### Overview
Integrated conversation memory system into sethgoldstein.com/live page using Honcho API + local fallback architecture. Built server-side API routes for storing LiveAvatar transcripts and retrieving context for returning users.

---

## What Was Built

### 1. Memory API - `/api/honcho/session`

**Location**: `/Users/seth/Documents/GitHub/sethgoldstein.com/src/pages/api/honcho/session.js`

**Functionality**:
- **POST endpoint**: Store conversation messages (user + avatar responses)
- **GET endpoint**: Retrieve conversation context for returning users
- **Dual-mode architecture**: Local in-memory (default) + Honcho cloud (ready when provisioned)

**API Design**:
```javascript
// Store message
POST /api/honcho/session
Body: { userId, message, isUser: boolean }
Returns: { success, sessionId, mode: 'local'|'honcho' }

// Get context
GET /api/honcho/session?userId={userId}
Returns: { context: "Previous conversation..." | null }
```

**Architecture**:
- Uses v2 Honcho API (`https://api.honcho.dev/v2`) via direct fetch calls
- Falls back to local Map-based storage if Honcho unavailable
- Stores last 50 messages per user in local mode
- Retrieves last 20 messages from up to 5 recent sessions in Honcho mode

### 2. Astro Configuration Updates

**Location**: `/Users/seth/Documents/GitHub/sethgoldstein.com/astro.config.mjs`

**Changes**:
```javascript
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid',      // Enable server-side routes
  adapter: vercel(),     // Deploy to Vercel serverless
  integrations: [tailwind(), react()],
  server: { host: true, port: 4321 }
});
```

**Dependencies Added**:
- `@astrojs/vercel@7.8.2` - Vercel serverless adapter
- `honcho-ai@0.2.0` - Honcho SDK (installed but not used - using direct v2 API instead)

### 3. Documentation Updates

**Location**: `/Users/seth/Documents/GitHub/sethgoldstein.com/docs/AVATAR_PLATFORM_COMPARISON.md`

**Added Sections**:
- Memory System Architecture (lines 12-50)
- API Endpoints documentation
- Environment variables reference
- Local vs Honcho mode comparison

**Key Documentation**:
```
HONCHO_ENABLED=true|false        # Default: false (local mode)
HONCHO_WORKSPACE=workspace-id    # Your Honcho workspace
HONCHO_API_KEY=hch-v2-...        # Your Honcho API key
```

### 4. React Component Created (Not Yet Active)

**Location**: `/Users/seth/Documents/GitHub/sethgoldstein.com/src/components/SethAvatarWithMemory.tsx`

**Purpose**: React wrapper for memory-enabled avatar conversations (created for future integration)

---

## Technical Details

### Memory Storage Flow

**Local Mode (Default)**:
1. User sends message via LiveAvatar iframe
2. Transcript event fires (`user.transcription_ended`)
3. Client calls `POST /api/honcho/session` with userId + message
4. Server stores in `Map<userId, messages[]>` (in-memory)
5. Persists during server runtime only
6. Returning users get context via `GET /api/honcho/session?userId=X`

**Honcho Mode (When Enabled)**:
1. Same client flow as local mode
2. Server calls `POST /v2/workspaces/{workspace}/sessions/{session}/messages`
3. Messages persist in Honcho cloud
4. Retrieves from last 5 sessions (up to 20 messages total)
5. Survives server restarts

### Error Handling

**Graceful Degradation**:
- Honcho API errors → Falls back to local storage
- Missing workspace → Uses local mode
- Network failures → Logs warning, continues with local
- 409 conflict (existing session) → Retrieves existing session

**Logging**:
```javascript
[Honcho] → POST https://api.honcho.dev/v2/workspaces/.../sessions
[Honcho] ← 200 OK
[Honcho] ✅ Session created: user-123/session-1732644000
[Memory] ✅ Stored local message for user-123 (5 total)
```

### Build Verification

**Command**: `npm run build`
**Status**: ✅ Success

**Output**:
```
prerendering static routes: /art, /live, /media, /press, /index, /upload
Bundling function ../../_functions/entry.mjs
Server built in 1.62s
Build Complete!
```

**Server Routes**:
- `/api/honcho/session` (POST + GET) → Serverless function

---

## Current Status

### Working
- ✅ `/live` page with LiveAvatar iframe embed
- ✅ Memory API in local mode (works immediately)
- ✅ POST /api/honcho/session (stores messages)
- ✅ GET /api/honcho/session (retrieves context)
- ✅ Graceful fallback to local storage
- ✅ Production build passing
- ✅ Ready to deploy to Vercel

### Pending
- ⏳ Honcho workspace provisioning (API returns 500 for new workspaces)
- ⏳ Set `HONCHO_ENABLED=true` in production environment
- ⏳ Verify workspace credentials with Honcho team
- ⏳ Domain setup (Vercel support case #854219)

### Not Yet Implemented
- [ ] Client-side integration (LiveAvatar SDK event listeners)
- [ ] Automatic transcript capture on `user.transcription_ended` events
- [ ] Context injection into LiveAvatar prompts
- [ ] Analytics dashboard for conversation tracking

---

## Environment Configuration

### Production Environment Variables (Vercel)

**Required for Local Mode** (works now):
```bash
# No environment variables required - uses in-memory storage
```

**Required for Honcho Mode** (when ready):
```bash
HONCHO_ENABLED=true
HONCHO_WORKSPACE=seth-avatar-dev  # or custom workspace name
HONCHO_API_KEY=hch-v2-jyfj84fv3sx6vjs6k46llcgb4ihmlskqzjwcauy7np09bl4cy9oqrlbdsh73ehg4
```

**Optional**:
```bash
# LiveAvatar credentials (already configured)
LIVEAVATAR_API_KEY=a1220cc4-230a-41b1-849e-27d3fa0808d8
LIVEAVATAR_AVATAR_ID=0f80c3d2-6547-48a1-8a28-ac59d168790b
```

---

## Git Status

### Uncommitted Changes
```
Modified:
  astro.config.mjs          # Added Vercel adapter + hybrid output
  package.json              # Added @astrojs/vercel dependency
  package-lock.json         # Dependency tree updated

Untracked:
  .astro/                   # Build cache (gitignored)
  .gitignore                # Added .astro/ to ignore
  docs/AVATAR_PLATFORM_COMPARISON.md      # Memory system docs
  docs/LIVEAVATAR_HONCHO_INTEGRATION.md   # Integration guide
  src/components/SethAvatarWithMemory.tsx # React component
  src/pages/api/honcho/session.js         # Memory API
```

### Recent Commits
```
0bec00e - Update /live page: black bg, white Helvetica bold caps
1eb06a1 - Update /live page with new LiveAvatar embed and site styling
7504fdc - Add /live page with LiveAvatar AI conversation embed
b0206ae - Initial commit - Seth Goldstein personal website
```

---

## Next Steps

### Immediate (Next Session)

1. **Contact Honcho Team**
   - Verify workspace provisioning: `seth-avatar-dev`
   - Confirm API key permissions for v2 API
   - Test workspace creation endpoint

2. **Deploy to Vercel**
   ```bash
   git add astro.config.mjs package.json package-lock.json .gitignore
   git add src/pages/api/ docs/ src/components/
   git commit -m "Add memory system: Honcho API + local fallback"
   git push origin main
   # Vercel auto-deploys from main branch
   ```

3. **Configure Production Environment**
   - Set `HONCHO_ENABLED=true` when workspace ready
   - Add `HONCHO_WORKSPACE` and `HONCHO_API_KEY` to Vercel env vars
   - Test POST/GET endpoints in production

### Short-term (This Week)

4. **Client-Side Integration**
   - Add LiveAvatar SDK event listeners to `/live` page
   - Capture `user.transcription_ended` events
   - Auto-store user messages via POST endpoint
   - Capture `avatar.transcription_ended` events
   - Auto-store avatar responses via POST endpoint

5. **Context Injection**
   - Retrieve context on session start via GET endpoint
   - Inject into LiveAvatar prompt configuration
   - Test returning user recognition

6. **Testing**
   - Test local mode: Multiple conversations, message retrieval
   - Test Honcho mode: Persistence across server restarts
   - Test fallback: Honcho failure → local storage

### Medium-term (Next 2 Weeks)

7. **Analytics Dashboard**
   - Track conversation counts per user
   - Identify common questions/topics
   - Monitor avatar response quality
   - Flag gaps in knowledge base

8. **Domain Setup**
   - Resolve Vercel support case #854219
   - Configure DNS for sethgoldstein.com
   - Update all URLs from preview to production

9. **Advanced Features**
   - Consider HeyGen Interactive Avatars (better SDK)
   - Explore D-ID for custom avatar images
   - Test Hume AI for emotional intelligence layer

---

## Architecture Notes

### Why Direct v2 API vs SDK?

**Problem**: Honcho SDK v0.2.0 only supports deprecated v1 API
**Solution**: Direct fetch calls to v2 API (`https://api.honcho.dev/v2`)

**Trade-offs**:
- ✅ Uses latest v2 API features
- ✅ No SDK version dependency issues
- ✅ Full control over request/response handling
- ❌ No type safety from SDK
- ❌ Manual error handling required

### Why Local + Honcho Dual Mode?

**Reason**: Honcho workspace provisioning is manual process

**Benefits**:
- ✅ Works immediately in local mode (no waiting)
- ✅ Seamless upgrade to Honcho when ready
- ✅ Fallback if Honcho has downtime
- ✅ Development environment doesn't need Honcho credentials

**Local Mode Limitations**:
- Data persists only during server runtime
- Lost on server restart/redeploy
- Not suitable for production long-term
- Max 50 messages per user (memory constraint)

### Why Hybrid Astro Output?

**Requirement**: Need server-side API routes for memory storage

**Alternative Considered**:
- Static site + external API (Node.js Express) → More complexity
- Fully server-rendered → Slower static pages

**Hybrid Benefits**:
- ✅ Static pages (fast): /index, /art, /media, /press
- ✅ Server routes (dynamic): /api/honcho/session
- ✅ Single codebase
- ✅ Vercel serverless deployment

---

## Links

### Production
- **Live Page**: https://sethgoldstein.com/live (pending domain setup)
- **Preview**: https://sethgoldstein-com.vercel.app/live (current)

### Development
- **Local Server**: http://localhost:4321/live
- **API Endpoints**:
  - http://localhost:4321/api/honcho/session (POST)
  - http://localhost:4321/api/honcho/session?userId=test (GET)

### Documentation
- **Memory System**: `/docs/AVATAR_PLATFORM_COMPARISON.md`
- **Integration Guide**: `/docs/LIVEAVATAR_HONCHO_INTEGRATION.md`
- **Project README**: `/README.md`

### External
- **LiveAvatar Docs**: https://docs.liveavatar.ai
- **Honcho Docs**: https://docs.honcho.dev
- **Vercel Support**: Case #854219 (domain setup)

---

## Files Modified This Session

```
/Users/seth/Documents/GitHub/sethgoldstein.com/

Modified:
  astro.config.mjs                          # Vercel adapter + hybrid mode
  package.json                              # Added @astrojs/vercel@7.8.2
  package-lock.json                         # Dependency tree

Created:
  src/pages/api/honcho/session.js           # Memory API (POST + GET)
  src/components/SethAvatarWithMemory.tsx   # React component (future)
  docs/AVATAR_PLATFORM_COMPARISON.md        # Memory system docs
  docs/LIVEAVATAR_HONCHO_INTEGRATION.md     # Integration guide
  .gitignore                                # Added .astro/ directory
  SESSION_NOTES.md                          # This file
```

---

## Session Statistics

**Duration**: ~2 hours
**Files Modified**: 7
**Lines of Code Written**: ~300
**API Endpoints Created**: 2
**Build Status**: ✅ Passing
**Deployment Status**: Ready (pending commit + push)

---

## Ecosystem Integration

### Relation to Other Projects
- **Part of**: Personal website ecosystem (sethgoldstein.com)
- **Connects to**: LiveAvatar (HeyGen), Honcho (Plastic Labs)
- **Pattern**: Similar to SOLIENNE manifesto system (autonomous daily creation + memory)
- **Precedent**: Eden agent architecture (Spirit Protocol) - autonomous agents with persistent memory

### Vibecodings Portfolio
- **Add to**: sethgoldstein.com project entry
- **Category**: Personal site + AI agent
- **Status**: Live avatar with memory system (local mode working)
- **Tech**: Astro + Vercel + LiveAvatar + Honcho

---

## Questions for Next Session

1. Has Honcho team responded about workspace provisioning?
2. Should we deploy in local mode first, then upgrade to Honcho?
3. Domain setup (case #854219) - any updates?
4. Client-side SDK integration - manual or automated?
5. Should we create analytics dashboard before or after Honcho migration?

---

**Session closed**: November 26, 2025
**Next session**: TBD - Deploy + Honcho provisioning
**Status**: ✅ Memory API working in local mode, ready for production deployment

---

## Session: 2025-11-29 - DNS Fix + Astro 5 Upgrade + Production Deploy

**Built:** Fixed DNS, upgraded to Astro 5, and deployed sethgoldstein.com to production with photo gallery (/photos) and LiveAvatar (/live) pages working. Fixed critical Vercel deployment issues after Node 18 deprecation.

**Issues Fixed:**
- DNS A record changed from old IP (`216.150.1.1`) to Vercel (`76.76.21.21`) in Squarespace
- `nodejs18.x` runtime deprecation - upgraded Astro 4 → 5
- Astro 5 breaking change: output `hybrid` → `server`
- Vercel adapter import path: `@astrojs/vercel/serverless` → `@astrojs/vercel`
- Created `.vercelignore` to exclude 5GB photo-export folder
- Reverted LiveAvatar to working embed ID (user's custom ID not embed-enabled)

**Commits:**
- 1ca6d5f Upgrade to Astro 5 + fix Vercel deployment

**Production:**
- https://sethgoldstein.com (live)
- https://sethgoldstein.com/photos (1,292 images)
- https://sethgoldstein.com/live (LiveAvatar working)

**Next:**
- Get custom LiveAvatar avatar working (check dashboard for embed ID)
- Curate photos via /photos?curate=true
- Add photo-export to .gitignore (git push failing due to 5GB folder)

---

## Session: 2025-11-29 - @seth Agent + Chat Integration + Professional Platform Plan

**SHIPPED:**

### 1. e-seth Chat Integration (`/chat`)
- Built `/src/pages/chat.astro` - text-based chat with e-seth Eden agent
- Built `/src/pages/api/seth-chat.ts` - Eden API bridge with session-based messaging
- Uses Eden agent `690b94279aa43032fcc4e360` (e-seth)
- Polling-based response handling (Eden sessions are async)
- Fixed session access issues (don't persist sessionId across page loads)
- Global styles for dynamically rendered messages

**API Pattern:**
```typescript
// POST /v2/sessions - send message, create session if needed
// GET /v2/sessions/{id}/messages - poll for assistant response
// 20 second timeout with 1 second poll interval
```

### 2. Claude SDK @seth Agent (Local CLI)
- Built `/Users/seth/seth-agent/` - standalone CLI tool
- 500+ line system prompt with Seth's voice/personality
- Commands: `seth "message"`, `seth chat`, `seth content`, `seth status`
- npm linked globally - `seth` command works from anywhere
- Streaming support with `-s` flag

### 3. Professional Platform Integration Plan
- Created comprehensive plan at `~/.claude/plans/enumerated-inventing-robin.md`
- Revenue streams: Cal.com booking, Gumroad courses, speaking engagements
- AI integration across all touchpoints
- Hybrid build approach (Cal.com for booking, custom for content)

**Files Created:**
- `/src/pages/chat.astro` - Text chat UI
- `/src/pages/api/seth-chat.ts` - Eden API bridge
- `/Users/seth/seth-agent/` - Full CLI agent project

**Technical Notes:**
- Eden API uses session-based messaging, not direct agent chat endpoint
- Don't reuse sessionIds across API key changes (causes "no access" errors)
- Astro requires `<style is:global>` for dynamically added DOM elements

**Next:**
- [ ] Transfer sethgoldstein.com domain to Vercel
- [ ] Set up Cal.com booking with event types
- [ ] Create /book, /work, /speaking, /learn pages
- [ ] Integrate e-seth with LiveAvatar on /live

---

## Session: 2025-12-01 - Photos 10x10 Grid + Social Links + Git Cleanup

**Built:** Updated photos page to show exactly 100 photos in 10x10 grid (no infinite scroll), added Instagram + email links to footer, fixed 5GB git repo bloat by creating fresh repo.

**Commits:**
- `e7e672d` Photos: Show exactly 100 (10x10 grid), shuffle for new random 100
- `17f1511` Fresh start: sethgoldstein.com with photos, live avatar, and chat

**Key Changes:**
- Photos page shows exactly 100 photos in perfect 10x10 grid
- Shuffle button and page refresh show new random 100 from collection
- Lightbox still works for full-size viewing
- Added Instagram (@sethgoldstein) + email (sethgoldstein@gmail.com) to footer
- Fresh git repo eliminates 5GB photo history bloat
- Both www and non-www domains working (www redirects)

**Technical:**
- Removed infinite scroll and Load More button from photos.astro
- `displayPhotos()` function shows exactly first 100 from shuffled array
- `.gitignore` now includes `.astro/`, `.env`, `photo-export/`

**Next:**
- [ ] Test LiveAvatar on /live page - get voice conversation actually working
- [ ] Debug SDK event handling or token generation if needed

---

## Session: December 2, 2025 - Unified Design System

**Built:** Created shared design system across sethgoldstein.com and vibecodings with CSS tokens, unified typography (Helvetica Neue), and cross-site navigation.

**Commits:**
- `ed5b5eb` Design system unification: sethgoldstein.com + vibecodings

**Key Changes:**
- NEW: `/src/styles/tokens.css` - Shared design variables
- Replaced Space Grotesk with Helvetica Neue (Swiss design foundation)
- Reduced borders from 2px to 1px throughout
- Added subtle blue accent (#6B8FFF) for focus states
- Updated all pages (photos, live, chat) to use CSS variables
- Added vibecodings link to homepage footer
- vibecodings index.html fully restyled with matching tokens

**Deployed:**
- https://sethgoldstein.com (via git push)
- https://vibecodings.vercel.app (via Vercel CLI)

**Next:**
- [ ] Monitor sites for visual issues
- [ ] Extend design system to other Seth projects
- [ ] Consider shared component library

---

## Session: December 3, 2025 - /live Page Fix

**Built:** Fixed broken LiveAvatar SDK integration on /live page. Added error handling, 30-second timeout, and fallback notice directing users to text chat.

**Commits:**
- `9906974` Fix /live page: Add error handling, timeout, and fallback

**Key Changes:**
- Added comprehensive SDK error event listeners
- 30-second connection timeout with graceful fallback
- Fallback notice UI with "Try text chat instead" button
- Detailed console logging with `[SDK]` prefix for debugging
- Token endpoint verified working (returns valid JWT)

**Next:**
- [ ] Test /live in production - check if SDK connects or times out
- [ ] Review console logs to understand SDK behavior
- [ ] If SDK continues failing, consider iframe embed approach

---

## Session: December 4, 2025 - /live SDK Deep Dive + Fix

**Built:** Fixed LiveAvatar SDK video display issue. Deep-dived into `@heygen/liveavatar-web-sdk` source code to discover video wasn't showing because `attach()` wasn't being called after `SESSION_STREAM_READY` fired.

**Key Discovery:** SDK was actually connecting successfully (console showed "Stream ready!" and "CONNECTED") but video element wasn't wired up. Iframe approach won't work for public visitors (requires HeyGen login).

**Commits:**
- `68ef065` Fix stream attachment timing in /live
- `af87455` Fix /live SDK integration with proper attach() method
- `6778f0c` Switch /live to iframe embed (reverted - requires login)

**Technical Details:**
- SDK constructor: `new LiveAvatarSession(token, { voiceChat: true })`
- Must call `session.attach(videoElement)` when `SESSION_STREAM_READY` fires
- `attach()` wires up both video AND audio tracks to the element
- Added `video.play()` call to handle browser autoplay policies
- Events: `SessionEvent.SESSION_STREAM_READY`, `SessionEvent.SESSION_STATE_CHANGED`

**Next:**
- [ ] Test /live page to confirm video displays
- [ ] Handle AudioContext autoplay warnings if needed
- [ ] Test on mobile browsers
