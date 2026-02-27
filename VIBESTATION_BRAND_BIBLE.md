# VIBESTATION BRAND BIBLE

## The Concept

**Vibestation** lives in the tension between two eras:
- **The Past**: Commodore PET, Apple II, CRT phosphor glow, DOS prompts, the garage computer revolution
- **The Future**: AGI agents, Claude Code, autonomous systems, the vibe-coding revolution

We're not building software anymore. We're *conversing it into existence*. And that deserves a proper workstation.

---

## Brand Positioning

### Tagline Options
1. `READY.` ← (Commodore 64 boot prompt)
2. `> vibestation --init`
3. `The hardware layer for the AI era`
4. `Boot up. Vibe out. Ship.`
5. `Your command center for the conversation`

### Voice
- **Warm nostalgia** meets **genuine excitement** about the future
- Playful but not juvenile
- Technical but accessible (you don't need to know what RAM is)
- Insider humor for devs, welcoming for newcomers
- Self-aware about the absurdity of "vibecoding" as a concept

### Target Audience
Adults (30s-60s) who:
- Never called themselves "developers" until Claude came along
- Remember when computers were exciting and new
- Are experiencing that same wonder again with AI
- Have disposable income and want the "real" setup
- Want to belong to this new culture

---

## Ecosystem Fit

```
┌─────────────────────────────────────────────────────────┐
│                    THE VIBE ECOSYSTEM                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   vibecodings        /vibe           vibestation        │
│   ───────────        ─────           ──────────         │
│   WHAT YOU BUILT     WHO YOU'RE      WHAT YOU           │
│                      BUILDING WITH   BUILD WITH         │
│                                                         │
│   Portfolio          Social layer    Hardware guide     │
│   Your shipped       DMs for devs    Your command       │
│   projects           Session sharing center setup       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Visual Identity

### Color Palette

#### Primary: Phosphor Green (The Past)
```
--phosphor:        #33FF33   // Classic CRT green
--phosphor-dim:    #1a8c1a   // Dimmed state
--phosphor-glow:   rgba(51, 255, 51, 0.3)  // Screen glow
```

#### Secondary: Amber Terminal (Warm Nostalgia)
```
--amber:           #FFB000   // Amber CRT monitors
--amber-dim:       #996600   // Dimmed
--amber-glow:      rgba(255, 176, 0, 0.3)
```

#### Accent: Spirit Blue (The Future)
```
--future:          #6B8FFF   // AI/AGI accent
--future-dim:      #3d5c99
--future-glow:     rgba(107, 143, 255, 0.3)
```

#### Neutrals: CRT Black
```
--crt-black:       #0A0A0A   // Deep screen black
--crt-dark:        #111111   // Surface
--crt-gray:        #1a1a1a   // Elevated surface
--scanline:        rgba(0, 0, 0, 0.1)  // Scanline overlay
```

### Typography

#### Primary: Monospace (The Machine)
```css
font-family: 'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', monospace;
```
Used for: Headlines, navigation, product names, code snippets

#### Secondary: Clean Sans (The Human)
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```
Used for: Body text, descriptions, longer content

#### Display: Pixel/Retro (Special Moments)
```css
font-family: 'VT323', 'Press Start 2P', monospace;
```
Used for: Logo, special callouts, boot sequences, easter eggs

### Visual Effects

#### Scanlines
```css
.scanlines::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1) 0px,
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
}
```

#### CRT Glow
```css
.crt-glow {
  text-shadow:
    0 0 5px var(--phosphor),
    0 0 10px var(--phosphor),
    0 0 20px var(--phosphor-glow);
}
```

#### Screen Curvature
```css
.crt-curve {
  border-radius: 20px;
  box-shadow:
    inset 0 0 100px rgba(0, 0, 0, 0.5),
    0 0 20px var(--phosphor-glow);
}
```

---

## Logo Concepts

### Concept 1: The Blinking Cursor
```
VIBESTATION_
           ▌
```
- Monospace type
- Blinking cursor animation
- Simple, iconic, ownable
- Works at any size

### Concept 2: The CRT Frame
```
┌──────────────────┐
│   VIBESTATION    │
└──────────────────┘
```
- ASCII box drawing characters
- Retro terminal aesthetic
- Can animate as "boot sequence"

### Concept 3: The Monitor Icon
```
    ╭─────────────╮
    │ VIBE        │
    │ STATION     │
    ╰─────┬───────╯
          │
      ════╧════
```
- Stylized CRT monitor
- Logo text inside screen
- Strong visual identity

### Concept 4: The Prompt
```
> vibestation
READY.
```
- Command line aesthetic
- Interactive feeling
- The ">" becomes the icon mark

### Recommended: Hybrid
Logo mark: Blinking cursor block `▌` or `█`
Wordmark: `VIBESTATION` in IBM Plex Mono or custom pixel font
Lockup: `> VIBESTATION█`

---

## Iconography

Use ASCII/Unicode box drawing and symbols:
```
Compute:    ▣ or ◧
Display:    ▭ or ⬚
Input:      ⌨ or ▤
Audio:      ♪ or ◉
Chair:      ⌂ or △
```

Or simple line icons with CRT glow effect applied.

---

## Animation Principles

### Boot Sequence (Page Load)
```
> VIBESTATION v1.0
> LOADING HARDWARE DATABASE...
> SCANNING FOR OPTIMAL CONFIGS...
> READY.
█
```
Fast typewriter effect (200ms between lines), then fade to content.

### Cursor Blink
```css
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
.cursor { animation: blink 1s step-end infinite; }
```

### Hover States
- Phosphor glow intensifies
- Slight "screen flicker" effect
- Text gets brighter (not just color change)

### Transitions
- Quick, snappy (150-200ms)
- No bounce/elastic (too modern)
- Linear or ease-out (like CRT response time)

---

## Viral Mechanics

### 1. Shareable Setup Cards
Generate a retro-styled card of your setup:
```
┌────────────────────────────────┐
│     @seth's VIBESTATION        │
├────────────────────────────────┤
│ COMPUTE:  Mac Studio M4 Max    │
│ DISPLAY:  LG 40" Ultrawide     │
│ INPUT:    HHKB + MX Master     │
│ CHAIR:    Herman Miller Aeron  │
│ FUEL:     Yerba Mate + Almonds │
├────────────────────────────────┤
│ 190+ projects shipped          │
│ sethgoldstein.com/vibestation  │
└────────────────────────────────┘
```
- Auto-generate from survey responses
- Download as image (for Twitter/LinkedIn)
- ASCII art version for terminal lovers

### 2. "What's Your Vibe?" Quiz
Interactive quiz that recommends a setup tier:
- Minimal Monk (under $2K)
- Serious Shipper ($2-5K)
- Command Center ($5K+)
- "Insane Mode" ($10K+)

### 3. Achievement Badges
```
[FIRST BOOT]     - Completed the survey
[MECHANICAL]     - Uses a mechanical keyboard
[STANDING OVATION] - Has a standing desk
[MULTI-MONITOR]  - 2+ displays
[AUDIOPHILE]     - Premium headphones
```

### 4. Easter Eggs
- Konami code reveals "Insane Mode" setup
- Type `help` anywhere for terminal commands
- Hidden ASCII art in page source
- `matrix` command triggers green rain

### 5. Community Builds
Gallery of submitted setups with:
- Photo upload option
- Retro filter applied automatically
- Upvote/featured system
- "Setup of the Week"

---

## Content Formats

### Product Cards
```
┌─────────────────────────────────┐
│  [IMAGE]                        │
│                                 │
│  MAC STUDIO M4 MAX              │
│  ─────────────────              │
│  The silent powerhouse.         │
│  Zero fan noise. Infinite       │
│  Claude conversations.          │
│                                 │
│  $1,999+        [Add to Cart]   │
└─────────────────────────────────┘
```

### Category Headers
```
════════════════════════════════════
  > COMPUTE
  "Where the magic happens"
════════════════════════════════════
```

### Testimonial Format
```
> "I thought I needed a gaming PC.
   Turns out I needed a Mac Studio
   and a comfortable chair."

   — @someone, shipped 47 projects
```

---

## Copy Guidelines

### Headlines
- Use terminal-style prompts: `> `, `$ `, `READY.`
- Short, punchy, imperative
- Can be questions directed at the reader

### Body Copy
- Second person ("You've been coding for 6 hours...")
- Acknowledge the absurdity while celebrating it
- Include insider references (but explain them)
- No corporate speak, no "leverage" or "synergy"

### Product Descriptions
- Lead with the feeling, not specs
- "Your back will thank you" > "Ergonomic design"
- One surprising detail per product
- End with the transformation it enables

### CTAs
- `> ADD TO CART`
- `BOOT UP YOUR SETUP`
- `[ENTER] TO CONTINUE`
- `> START HERE`

---

## Sample Copy

### Hero
```
> VIBESTATION

You used to open Excel.
Now you open Claude.

Welcome to the other side.
This is your hardware guide.

[> GET STARTED]
```

### About Section
```
> ABOUT

In 2024, something broke.

People who'd never written a line of code
started shipping apps. Websites. Tools.
Entire products—in an afternoon.

They didn't become developers.
They became vibecoders.

This guide is for them. For us.
The grownups who suddenly need
a proper command center.

READY._
```

### Survey Intro
```
> SYSTEM SCAN

We're building the definitive guide
to vibecoding hardware.

But we need your data.
Your setup. Your fuel. Your secrets.

2 minutes. Anonymous-ish.
(We just want to know what works.)

[> INITIALIZE SCAN]
```

---

## File Naming

```
vibestation-logo-primary.svg
vibestation-logo-mark.svg
vibestation-wordmark.svg
vibestation-card-template.png
vibestation-og-image.png
```

---

## Implementation Priority

### Phase 1: Visual Refresh
1. Update color scheme to phosphor green + amber
2. Add scanline overlay
3. Implement CRT glow effects
4. Swap to monospace headings
5. Add boot sequence animation

### Phase 2: Viral Features
1. Build "My Setup" card generator
2. Add quiz for setup recommendations
3. Implement achievement badges
4. Create shareable ASCII cards

### Phase 3: Community
1. Setup gallery/submissions
2. Upvote system
3. Weekly featured setups
4. Integration with /vibe for social proof

---

## Brand Don'ts

- No gradients (too modern, use solid colors)
- No rounded corners > 8px (keep it boxy)
- No emoji in UI (ASCII alternatives only)
- No stock photos (illustrations or real setups only)
- No light mode (CRTs were always dark)
- No Comic Sans (obviously)
- No "disrupting" or startup-speak

---

## Reference & Inspiration

### Visual
- Commodore 64 boot screen
- Apple II green phosphor
- DOS 6.22 interface
- Terminal.app with green theme
- r/unixporn retro rices
- Fallout Pip-Boy interface

### Tone
- Wirecutter (but with personality)
- The Setup (interviews)
- Uses This
- Sick Setups (YouTube)

### Similar Energy
- Poolsuite FM (retro + modern)
- Nothing Phone (nostalgic tech)
- Teenage Engineering (playful premium)

---

*VIBESTATION v1.0*
*A guide for the conversational computing era.*
*READY._*
