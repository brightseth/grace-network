import type { APIRoute } from 'astro';

export const prerender = false;

// LiveAvatar API config
const LIVEAVATAR_API_KEY = import.meta.env.LIVEAVATAR_API_KEY || '4cc4a58b-9ead-43b1-9efc-b2e459e7572a';
const SETH_AVATAR_ID = '793f65a7-d5fd-4bc8-a271-662ffe413c4f';
const SETH_CONTEXT_ID = '0534dbee-c152-4830-a564-ac7eb724bc44';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if custom mode requested (for Claude SDK brain)
    const body = await request.json().catch(() => ({}));
    const useCustomMode = body.customMode === true;

    const requestBody: any = {
      avatar_id: SETH_AVATAR_ID,
    };

    if (useCustomMode) {
      // CUSTOM mode: We control the LLM, LiveAvatar just handles video
      requestBody.mode = 'CUSTOM';
      // Custom mode requires livekit_config instead of avatar_persona
    } else {
      // FULL mode: LiveAvatar handles both video and LLM
      requestBody.mode = 'FULL';
      requestBody.avatar_persona = {
        context_id: SETH_CONTEXT_ID,
        language: 'en',
      };
    }

    const response = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'x-api-key': LIVEAVATAR_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.code !== 1000) {
      console.error('[Avatar Token] LiveAvatar error:', data);
      return new Response(JSON.stringify({
        error: 'Failed to create session',
        details: data.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('[Avatar Token] Session created:', data.data.session_id);

    return new Response(JSON.stringify({
      token: data.data.session_token,
      sessionId: data.data.session_id,
      mode: useCustomMode ? 'CUSTOM' : 'FULL',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Avatar Token] Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Health check
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    status: 'ok',
    avatarId: SETH_AVATAR_ID,
    contextId: SETH_CONTEXT_ID,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
