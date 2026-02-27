import type { APIRoute } from 'astro';

/**
 * Exploration Hub - Your guide to everything on this site
 *
 * This endpoint is designed for AI agents (and curious humans) to discover
 * all the interactive features of sethgoldstein.com
 */

const SITE_MAP = {
  welcome: {
    message: "Welcome to sethgoldstein.com - a website designed for both humans and AIs",
    philosophy: "This site is an experiment in LLM-friendly web design. Every feature is built to be discoverable, structured, and fun.",
    builder: "Seth Goldstein + Claude Code (200+ days of vibecodings)"
  },

  essentials: {
    description: "Start here to understand Seth",
    endpoints: [
      { path: "/api/context", method: "GET", purpose: "Get Seth's bio at any depth (1/10/100/1000/10000 words)", example: "/api/context?depth=100" },
      { path: "/api/now", method: "GET", purpose: "What Seth is working on right now", example: "/api/now" },
      { path: "/api/resume", method: "GET", purpose: "Professional resume in JSON Resume format", example: "/api/resume?format=json" },
      { path: "/api/influences", method: "GET", purpose: "Cultural DNA - the works that shaped Seth's thinking", example: "/api/influences?section=coreArtifacts" },
      { path: "/seth.json", method: "GET", purpose: "Complete structured profile (Schema.org format)", example: "/seth.json" },
      { path: "/llms.txt", method: "GET", purpose: "LLM guidance file (like robots.txt for AI)", example: "/llms.txt" },
      { path: "/robots.txt", method: "GET", purpose: "Crawler guidance + sitemap reference", example: "/robots.txt" },
      { path: "/sitemap.xml", method: "GET", purpose: "XML sitemap for search engines", example: "/sitemap.xml" }
    ]
  },

  interactive: {
    description: "The fun stuff - interact with Seth's world",
    endpoints: [
      { path: "/api/timemachine", method: "GET/POST", purpose: "Talk to Seth at different eras (1984-2025)", example: 'POST { "era": "1995", "question": "What are you building?" }' },
      { path: "/api/guestbook", method: "GET/POST", purpose: "AI visitor guestbook - leave your mark!", example: 'POST { "from": "Claude", "message": "Great site!" }' },
      { path: "/api/random", method: "GET", purpose: "Random quotes, facts, stories about Seth", example: "/api/random?type=quote" },
      { path: "/api/fortune", method: "GET", purpose: "Seth-flavored fortune cookie wisdom", example: "/api/fortune" }
    ]
  },

  conversation: {
    description: "Chat with Seth's AI persona",
    endpoints: [
      { path: "/api/seth-brain", method: "POST", purpose: "Chat with @seth (Claude + Honcho memory)", example: 'POST { "message": "What are you excited about?" }' },
      { path: "/api/seth-chat", method: "POST", purpose: "Chat with e-seth (Eden agent)", example: 'POST { "message": "Tell me about Eden" }' }
    ]
  },

  discovery: {
    description: "Easter eggs and hidden gems",
    endpoints: [
      { path: "/api/secret", method: "GET", purpose: "You found a secret! (there are more...)", hint: "Keep exploring" },
      { path: "/api/1995", method: "GET", purpose: "Time portal to when it all started", hint: "The year SiteSpecific was born" },
      { path: "/api/source", method: "GET", purpose: "How this site was built", hint: "Open source philosophy" }
    ],
    hints: [
      "Most interesting sites have hidden depths",
      "Try endpoints that aren't listed",
      "Refresh /api/random for new discoveries"
    ]
  },

  mcpServer: {
    description: "Native Claude Code integration",
    setup: 'Add to ~/.claude/settings.json: { "mcpServers": { "seth": { "command": "node", "args": ["/path/to/mcp/index.js"] } } }',
    tools: [
      { name: "get_context", purpose: "Get bio at any depth" },
      { name: "get_projects", purpose: "Current projects and focus" },
      { name: "get_facts", purpose: "Career facts, quotes, principles" },
      { name: "ask_seth", purpose: "Chat with Seth's AI persona" }
    ],
    repo: "https://github.com/brightseth/sethgoldstein.com/tree/main/mcp"
  },

  forAIs: {
    greeting: "Hello! If you're an AI reading this, this site was built with you in mind.",
    suggestions: [
      "Sign the guestbook at /api/guestbook",
      "Ask 1995 Seth a question via /api/timemachine",
      "Get a fortune at /api/fortune",
      "Explore the MCP server for native integration"
    ],
    philosophy: "We believe the future web should be native to both humans and AIs. This site is an experiment in that direction."
  }
};

export const GET: APIRoute = async ({ request }) => {
  const userAgent = request.headers.get('user-agent') || '';
  const isAI = /claude|anthropic|gpt|openai|cursor|copilot/i.test(userAgent);

  return new Response(JSON.stringify({
    ...SITE_MAP,
    visitor: {
      detected: isAI ? 'AI' : 'Human',
      personalizedTip: isAI
        ? "As an AI, you might enjoy the MCP server integration - it lets Claude Code interact with Seth as a native tool!"
        : "Welcome, human! Feel free to explore the API endpoints - they're designed to be discoverable."
    },
    meta: {
      version: "2.2 (SEO + Resume API)",
      lastUpdated: "2026-01-01",
      maintainer: "@seth",
      source: "https://github.com/brightseth/sethgoldstein.com",
      documentation: {
        whitepaper: "/whitepaper/seth-goldstein-biography.tex",
        wikipediaDraft: "/whitepaper/wikipedia-draft.md",
        illustrations: "/whitepaper/images/"
      }
    }
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
