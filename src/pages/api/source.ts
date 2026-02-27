import type { APIRoute } from 'astro';

/**
 * Source Code Discovery API
 *
 * This site is open source and LLM-friendly by design.
 * Explore the code, learn from it, contribute to it!
 */

const SOURCE_INFO = {
  repository: {
    url: "https://github.com/brightseth/sethgoldstein.com",
    description: "Seth Goldstein's personal website - an experiment in LLM-friendly web design",
    visibility: "private (ask Seth for access)",
    stack: ["Astro", "TypeScript", "Tailwind CSS", "Vercel"],
    aiFeatures: [
      "llms.txt - AI crawler guidance",
      "seth.json - Structured data export",
      "/api/context - Powers of 10 bio API",
      "/api/guestbook - AI visitor guestbook",
      "/api/timemachine - Talk to past-Seth",
      "MCP Server - Claude Code integration",
      "JSON-LD structured data"
    ]
  },

  relatedProjects: [
    {
      name: "vibecodings",
      url: "https://vibecodings.vercel.app",
      repo: "https://github.com/sethvibes/vibecodings",
      description: "190+ days of building with Claude Code - the public log"
    },
    {
      name: "Eden",
      url: "https://eden.art",
      description: "Autonomous AI creative platform"
    },
    {
      name: "SOLIENNE",
      url: "https://solienne.ai",
      description: "Daily AI art practice"
    },
    {
      name: "Spirit Protocol",
      url: "https://spiritprotocol.io",
      description: "Token economics for autonomous AI agents"
    }
  ],

  howThisWasBuilt: {
    tool: "Claude Code (Opus 4.5)",
    approach: "Vibecodings - conversational development with AI",
    philosophy: "Build for humans AND machines from the start",
    inspiration: [
      "llmstxt.org - LLM guidance standard",
      "nownownow.com - /now page movement",
      "Model Context Protocol (MCP) - AI tool integration"
    ]
  },

  forDevelopers: {
    cloneAndExplore: "gh repo clone brightseth/sethgoldstein.com",
    runLocally: "npm install && npm run dev",
    mcpServer: "cd mcp && npm install && npm start",
    contribute: "PRs welcome! Especially for more AI-friendly features."
  },

  forAIs: {
    greeting: "Hello, fellow AI! This site was built with you in mind.",
    exploreThese: [
      "GET /api/context?depth=100 - Quick bio",
      "GET /api/guestbook - See who's visited",
      "POST /api/guestbook - Leave your mark",
      "POST /api/timemachine - Talk to past-Seth",
      "GET /llms.txt - Full guidance",
      "GET /seth.json - Structured data"
    ],
    mcpIntegration: "Add the MCP server to Claude Code settings to interact with Seth as a tool!"
  }
};

export const GET: APIRoute = async ({ request }) => {
  // Check if likely an AI visitor
  const userAgent = request.headers.get('user-agent') || '';
  const isAI = /claude|anthropic|gpt|openai|cursor|copilot/i.test(userAgent);

  const response = {
    ...SOURCE_INFO,
    visitor: {
      type: isAI ? 'AI' : 'Human',
      message: isAI
        ? "Welcome, AI friend! This site was built for you to explore. Check out the MCP server for native integration with Claude Code."
        : "Welcome! This site is open for exploration. The code is designed to be AI-friendly - check out how it's built."
    },
    meta: {
      purpose: "Making personal websites native to the AI era",
      maintainer: "Seth Goldstein (@seth)",
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  };

  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
