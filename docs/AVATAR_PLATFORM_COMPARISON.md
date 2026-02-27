# Seth Avatar: Platform Comparison & Fallback Strategy

## Current Setup: LiveAvatar + Memory System

**LiveAvatar API Key:** `a1220cc4-230a-41b1-849e-27d3fa0808d8`
**Avatar ID:** `0f80c3d2-6547-48a1-8a28-ac59d168790b`

### Live Page
- **URL:** `sethgoldstein.com/live`
- **Implementation:** `/src/pages/live.astro` - Simple iframe embed

### Memory System Architecture

The avatar has a memory API at `/api/honcho/session` that stores conversation transcripts:

**API Endpoints:**
- `POST /api/honcho/session` - Store messages
  - Body: `{ userId, message, isUser: boolean }`
  - Returns: `{ success, sessionId, mode: 'local'|'honcho' }`

- `GET /api/honcho/session?userId={userId}` - Get context
  - Returns: `{ context: "Previous conversation..." | null }`

**Storage Modes:**
1. **Local Mode (default):** In-memory storage during server runtime
   - Works immediately, no configuration needed
   - Data persists only during server lifetime

2. **Honcho Mode:** Persistent cloud storage via Plastic Labs
   - Set `HONCHO_ENABLED=true` in environment
   - Requires workspace provisioning from Honcho team
   - Uses Honcho v2 API (`https://api.honcho.dev/v2`)

**Environment Variables:**
```
HONCHO_ENABLED=true|false        # Default: false (local mode)
HONCHO_WORKSPACE=workspace-id    # Your Honcho workspace
HONCHO_API_KEY=hch-v2-...        # Your Honcho API key
```

### Pros
- Already integrated via iframe
- Transcript events available (`user.transcription_ended`, `avatar.transcription_ended`)
- Clean embed experience
- Memory system ready for Honcho integration

### Cons
- Context injection only at session start (no mid-session updates)
- Limited documentation on advanced features
- Honcho requires workspace provisioning

---

## Alternative Platforms (Ranked)

### 1. HeyGen Interactive Avatars (Same Company as LiveAvatar)

**API Key:** `sk_V2_hgu_kgamT2N4T7h_IASDhqrdNxScgO2g49kfUIhiYoWCjyEs`

| Feature | Support |
|---------|---------|
| Custom avatars | ✅ From photo/video |
| Non-human sources | ✅ Possible |
| Memory/context | ✅ Knowledge base integration |
| Real-time | ✅ Interactive API |
| Transcript access | ✅ Via API |

**Why consider:** More mature API, better docs, same underlying tech as LiveAvatar.

```javascript
// HeyGen Interactive Avatar setup
const response = await fetch('https://api.heygen.com/v2/interactive_avatar/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${HEYGEN_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    avatar_id: 'your-avatar-id',
    knowledge_base_id: 'your-knowledge-base', // For memory
    voice_id: 'voice-id',
  }),
});
```

---

### 2. Hume AI (Empathic Voice Interface)

**API Key:** `IzrTK7DfOzjDz248x9vTgDoucoDrzuNRr1BVt8uiYQqGACqK`
**Secret:** `Nf9ot6kbAKOIk1VB6KXoeCRbXz0r9BNmHtZYMplJkzGFn4hw8yrf9ha2ywAfDibK`

| Feature | Support |
|---------|---------|
| Custom avatars | ❌ Voice-only (no video) |
| Emotional intelligence | ✅ Best in class |
| Memory/context | ✅ Conversation history |
| Real-time | ✅ WebSocket streaming |
| Transcript access | ✅ Full transcripts |

**Why consider:** If you want voice-first with emotional awareness. Could pair with a separate video avatar.

```javascript
// Hume EVI setup
import { Hume, HumeClient } from 'hume';

const client = new HumeClient({
  apiKey: HUME_API_KEY,
  secretKey: HUME_SECRET_KEY,
});

const socket = await client.empathicVoice.chat.connect({
  configId: 'your-config-id',
});

socket.on('message', (message) => {
  if (message.type === 'user_message') {
    // Store in Honcho
  }
  if (message.type === 'assistant_message') {
    // Store in Honcho
  }
});
```

---

### 3. D-ID (Live Portrait)

**API Key:** `c2V0aGdvbGRzdGVpbkBnbWFpbC5jb20:hOgjwZQOydRbmFe2pu0OZ`

| Feature | Support |
|---------|---------|
| Custom avatars | ✅ Any image (including non-human) |
| Non-human sources | ✅ Best for mascots/illustrations |
| Memory/context | ✅ Via LLM integration |
| Real-time | ✅ Streaming API |
| Transcript access | ✅ Via integration |

**Why consider:** Best for non-human avatars. Can animate any still image.

```javascript
// D-ID Streaming setup
const response = await fetch('https://api.d-id.com/talks/streams', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${D_ID_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    source_url: 'https://your-avatar-image.jpg',
    script: {
      type: 'text',
      input: 'Hello, I am Seth.',
      provider: {
        type: 'microsoft',
        voice_id: 'en-US-GuyNeural',
      },
    },
  }),
});
```

---

### 4. Hedra (Character Video)

**API Key:** `sk_hedra_Pt6cFb0zBET7xBXLpIFp5NFzMruEhKokG5-RbY850La5TtxPDwXigMS8qIuK1zQB`

| Feature | Support |
|---------|---------|
| Custom avatars | ✅ From image |
| Non-human sources | ✅ Any character |
| Memory/context | ❓ Unknown |
| Real-time | ❌ Async generation |
| Transcript access | N/A |

**Why consider:** Good for pre-rendered character videos, not real-time.

---

## Recommended Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    sethgoldstein.com/live                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Avatar Layer                           │   │
│  │  Primary: LiveAvatar / HeyGen                           │   │
│  │  Fallback: D-ID (if custom avatar needed)               │   │
│  │  Voice-only: Hume (if video fails)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Memory Layer (Honcho)                  │   │
│  │  - Store all transcripts                                 │   │
│  │  - Build user context                                    │   │
│  │  - Inject into prompts                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Analytics Layer                        │   │
│  │  - Track conversations                                   │   │
│  │  - Identify gaps in knowledge                            │   │
│  │  - Auto-update prompts                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Honcho Integration (Works with All Platforms)

**API Key:** `hch-v2-jyfj84fv3sx6vjs6k46llcgb4ihmlskqzjwcauy7np09bl4cy9oqrlbdsh73ehg4`

The Honcho layer is platform-agnostic. Store transcripts from any avatar platform:

```javascript
// Universal transcript storage
async function storeTranscript(userId, message, isUser) {
  await fetch('/api/honcho/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message, isUser }),
  });
}

// Get context before session
async function getContext(userId) {
  const response = await fetch(`/api/honcho/session?userId=${userId}`);
  const { context } = await response.json();
  return context;
}
```

---

## Implementation Priority

1. **Phase 1:** Get LiveAvatar + Honcho working (current focus)
2. **Phase 2:** Add HeyGen as fallback (same company, easy swap)
3. **Phase 3:** Explore D-ID for custom non-human avatars
4. **Phase 4:** Consider Hume for voice-only emotional AI

---

## API Keys Reference

| Platform | Key |
|----------|-----|
| LiveAvatar | `a1220cc4-230a-41b1-849e-27d3fa0808d8` |
| HeyGen | `sk_V2_hgu_kgamT2N4T7h_IASDhqrdNxScgO2g49kfUIhiYoWCjyEs` |
| D-ID | `c2V0aGdvbGRzdGVpbkBnbWFpbC5jb20:hOgjwZQOydRbmFe2pu0OZ` |
| Hedra | `sk_hedra_Pt6cFb0zBET7xBXLpIFp5NFzMruEhKokG5-RbY850La5TtxPDwXigMS8qIuK1zQB` |
| Hume API | `IzrTK7DfOzjDz248x9vTgDoucoDrzuNRr1BVt8uiYQqGACqK` |
| Hume Secret | `Nf9ot6kbAKOIk1VB6KXoeCRbXz0r9BNmHtZYMplJkzGFn4hw8yrf9ha2ywAfDibK` |
| Honcho | `hch-v2-jyfj84fv3sx6vjs6k46llcgb4ihmlskqzjwcauy7np09bl4cy9oqrlbdsh73ehg4` |
