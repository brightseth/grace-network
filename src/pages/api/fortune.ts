import type { APIRoute } from 'astro';

/**
 * Seth-Flavored Fortune Cookie
 * Wisdom from decades of building things
 */

const FORTUNES = [
  // On building
  "The best time to ship was yesterday. The second best time is now.",
  "Every successful company started as an embarrassing prototype.",
  "The market doesn't care about your roadmap. Ship something real.",
  "Complexity is easy. Simplicity takes courage.",
  "Your users will teach you more than your advisors.",

  // On timing
  "Being early is the same as being wrong, until suddenly it isn't.",
  "The best founders are often called crazy for 5 years, then obvious in hindsight.",
  "Patience and urgency are not opposites. Master both.",
  "The wave you're waiting for might be the one you're already riding.",

  // On creativity
  "Technology is most powerful when it disappears into the experience.",
  "Constraints are gifts. Infinite resources lead to infinite indecision.",
  "The best art happens at the intersection of disciplines.",
  "Don't optimize for metrics. Optimize for meaning.",

  // On community
  "The community you build is more valuable than the product you ship.",
  "People remember how you made them feel, not what you sold them.",
  "Culture scales. Features don't.",
  "The best marketing is something worth talking about.",

  // On leadership
  "Hire people who make you uncomfortable with how good they are.",
  "The hardest conversations are usually the most important ones.",
  "Your job is to be wrong faster than your competition.",
  "Energy is contagious. So is exhaustion. Choose wisely.",

  // On longevity
  "You can't sprint through a marathon.",
  "The companies that last think in decades, not quarters.",
  "Reputation compounds. Guard it carefully.",
  "The long game is the only game worth playing."
];

export const GET: APIRoute = async () => {
  const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  const luckyNumbers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 50) + 1);

  return new Response(JSON.stringify({
    fortune,
    from: "Seth's fortune cookie jar",
    luckyNumbers,
    luckyEndpoint: ["/api/random", "/api/timemachine", "/api/guestbook", "/api/secret"][Math.floor(Math.random() * 4)],
    meta: {
      totalFortunes: FORTUNES.length,
      refreshForAnother: true,
      disclaimer: "Not actual financial advice. Unless it works."
    }
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    }
  });
};
