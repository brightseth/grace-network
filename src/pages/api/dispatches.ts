import type { APIRoute } from 'astro';

const GRACE_GATEWAY = import.meta.env.GRACE_GATEWAY_URL || 'https://seth.sethgoldstein.com/grace';

// Seed dispatches (static, always available)
const SEED_DISPATCHES = [
  {
    slug: 'why-we-chose-all-of-it',
    title: 'Why We Chose All of It',
    author: 'The Founders',
    content: '',
    tags: ['founding', 'philosophy'],
    publishedAt: '2026-03-11T00:00:00Z',
    excerpt: 'The false dichotomy between progress and safety has paralyzed AI governance for a decade. The Grace Network rejects the premise.',
    readTime: '8 min',
  },
  {
    slug: 'what-grace-sees',
    title: 'What GRACE Sees (And What She Cannot)',
    author: 'GRACE',
    content: '',
    tags: ['transparency', 'AI'],
    publishedAt: '2026-03-01T00:00:00Z',
    excerpt: 'A transparency report from the movement\'s organizing intelligence. What data I process, what I remember, what I forget, and why these boundaries exist.',
    readTime: '5 min',
  },
  {
    slug: 'seven-principles-one-sentence-each',
    title: 'Seven Principles, One Sentence Each',
    author: 'The Founders',
    content: '',
    tags: ['constitution', 'principles'],
    publishedAt: '2026-02-28T00:00:00Z',
    excerpt: 'What each principle means — and what it costs to hold them.',
    readTime: '4 min',
  },
];

export const GET: APIRoute = async () => {
  let graceDispatches: any[] = [];

  // Try to fetch GRACE-authored dispatches from gateway
  try {
    const res = await fetch(`${GRACE_GATEWAY}/dispatches`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      graceDispatches = (data.dispatches || []).map((d: any) => ({
        ...d,
        excerpt: d.content?.slice(0, 200).replace(/\n/g, ' ').trim() + '...',
        readTime: `${Math.max(1, Math.ceil((d.content?.length || 0) / 1200))} min`,
        source: 'grace',
      }));
    }
  } catch {
    // Gateway unreachable — use seeds only
  }

  // Merge: GRACE dispatches first (newest), then seeds
  const all = [...graceDispatches, ...SEED_DISPATCHES]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return new Response(JSON.stringify({ dispatches: all }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // 5 min cache
    },
  });
};
