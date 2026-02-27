#!/usr/bin/env node

/**
 * Seth Goldstein MCP Server
 *
 * An MCP server that exposes Seth's context, knowledge, and chat capabilities
 * as tools that Claude Code can interact with directly.
 *
 * Tools available:
 * - get_context: Get bio at different depth levels (1, 10, 100, 1000, 10000 words)
 * - get_projects: Get current projects and focus areas
 * - get_facts: Get key facts, quotes, and principles
 * - ask_seth: Chat with Seth's AI persona
 *
 * Usage in Claude Code:
 * Add to ~/.claude/settings.json:
 * {
 *   "mcpServers": {
 *     "seth": {
 *       "command": "node",
 *       "args": ["/path/to/sethgoldstein.com/mcp/index.js"]
 *     }
 *   }
 * }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Seth's bio at different depth levels (Powers of 10)
const BIO_LEVELS = {
  1: "@seth",
  10: "Pioneer connecting creativity and technology through meaningful human experiences.",
  100: `Seth Goldstein is a visionary entrepreneur and digital art pioneer who has consistently bridged the worlds of technology and creativity throughout his career. From founding groundbreaking internet companies to launching innovative social platforms and championing the NFT art movement, his work focuses on building meaningful connections between people and technology. Through ventures like Bright Moments, he continues to push the boundaries of digital expression and community engagement. His ability to identify transformative technologies before mainstream adoption has established him as a forward-thinking leader in both the tech and art worlds.`,
  1000: `Seth Goldstein: Pioneer, Entrepreneur, Creator

Seth Goldstein has spent three decades identifying transformative technology platforms years before mainstream adoption, from early web advertising to blockchain and NFTs. His career represents a unique convergence of artistic sensibility, entrepreneurial drive, and technological vision.

Beginning in theater and performance art, Seth's formative experiences shaped his understanding of human connection and creative expression. As a teenager in the 1980s, he performed in avant-garde productions and was mentored by visionary theater director Robert Wilson.

With the dawn of the commercial internet, Seth founded SiteSpecific in 1995, one of the first interactive advertising agencies. After its acquisition for $12M, he joined Flatiron Partners as their first Entrepreneur-in-Residence.

In 2002, Seth co-founded Majestic Research, pioneering alternative data for financial research, later acquired by ITG for $75M. In 2011, he co-founded Turntable.fm, which reached 600,000 users in four months.

In 2021, Seth founded Bright Moments, a crypto art gallery DAO pioneering 'live minting' experiences across 9 cities. Currently, he serves as CEO of Eden, building autonomous AI creative agents, while working on Abraham, SOLIENNE, NODE, and Spirit Protocol.`,
  10000: "Full 10,000 word biography available at https://sethgoldstein.com/api/context?depth=10000"
};

// Current projects
const PROJECTS = [
  {
    name: "Eden",
    role: "CEO",
    description: "Autonomous AI creative platform enabling artists to create AI agents",
    url: "https://eden.art"
  },
  {
    name: "Abraham",
    description: "13-year autonomous artist covenant - AI artist with long-term creative autonomy",
    url: "https://abraham.ai"
  },
  {
    name: "SOLIENNE",
    description: "Daily AI art practice with Spring 2026 exhibitions (Art Dubai, Berlin)",
    url: "https://solienne.ai"
  },
  {
    name: "NODE",
    description: "Cultural venue opening January 2026 in Denver for digital art exhibitions",
    location: "Denver, CO"
  },
  {
    name: "Spirit Protocol",
    description: "Token economics for autonomous AI agents"
  },
  {
    name: "vibecodings",
    description: "190+ consecutive days building with Claude Code",
    url: "https://vibecodings.vercel.app"
  }
];

// Key facts and data
const FACTS = {
  career: {
    companies_founded: 10,
    notable_exits: [
      { name: "SiteSpecific", year: 1997, amount: "$12M" },
      { name: "Majestic Research", year: 2010, amount: "$75M" }
    ],
    bright_moments_cities: ["Venice Beach", "New York", "Berlin", "London", "Mexico City", "Tokyo", "Buenos Aires", "Paris", "Venice Italy"]
  },
  contact: {
    twitter: "@seth",
    email: "sethgoldstein@gmail.com",
    linkedin: "https://linkedin.com/in/sethg",
    website: "https://sethgoldstein.com"
  },
  quotes: [
    "If you aren't embarrassed by what you release, you have waited too long.",
    "Have difficult conversations now. Do not wait. They do not get easier or better with time.",
    "Money is not the goal, it's a means of helping you work on what you want, when you want and with whom you want.",
    "The class of generative artists working today will be revered in the future as the last tribe of artisanal coders who held out the promise of human digital creativity before the onset of AI."
  ],
  principles: [
    "Anticipate the future - identify technologies 3-5 years before mainstream",
    "Empower creativity through technology",
    "Build community-centric innovation",
    "Embrace adaptability",
    "Lead with empathy"
  ]
};

// Create server
const server = new Server(
  {
    name: 'seth-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_context',
        description: 'Get Seth Goldstein\'s bio at different depth levels (Powers of 10). Useful for understanding who Seth is at varying levels of detail.',
        inputSchema: {
          type: 'object',
          properties: {
            depth: {
              type: 'number',
              description: 'Word count depth: 1 (handle only), 10 (tagline), 100 (summary), 1000 (full bio), 10000 (complete biography)',
              enum: [1, 10, 100, 1000, 10000]
            }
          },
          required: ['depth']
        }
      },
      {
        name: 'get_projects',
        description: 'Get Seth\'s current projects and focus areas. Returns detailed information about what Seth is currently building.',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'Optional filter by project type: ai, art, infrastructure, or all',
              enum: ['ai', 'art', 'infrastructure', 'all']
            }
          }
        }
      },
      {
        name: 'get_facts',
        description: 'Get key facts about Seth including career milestones, contact info, notable quotes, and principles.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Category of facts: career, contact, quotes, principles, or all',
              enum: ['career', 'contact', 'quotes', 'principles', 'all']
            }
          }
        }
      },
      {
        name: 'ask_seth',
        description: 'Ask Seth a question. This calls Seth\'s AI persona which can answer questions about his work, philosophy, and perspectives. Best for open-ended questions about advice, opinions, or experiences.',
        inputSchema: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'The question to ask Seth'
            }
          },
          required: ['question']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_context': {
      const depth = args?.depth || 100;
      const validDepths = [1, 10, 100, 1000, 10000];
      const closestDepth = validDepths.reduce((prev, curr) =>
        Math.abs(curr - depth) < Math.abs(prev - depth) ? curr : prev
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              name: "Seth Goldstein",
              handle: "@seth",
              depth: closestDepth,
              bio: BIO_LEVELS[closestDepth],
              links: {
                website: "https://sethgoldstein.com",
                fullProfile: "https://sethgoldstein.com/seth.json",
                deeperContext: closestDepth < 10000
                  ? `https://sethgoldstein.com/api/context?depth=${validDepths[validDepths.indexOf(closestDepth) + 1]}`
                  : null
              }
            }, null, 2)
          }
        ]
      };
    }

    case 'get_projects': {
      const filter = args?.filter || 'all';
      let projects = PROJECTS;

      if (filter !== 'all') {
        const filterMap = {
          ai: ['Eden', 'Abraham', 'SOLIENNE', 'Spirit Protocol'],
          art: ['SOLIENNE', 'NODE', 'vibecodings'],
          infrastructure: ['Eden', 'Spirit Protocol', 'NODE']
        };
        projects = PROJECTS.filter(p => filterMap[filter]?.includes(p.name));
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              currentRole: "CEO of Eden",
              projects,
              count: projects.length
            }, null, 2)
          }
        ]
      };
    }

    case 'get_facts': {
      const category = args?.category || 'all';

      if (category === 'all') {
        return {
          content: [{ type: 'text', text: JSON.stringify(FACTS, null, 2) }]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ [category]: FACTS[category] }, null, 2)
          }
        ]
      };
    }

    case 'ask_seth': {
      const question = args?.question;
      if (!question) {
        return {
          content: [{ type: 'text', text: 'Error: question is required' }],
          isError: true
        };
      }

      try {
        // Call the seth-brain API
        const response = await fetch('https://sethgoldstein.com/api/seth-brain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: question, userId: 'mcp-client' })
        });

        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }

        const data = await response.json();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                question,
                response: data.reply,
                source: 'seth-brain (Claude + Honcho memory)'
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        // Fallback to local response if API fails
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                question,
                response: "I'm currently offline, but you can reach me at sethgoldstein@gmail.com or check sethgoldstein.com for more context.",
                source: 'fallback',
                note: 'Live API unavailable - try again later for personalized response'
              }, null, 2)
            }
          ]
        };
      }
    }

    default:
      return {
        content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        isError: true
      };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Seth MCP server running on stdio');
}

main().catch(console.error);
