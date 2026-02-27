# LiveAvatar + Honcho Memory Integration

## Overview

Add persistent memory to your Seth avatar using Honcho, so the avatar learns from conversations and provides better responses over time.

## Confirmed: LiveAvatar Has Transcript Events ✅

From [docs.liveavatar.com/docs/server-events](https://docs.liveavatar.com/docs/server-events):

| Event | Payload | Use |
|-------|---------|-----|
| `user.transcription_ended` | `{"text": string}` | What user said |
| `avatar.transcription_ended` | `{"text": string}` | What avatar responded |
| `user.speak_started/ended` | - | User speaking state |
| `avatar.speak_started/ended` | - | Avatar speaking state |

**This means we can capture full conversation transcripts and store them in Honcho.**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     sethgoldstein.com/live                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   LiveAvatar │───▶│  Middleware  │───▶│    Honcho    │  │
│  │   (iframe)   │    │   (API)      │    │   (Memory)   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
│         │                   │                    │          │
│         ▼                   ▼                    ▼          │
│  User speaks ──▶ Transcript captured ──▶ Stored in Honcho  │
│  Avatar responds ──▶ Response logged ──▶ Context built     │
│                                                              │
│  Next conversation:                                          │
│  Honcho.getContext() ──▶ Inject into prompt ──▶ Smarter    │
└─────────────────────────────────────────────────────────────┘
```

## Option 1: Custom Integration (Full Control)

Instead of using the iframe embed, use LiveAvatar's SDK directly:

### 1. Install Dependencies

```bash
npm install @heygen/liveavatar-web-sdk honcho-ai
```

### 2. Create API Route for Honcho

```javascript
// api/honcho/session.js
const { Honcho } = require('honcho-ai');

const honcho = new Honcho({
  apiKey: process.env.HONCHO_API_KEY,
});

export async function POST(req) {
  const { userId, message, isUser } = await req.json();

  // Get or create session for this user
  let session = await honcho.apps.users.sessions.list(
    'seth-avatar',
    userId,
    { limit: 1 }
  );

  if (!session.items.length) {
    session = await honcho.apps.users.sessions.create(
      'seth-avatar',
      userId,
      { metadata: { source: 'liveavatar' } }
    );
  } else {
    session = session.items[0];
  }

  // Store the message
  await honcho.apps.users.sessions.messages.create(
    'seth-avatar',
    userId,
    session.id,
    {
      is_user: isUser,
      content: message,
    }
  );

  return Response.json({ success: true });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  // Get context for this user
  const context = await honcho.apps.users.getContext(
    'seth-avatar',
    userId,
    { max_tokens: 1000 }
  );

  return Response.json({ context });
}
```

### 3. Wrap LiveAvatar with Transcript Capture

```javascript
// components/SethAvatar.jsx
import { useEffect, useState } from 'react';
import { LiveAvatarClient } from '@heygen/liveavatar-web-sdk';

export default function SethAvatar() {
  const [client, setClient] = useState(null);
  const [userId] = useState(() =>
    localStorage.getItem('seth-avatar-user') || crypto.randomUUID()
  );

  useEffect(() => {
    localStorage.setItem('seth-avatar-user', userId);

    // Get Honcho context for this user
    fetch(`/api/honcho/session?userId=${userId}`)
      .then(r => r.json())
      .then(({ context }) => {
        // Initialize LiveAvatar with enhanced context
        const basePrompt = `Your base Seth prompt here...`;
        const enhancedPrompt = context
          ? `${basePrompt}\n\nContext from previous conversations:\n${context}`
          : basePrompt;

        // Initialize LiveAvatar SDK with enhanced prompt
        initializeLiveAvatar(enhancedPrompt);
      });
  }, [userId]);

  const initializeLiveAvatar = async (prompt) => {
    const client = new LiveAvatarClient({
      // Your LiveAvatar config
    });

    // Listen for transcript events (from LiveAvatar docs)
    client.on('user.transcription_ended', async ({ text }) => {
      console.log('User said:', text);
      await fetch('/api/honcho/session', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          message: text,
          isUser: true,
        }),
      });
    });

    client.on('avatar.transcription_ended', async ({ text }) => {
      console.log('Avatar said:', text);
      await fetch('/api/honcho/session', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          message: text,
          isUser: false,
        }),
      });
    });

    setClient(client);
  };

  return (
    <div id="liveavatar-container" />
  );
}
```

## Option 2: Simpler Approach (Manual Review)

If LiveAvatar doesn't expose transcript events in the iframe, you can:

1. **Request transcript exports** from LiveAvatar dashboard
2. **Periodically review** conversations
3. **Extract insights** and update your prompt manually

This is lower effort but doesn't give real-time memory.

## Option 3: Hybrid with Feedback Loop

Add a feedback form after each conversation:

```html
<div class="feedback">
  <p>Was this conversation helpful?</p>
  <button onclick="sendFeedback('helpful')">👍 Yes</button>
  <button onclick="sendFeedback('not-helpful')">👎 No</button>
  <textarea placeholder="Any topics I should know more about?"></textarea>
</div>
```

Store feedback in Honcho to understand what's working.

## Next Steps

1. **Check LiveAvatar API** - Email support@liveavatar.com to ask:
   - Do you have webhooks for conversation events?
   - Can I access transcripts programmatically?
   - Is there an event for user speech / avatar response?

2. **Set up Honcho** - Create account at honcho.dev and get API key

3. **Build middleware** - API routes to bridge LiveAvatar ↔ Honcho

4. **Test with self-hosted** - If LiveAvatar supports custom deployment, you get full control

## Honcho Quick Start

```bash
# Install
npm install honcho-ai

# Initialize
const honcho = new Honcho({ apiKey: process.env.HONCHO_API_KEY });

# Create app (one time)
await honcho.apps.create({ name: 'seth-avatar' });

# Store conversation
await honcho.apps.users.sessions.messages.create(
  'seth-avatar',
  'user-123',
  'session-456',
  { is_user: true, content: 'Tell me about Bright Moments' }
);

# Get context for user
const context = await honcho.apps.users.getContext('seth-avatar', 'user-123');
```

## Resources

- LiveAvatar Docs: https://docs.liveavatar.com
- LiveAvatar SDK: https://www.npmjs.com/package/@heygen/liveavatar-web-sdk
- Honcho Docs: https://docs.honcho.dev
- LiveKit Transcripts: https://docs.livekit.io/agents/build/text-and-transcriptions/
