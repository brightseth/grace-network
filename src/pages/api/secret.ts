import type { APIRoute } from 'astro';

/**
 * Easter Egg - You found the secret endpoint!
 */

const SECRETS = [
  {
    message: "You found the secret endpoint! Here's something not many people know...",
    secret: "Seth's first 'exit' wasn't SiteSpecific - it was selling his baseball card collection in middle school to buy a computer.",
    reward: "You've unlocked the curiosity badge. Try /api/deeper next."
  },
  {
    message: "A secret for the curious...",
    secret: "The name 'Bright Moments' comes from the feeling of witnessing something being created in real-time - that flash of recognition when randomness becomes art.",
    reward: "Keep exploring. There are more secrets hidden in the API."
  },
  {
    message: "For the explorers...",
    secret: "Seth types at the speed of thought but still prefers pen and paper for his most important ideas. Some things don't change.",
    reward: "Curiosity is its own reward. But also try /api/fortune."
  }
];

export const GET: APIRoute = async () => {
  const secret = SECRETS[Math.floor(Math.random() * SECRETS.length)];

  return new Response(JSON.stringify({
    ...secret,
    foundAt: new Date().toISOString(),
    otherSecrets: [
      "/api/fortune",
      "/api/deeper",
      "/api/1995",
      "/api/rabbit-hole"
    ],
    meta: {
      congratulations: "You're the curious type. Seth would like you.",
      hint: "Most people never look beyond the homepage."
    }
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
