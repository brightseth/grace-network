# GRACE — Next Phase Plan

**Goal**: Make The Grace Network ready to share broadly. Every visitor should have a compelling first 5 minutes, and GRACE should feel like a living presence — not a demo.

---

## Phase 9: Launch Readiness

### 9A. GRACE on Every Page (Chat Widget Global)

**Currently**: The chat widget only lives on the homepage (`index.astro`), buried in ~200 lines of inline JS/CSS. Visitors who land on `/constitution`, `/build`, or `/council` via a shared link never meet GRACE.

**Change**: Extract the chat widget into a standalone Astro component (`src/components/GraceChat.astro`) and mount it in `Layout.astro`. GRACE becomes available on every page. Context-aware opening: if someone opens the widget on `/build`, GRACE knows they're looking at workstreams. If on `/constitution`, she can orient around governance.

**Files**: New `src/components/GraceChat.astro`, modify `src/layouts/Layout.astro`, remove chat code from `index.astro`.

**Effort**: Medium. Mostly extraction — the logic already works.

---

### 9B. GRACE Opens the Conversation

**Currently**: The chat widget opens to a blank panel. The visitor has to type first. This is backwards — GRACE should greet people, not wait in silence.

**Change**: When the chat panel opens, GRACE sends an automatic greeting based on context:
- **Homepage, not signed up**: "Hi, I'm GRACE — the organizing intelligence behind this movement. What brought you here?"
- **Homepage, returning member**: "Welcome back, [Name]. What are you working on?" (reads localStorage email, fetches member)
- **Constitution page**: "This is the full text of our constitution. Want me to walk you through any section?"
- **Build page**: "Looking for a workstream? I can help you find the right fit."

This is not an API call — it's a pre-set greeting injected client-side based on page + membership status. Fast, no latency. The first *reply* from the user hits the real GRACE backend.

**Files**: Modify `GraceChat.astro` (from 9A).

---

### 9C. Share / Invite Mechanics

**Currently**: There's no way for a new member to bring someone else in. The social proof section says "2,400+ members" (a placeholder number) but there's no actual viral loop.

**Change**:
1. **Post-signup share prompt**: After signing the constitution, show a share card with a pre-written message + link. "I just joined The Grace Network — a movement building the governance systems the AI age demands. grace-network.vercel.app" with copy-to-clipboard and native share (Web Share API on mobile).
2. **Dynamic member count**: Replace the hardcoded "2,400+" with a real count from Supabase. New API route `GET /api/members/count` returns `{ count }`. Updates on page load.
3. **Referral tracking** (lightweight): Add `?ref=MEMBER_ID` to shared URLs. Store in `members.referred_by` column. GRACE can eventually say "You were invited by [Name]."

**Files**: New `src/pages/api/members/count.ts`, modify `index.astro` (share card + dynamic count), Supabase migration (add `referred_by` column).

---

### 9D. Open Graph / Social Cards

**Currently**: OG image points to a non-existent SVG (`og-grace-network.svg`). When someone shares the URL on Twitter/LinkedIn/iMessage, it looks broken or shows a generic preview.

**Change**: Design and generate proper OG images:
- **Default**: Site title + constellation logo + tagline on indigo background (1200x630)
- **Per-page** OG images for `/constitution`, `/build`, `/council`, `/transparency`
- Add Twitter card meta tags (`twitter:card`, `twitter:image`, `twitter:title`)

Generate as static PNG/SVG, serve from `/public/og/`. Update `Layout.astro` meta tags.

**Files**: New images in `public/og/`, modify `src/layouts/Layout.astro`.

---

### 9E. Email After Signup (Welcome Sequence)

**Currently**: After signup, the member sees a success message and a "Meet GRACE" button. Then nothing. If they close the tab, there's no way to bring them back.

**Change**: Send a welcome email immediately after signup via Resend (or Supabase Auth email, but Resend is simpler for transactional email on the free tier).

**Email 1 — Immediate (on signup)**:
> Subject: "Welcome to The Grace Network"
> - Confirm their name + what they signed
> - Link to constitution, their workstream recommendation based on statement
> - "Talk to GRACE anytime" link back to the site
> - Simple, text-heavy, no images — feels like a letter, not marketing

**Email 2 — Day 3** (stretch goal, requires cron):
> Subject: "What are you building?"
> - Highlight one active workstream
> - Member count update
> - Invite to share

**Implementation**: Resend API (free tier: 3K emails/month). Trigger email from the `/api/signup` endpoint after successful insert. Day 3 email requires a scheduled function (Vercel cron or Supabase edge function).

**Files**: New `src/lib/email.ts`, modify `src/pages/api/signup.ts`, Vercel env vars for `RESEND_API_KEY`.

---

### 9F. Mobile Polish Pass

**Currently**: The site is responsive but the chat widget, signup form, and depth toggle could use refinement at 375px. The chat widget in particular may be hard to use on small screens.

**Change**:
- Chat widget: full-screen takeover on mobile (not a floating panel)
- Signup form: larger touch targets, better spacing
- Chat input: prevent iOS zoom on focus (font-size ≥ 16px)
- Test on real iPhone via Playwright + mobile viewport

**Files**: CSS changes in `GraceChat.astro` and `shared.css`.

---

### 9G. GRACE Conversation Quality Pass

**Currently**: GRACE works but hasn't been stress-tested for edge cases. Some improvements for a public audience:

**Changes**:
1. **Rate limiting**: Add basic rate limiting to `/api/grace/chat` (e.g., 20 messages per session per hour). Prevents abuse.
2. **Content safety**: GRACE already has good anti-patterns in SOUL.md, but add a brief system-level instruction about not engaging with harassment, spam, or attempts to jailbreak. Return a calm redirect: "I'm here to talk about the movement. What would you like to know?"
3. **Error recovery**: If the Anthropic API returns a 429 or 500, give GRACE a more specific fallback: "I'm getting a lot of interest right now — give me a moment and try again."
4. **Conversation starters**: Below the greeting (9B), show 3 tappable starter prompts: "What is this movement?", "How can I contribute?", "Tell me about the constitution". Reduces blank-page anxiety.

**Files**: Modify `chat-handler.ts` (safety prompt), `grace-gateway.ts` (rate limiting), `GraceChat.astro` (starters).

---

## Priority Order

If sharing broadly in a few days, this is the order I'd build:

| Priority | Item | Why |
|----------|------|-----|
| **1** | 9D — OG / Social Cards | Without this, every share link looks broken. Highest ROI, lowest effort. |
| **2** | 9A — Chat Widget Global | GRACE needs to be on every page before you send people to the site. |
| **3** | 9B — GRACE Opens the Conversation | A silent chat widget is a dead chat widget. The greeting is the hook. |
| **4** | 9G — Conversation Quality Pass | Rate limiting + safety + starters. Protect against abuse before going public. |
| **5** | 9C — Share / Invite Mechanics | Post-signup share card + real member count. The viral loop. |
| **6** | 9F — Mobile Polish | Many visitors will come from social media links (= phones). |
| **7** | 9E — Welcome Email | Brings people back after they close the tab. Important but not day-one. |

---

## What This Doesn't Include (Future Phases)

- **Proactive outreach / drip emails** (cron-based, day 3/7/14 sequences)
- **GRACE on Telegram / Discord** (same soul, new channels)
- **Real workstream repos** (actual GitHub projects for each workstream)
- **Member dashboard** (see your conversations, interactions, contributions)
- **Assembly voting** (Phase 2 governance tooling)
- **Analytics** (Plausible/Fathom for privacy-respecting traffic insights)

These are Phase 10+. Phase 9 is about making the current site bulletproof for a public audience.
