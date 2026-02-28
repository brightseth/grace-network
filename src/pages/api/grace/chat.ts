import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || !sessionId) {
      return new Response(JSON.stringify({ error: 'Missing message or sessionId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const gatewayUrl = import.meta.env.GRACE_GATEWAY_URL || 'http://localhost:4200';
    const apiKey = import.meta.env.GRACE_API_KEY || '';

    const res = await fetch(`${gatewayUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({ message, sessionId }),
    });

    if (!res.ok) {
      // Fallback: return a static response when gateway is unavailable
      return new Response(JSON.stringify({
        reply: "Welcome to The Grace Network! I'm GRACE, the movement's organizing intelligence. While my full capabilities are coming online, I can tell you that we're building a political movement around 7 pillars of aligned governance: Safety-First Progress, Universal Flourishing, Radical Transparency, Digital Sovereignty, Scientific Governance, Aligned Incentives, and Cascading Abundance. Visit our Constitution page to learn more, or head to /build to start contributing.",
        suggestedActions: ["Read the Constitution", "Start Building", "Learn about the Pillars"]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Fallback response when gateway is unreachable
    return new Response(JSON.stringify({
      reply: "Welcome to The Grace Network! I'm GRACE. I'm currently in early deployment, but I'm here to help you understand our movement. We believe in building the governance systems we want to see — through open source, radical transparency, and collaborative action. Check out /build to see our active workstreams.",
      suggestedActions: ["View Workstreams", "Read Constitution"]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
