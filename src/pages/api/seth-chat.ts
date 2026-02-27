import type { APIRoute } from 'astro';

// Eden e-seth agent configuration
const EDEN_API_KEY = import.meta.env.EDEN_API_KEY || '48323a5e42cebf06dcfb0c8dc4832d9133f871b5012c8636';
const SETH_AGENT_ID = '690b94279aa43032fcc4e360';
const EDEN_API_URL = 'https://api.eden.art';

interface ChatRequest {
  message: string;
  sessionId?: string;
}

// Helper to wait for agent response by polling messages
async function waitForAgentResponse(sessionId: string, userMessageId: string, maxWaitMs = 30000): Promise<string | null> {
  const startTime = Date.now();
  const pollIntervalMs = 1000;

  while (Date.now() - startTime < maxWaitMs) {
    const messagesResponse = await fetch(`${EDEN_API_URL}/v2/sessions/${sessionId}/messages`, {
      headers: { 'X-Api-Key': EDEN_API_KEY },
    });

    if (messagesResponse.ok) {
      const data = await messagesResponse.json();
      // Find an assistant message that came after our user message
      const messages = data.messages || [];
      for (const msg of messages) {
        if (msg.role === 'assistant' && msg._id !== userMessageId) {
          return msg.content;
        }
      }
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  return null;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: ChatRequest = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Eden API uses session-based messaging
    // POST /v2/sessions sends a message and creates a session if needed
    const edenResponse = await fetch(`${EDEN_API_URL}/v2/sessions`, {
      method: 'POST',
      headers: {
        'X-Api-Key': EDEN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_ids: [SETH_AGENT_ID],
        content: message,
        session_id: sessionId || undefined,
        title: sessionId ? undefined : `web-chat-${Date.now()}`,
      }),
    });

    if (!edenResponse.ok) {
      const errorText = await edenResponse.text();
      console.error('Eden API error:', errorText);
      return new Response(JSON.stringify({
        error: 'Failed to send message to e-seth',
        details: errorText
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await edenResponse.json();
    const newSessionId = data.session_id;

    // Poll for the agent's response
    const reply = await waitForAgentResponse(newSessionId, data.message_id || '', 20000);

    if (!reply) {
      return new Response(JSON.stringify({
        reply: 'e-seth is thinking... (response may take a moment)',
        sessionId: newSessionId,
        pending: true,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      reply: reply,
      sessionId: newSessionId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Also support GET for simple testing
export const GET: APIRoute = async ({ url }) => {
  const message = url.searchParams.get('message');

  if (!message) {
    return new Response(JSON.stringify({
      status: 'ok',
      agent: 'e-seth',
      agent_id: SETH_AGENT_ID,
      usage: 'POST { message: "your message", sessionId?: "optional" }'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Forward to POST handler
  const request = new Request(url, {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Content-Type': 'application/json' },
  });

  return POST({ request } as any);
};
