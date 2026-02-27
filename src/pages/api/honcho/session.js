/**
 * Honcho Memory Integration (v2 API - Direct Fetch)
 *
 * Stores LiveAvatar conversation transcripts and retrieves context.
 * Using direct v2 API calls (SDK v0.2.0 only supports deprecated v1 API).
 *
 * SETUP REQUIRED:
 * To enable Honcho integration, set HONCHO_ENABLED=true and ensure
 * the HONCHO_WORKSPACE exists (contact Honcho team to provision).
 */

// Ensure this route is server-rendered (not static)
export const prerender = false;

// Honcho configuration
const HONCHO_ENABLED = process.env.HONCHO_ENABLED !== 'false'; // Default to true now that workspace exists
const HONCHO_WORKSPACE = process.env.HONCHO_WORKSPACE || 'seth-avatar-dev';
const HONCHO_BASE_URL = 'https://api.honcho.dev/v2';
const HONCHO_API_KEY = process.env.HONCHO_API_KEY || 'hch-v2-jyfj84fv3sx6vjs6k46llcgb4ihmlskqzjwcauy7np09bl4cy9oqrlbdsh73ehg4';

// Simple in-memory store for local fallback (persists during server runtime)
const localStore = new Map();

/**
 * Helper: Make authenticated request to Honcho v2 API
 */
async function honchoFetch(endpoint, options = {}) {
  const url = `${HONCHO_BASE_URL}${endpoint}`;

  console.log(`[Honcho] → ${options.method || 'GET'} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${HONCHO_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`[Honcho] ← ${response.status} ${error}`);
    throw new Error(`Honcho API error (${response.status}): ${error}`);
  }

  console.log(`[Honcho] ← ${response.status} OK`);
  return response.json();
}

/**
 * Initialize or get session for a user
 */
async function getOrCreateSession(userId) {
  // Use local mode if Honcho is not enabled
  if (!HONCHO_ENABLED) {
    const sessionId = `local-${userId}-${Date.now()}`;
    console.log(`[Memory] Using local mode for: ${userId}/${sessionId}`);
    return { userId, sessionId, local: true };
  }

  try {
    // Try to create a new session (v2 API auto-creates workspace if needed)
    const sessionId = `session-${Date.now()}`;

    await honchoFetch(`/workspaces/${HONCHO_WORKSPACE}/sessions`, {
      method: 'POST',
      body: JSON.stringify({
        id: sessionId,
        user_id: userId,
        location_id: sessionId
      })
    });

    console.log(`[Honcho] ✅ Session created: ${userId}/${sessionId}`);
    return { userId, sessionId, local: false };
  } catch (error) {
    // Check for 409 conflict (session exists) or other recoverable errors
    if (error.message?.includes('409')) {
      console.log(`[Honcho] ℹ️ Session already exists for user: ${userId}`);
      // Try to get existing session
      return await getExistingSession(userId);
    }

    console.error('[Honcho] Error creating session:', error);
    // Fallback to local session
    return {
      userId,
      sessionId: `local-${Date.now()}`,
      local: true
    };
  }
}

/**
 * Get existing session for user
 */
async function getExistingSession(userId) {
  try {
    const sessions = await honchoFetch(
      `/workspaces/${HONCHO_WORKSPACE}/users/${userId}/sessions`
    );

    if (sessions.items?.length > 0) {
      // Return most recent session
      const session = sessions.items[0];
      return { userId, sessionId: session.id };
    }

    // No sessions found, create new one
    return await getOrCreateSession(userId);
  } catch (error) {
    console.error('[Honcho] Error getting existing session:', error);
    return {
      userId,
      sessionId: `local-${Date.now()}`,
    };
  }
}

/**
 * Store a message in the session
 */
async function storeMessage(userId, sessionId, message, isUser, isLocal = false) {
  // Store in local memory
  if (isLocal || sessionId.startsWith('local-')) {
    const key = `messages-${userId}`;
    const messages = localStore.get(key) || [];
    messages.push({
      is_user: isUser,
      content: message,
      timestamp: new Date().toISOString(),
      source: 'liveavatar'
    });
    // Keep only last 50 messages
    if (messages.length > 50) messages.shift();
    localStore.set(key, messages);
    console.log(`[Memory] ✅ Stored local message for ${userId} (${messages.length} total)`);
    return;
  }

  // Store in Honcho
  try {
    await honchoFetch(
      `/workspaces/${HONCHO_WORKSPACE}/sessions/${sessionId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          is_user: isUser,
          content: message,
          metadata: {
            source: 'liveavatar',
            timestamp: new Date().toISOString()
          }
        })
      }
    );
    console.log(`[Honcho] ✅ Stored message for ${userId}/${sessionId}`);
  } catch (error) {
    console.error('[Honcho] Error storing message:', error);
    // Fallback to local storage
    const key = `messages-${userId}`;
    const messages = localStore.get(key) || [];
    messages.push({ is_user: isUser, content: message, timestamp: new Date().toISOString() });
    localStore.set(key, messages);
    console.log(`[Memory] ✅ Fell back to local storage for ${userId}`);
  }
}

/**
 * Get context from previous conversations
 */
async function getContext(userId) {
  // Try local storage first
  const localKey = `messages-${userId}`;
  const localMessages = localStore.get(localKey);

  if (localMessages?.length > 0) {
    console.log(`[Memory] Retrieved ${localMessages.length} local messages for ${userId}`);
    const contextLines = localMessages
      .slice(-20)
      .map((m) => `${m.is_user ? 'User' : 'Seth'}: ${m.content}`);
    return `Previous conversation with this user:\n${contextLines.join('\n')}`;
  }

  // Try Honcho if enabled
  if (!HONCHO_ENABLED) {
    console.log(`[Memory] No local messages found for ${userId}`);
    return null;
  }

  try {
    // Get user's sessions
    const sessions = await honchoFetch(
      `/workspaces/${HONCHO_WORKSPACE}/users/${userId}/sessions`
    );

    if (!sessions.items?.length) {
      return null;
    }

    // Collect messages from recent sessions (up to 5)
    const allMessages = [];
    for (const session of sessions.items.slice(0, 5)) {
      try {
        const response = await honchoFetch(
          `/workspaces/${HONCHO_WORKSPACE}/users/${userId}/sessions/${session.id}/messages?limit=10`
        );

        if (response.items) {
          allMessages.push(...response.items);
        }
      } catch (e) {
        console.error('[Honcho] Error fetching messages from session:', e);
      }
    }

    if (allMessages.length === 0) {
      return null;
    }

    // Format as context string
    const contextLines = allMessages
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-20)
      .map((m) => `${m.is_user ? 'User' : 'Seth'}: ${m.content}`);

    return `Previous conversation with this user:\n${contextLines.join('\n')}`;
  } catch (error) {
    console.error('[Honcho] Error getting context:', error);
    return null;
  }
}

// POST handler - store messages
export async function POST({ request }) {
  try {
    const { userId, message, isUser } = await request.json();

    if (!userId || !message) {
      return new Response(JSON.stringify({ error: 'Missing userId or message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { sessionId, local } = await getOrCreateSession(userId);
    await storeMessage(userId, sessionId, message, isUser, local);

    return new Response(JSON.stringify({
      success: true,
      sessionId,
      mode: local ? 'local' : 'honcho'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error in POST:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// GET handler - retrieve context
export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const context = await getContext(userId);

    return new Response(JSON.stringify({ context }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error in GET:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
