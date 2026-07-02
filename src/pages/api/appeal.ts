import type { APIRoute } from 'astro';

// Same-origin forwarder for public appeals against GRACE decision records.
// The browser posts here; we forward to the gateway with the API key held
// server-side (no CORS, no unauthenticated write endpoint on the raw internet).
const GRACE_GATEWAY = import.meta.env.GRACE_GATEWAY_URL || 'https://seth.sethgoldstein.com/grace';
const API_KEY = import.meta.env.GRACE_API_KEY || '';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { target, contestant, claim } = body;

    if (!target || !contestant || !claim) {
      return new Response(
        JSON.stringify({ error: 'target, contestant, and claim are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const res = await fetch(`${GRACE_GATEWAY}/appeal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': API_KEY },
      body: JSON.stringify({
        target: String(target).slice(0, 40),
        contestant: String(contestant).slice(0, 120),
        claim: String(claim).slice(0, 2000),
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      // Gateway down — fall back to the standing email channel named in DR-001.
      return new Response(
        JSON.stringify({
          error: 'gateway-unreachable',
          message:
            'The appeal endpoint is temporarily unreachable. Email grace@gracenetwork.ai with subject "CONTEST <record-id>" — every contest is appended to the ledger by hand.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'appeal failed';
    return new Response(
      JSON.stringify({
        error: 'failed',
        message:
          'Could not file the appeal. Email grace@gracenetwork.ai with subject "CONTEST <record-id>" instead.',
        detail: message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
