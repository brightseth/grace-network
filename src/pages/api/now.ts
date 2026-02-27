import type { APIRoute } from 'astro';

// Current focus data - keep in sync with /now page
const now = {
  lastUpdated: "2025-01-01",
  name: "Seth Goldstein",
  handle: "@seth",
  currentRole: {
    title: "CEO",
    company: "Eden",
    url: "https://eden.art",
    description: "Building autonomous AI creative agents"
  },
  activeProjects: [
    {
      name: "SOLIENNE",
      status: "Spring 2026 exhibitions",
      details: "Daily AI art practice. Art Dubai (April 2026), ISEA 2026, Berlin exhibition.",
      priority: "high",
      url: "https://solienne.ai"
    },
    {
      name: "NODE",
      status: "Opening January 2026",
      details: "Cultural venue in Denver for digital art exhibitions. Grand opening Jan 23-25.",
      priority: "high"
    },
    {
      name: "Spirit Protocol",
      status: "Building",
      details: "Token economics for autonomous AI agents.",
      priority: "medium"
    },
    {
      name: "vibecodings",
      status: "Ongoing",
      details: "190+ consecutive days building with Claude Code. Sharing the journey.",
      priority: "ongoing",
      url: "https://vibecodings.vercel.app"
    },
    {
      name: "fxhash Legacy",
      status: "Q1 2026",
      details: "Acquisition project for generative art marketplace stewardship.",
      priority: "medium"
    }
  ],
  recentMilestones: [
    { event: "Paris Photo 2025 - SOLIENNE exhibition", date: "Nov 2025" },
    { event: "Bright Moments Finale in Venice, Italy", date: "April 2024" },
    { event: "Eden platform launch", date: "2024" }
  ],
  location: "San Francisco (moving Feb 2025)",
  availability: "Open to meaningful conversations about AI, art, and community.",
  contact: {
    twitter: "https://twitter.com/seth",
    email: "sethgoldstein@gmail.com",
    linkedin: "https://linkedin.com/in/sethg"
  },
  meta: {
    humanReadable: "https://sethgoldstein.com/now",
    fullProfile: "https://sethgoldstein.com/seth.json",
    llmsGuide: "https://sethgoldstein.com/llms.txt"
  }
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(now, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
};
