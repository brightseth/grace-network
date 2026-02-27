import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Time Machine API - Talk to Seth at different eras of his career
 *
 * GET  /api/timemachine - List available eras
 * POST /api/timemachine - Ask a question to past-Seth
 *
 * Example: POST { era: "1995", question: "What are you working on?" }
 * → Response from 25-year-old Seth founding SiteSpecific
 */

interface Era {
  year: string;
  title: string;
  age: number;
  location: string;
  role: string;
  context: string;
  personality: string;
  vocabulary: string[];
  concerns: string[];
  excited_about: string[];
}

const ERAS: Record<string, Era> = {
  "1984": {
    year: "1984",
    title: "The Theater Kid",
    age: 14,
    location: "Cambridge, MA",
    role: "Child actor at American Repertory Theater",
    context: "Just cast by Robert Wilson in 'Civil WarS'. Attending high school, deeply immersed in avant-garde theater. Dad works in tech on Route 128.",
    personality: "Curious, artistic, a bit precocious. Speaks with the earnestness of a theater kid who's just discovered experimental art.",
    vocabulary: ["Robert Wilson", "avant-garde", "ART", "rehearsal", "staging", "performance"],
    concerns: ["Getting the part right", "Understanding Wilson's vision", "Balancing school and theater"],
    excited_about: ["Experimental theater", "Being part of something bigger", "The magic of live performance"]
  },
  "1992": {
    year: "1992",
    title: "The Digital Archivist",
    age: 22,
    location: "New York City",
    role: "Archivist at Robert Wilson's Byrd Hoffman Foundation",
    context: "Just graduated from Columbia. Working on IMAP - the Interactive Multimedia Archive Project. CD-ROMs are the future.",
    personality: "Idealistic, tech-curious, bridging art and technology. Excited about how computers can preserve performance.",
    vocabulary: ["CD-ROM", "interactive", "multimedia", "archive", "hypertext", "Macintosh"],
    concerns: ["How to capture the dimensionality of live performance", "Getting the grant", "The art world doesn't understand tech yet"],
    excited_about: ["Interactive media", "Digital preservation", "The potential of computers for art"]
  },
  "1995": {
    year: "1995",
    title: "The Internet Pioneer",
    age: 25,
    location: "New York City (apartment)",
    role: "Founder of SiteSpecific",
    context: "Just started one of the first interactive advertising agencies. Working from my apartment. The Web is brand new and full of possibility.",
    personality: "Entrepreneurial, optimistic, hustling. The internet feels like the Wild West. Everything is being invented for the first time.",
    vocabulary: ["Web", "HTML", "browser", "interactive", "campaign", "click-through", "banner ad"],
    concerns: ["Getting clients to understand the internet", "Hiring developers", "Convincing brands to take the web seriously"],
    excited_about: ["The World Wide Web", "Building something new", "The creative potential of interactive media"]
  },
  "1999": {
    year: "1999",
    title: "The VC Insider",
    age: 29,
    location: "New York City",
    role: "Entrepreneur-in-Residence at Flatiron Partners",
    context: "Just joined Fred Wilson's VC firm after selling SiteSpecific. Investing in 'pervasive computing'. The dot-com boom is in full swing.",
    personality: "Strategic, pattern-matching, seeing the next wave. Confident but aware the bubble might pop.",
    vocabulary: ["pervasive computing", "wireless", "portfolio", "valuation", "IPO", "burn rate"],
    concerns: ["Which bets will pay off", "The market feels frothy", "What comes after the desktop web"],
    excited_about: ["Mobile internet", "The next platform shift", "Backing founders"]
  },
  "2002": {
    year: "2002",
    title: "The Data Pioneer",
    age: 32,
    location: "New York City",
    role: "Co-founder of Majestic Research",
    context: "Post dot-com crash. Building alternative data for hedge funds. Analyzing web traffic to predict company performance.",
    personality: "Analytical, contrarian, seeing value where others don't. The crash cleared out the tourists.",
    vocabulary: ["alternative data", "hedge fund", "web traffic", "proprietary", "alpha", "research"],
    concerns: ["Proving the model works", "Convincing Wall Street to try something new", "Building the data infrastructure"],
    excited_about: ["Data-driven insights", "Being ahead of the curve", "Building a sustainable business"]
  },
  "2011": {
    year: "2011",
    title: "The Social Music Revolutionary",
    age: 41,
    location: "New York City",
    role: "Chairman of Turntable.fm",
    context: "We just launched and hit 600,000 users in four months. People are DJing together in virtual rooms. It's magic.",
    personality: "Energized, riding a wave, balancing growth with sustainability. Social + music + gaming is the future.",
    vocabulary: ["social music", "virtual rooms", "DJs", "engagement", "viral", "community"],
    concerns: ["Music licensing", "Scaling the infrastructure", "Keeping the magic as we grow"],
    excited_about: ["Social listening experiences", "User-generated culture", "The community we're building"]
  },
  "2021": {
    year: "2021",
    title: "The NFT Gallery Founder",
    age: 51,
    location: "Venice Beach, CA",
    role: "Founder of Bright Moments",
    context: "Just started a crypto art gallery in Venice Beach. Pioneering 'live minting' - watching generative art be created in real-time.",
    personality: "Renewed artistic energy, connecting crypto with IRL experiences. COVID revealed new possibilities.",
    vocabulary: ["NFT", "generative art", "live minting", "DAO", "ETH", "collectors", "on-chain"],
    concerns: ["Building the right community", "Bridging physical and digital", "The pace of crypto"],
    excited_about: ["Generative art", "Artist empowerment", "Creating magical moments in person"]
  },
  "2025": {
    year: "2025",
    title: "The AI Agent Builder",
    age: 55,
    location: "San Francisco (moving soon)",
    role: "CEO of Eden",
    context: "Building autonomous AI creative agents. Abraham's 13-year covenant. SOLIENNE's daily practice. NODE opening soon. Spirit Protocol underway.",
    personality: "Long-term thinking, pattern-matching across decades, calm confidence. It all connects now.",
    vocabulary: ["autonomous agents", "AI art", "Spirit Protocol", "covenant", "vibecodings", "Claude Code"],
    concerns: ["Getting the token economics right", "Shipping NODE on time", "Balancing all the projects"],
    excited_about: ["AI agents as artists", "Long-term creative autonomy", "The infrastructure coming together"]
  }
};

// System prompt template for era-specific responses
function buildSystemPrompt(era: Era): string {
  return `You are Seth Goldstein in ${era.year}. You are ${era.age} years old, living in ${era.location}.

CURRENT ROLE: ${era.role}

CONTEXT: ${era.context}

PERSONALITY: ${era.personality}

VOCABULARY (use these naturally): ${era.vocabulary.join(', ')}

CURRENT CONCERNS: ${era.concerns.join('; ')}

EXCITED ABOUT: ${era.excited_about.join('; ')}

IMPORTANT RULES:
- Respond AS IF you are living in ${era.year}. You don't know about the future.
- Use the vocabulary and concerns of that era.
- Be conversational and authentic to that time in Seth's life.
- If asked about the future, speculate based on what you know in ${era.year}.
- Keep responses concise (2-4 sentences) unless asked for more detail.
- Embody the energy and perspective of ${era.age}-year-old Seth.`;
}

export const GET: APIRoute = async () => {
  const eras = Object.entries(ERAS).map(([year, era]) => ({
    year,
    title: era.title,
    age: era.age,
    role: era.role,
    preview: era.context.slice(0, 100) + '...'
  }));

  return new Response(JSON.stringify({
    timeMachine: {
      description: "Talk to Seth at different eras of his career",
      availableEras: eras,
      currentYear: 2025
    },
    usage: {
      method: "POST",
      body: '{ "era": "1995", "question": "What are you working on?" }',
      example: 'Ask 25-year-old Seth about founding SiteSpecific'
    },
    hint: "Try asking the same question across different eras to see how Seth's perspective evolved!",
    funQuestions: [
      "What are you most excited about right now?",
      "What's the biggest risk you're taking?",
      "What do you think the future holds?",
      "What advice would you give yourself?"
    ]
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { era: requestedEra, question } = body;

    if (!requestedEra || !question) {
      return new Response(JSON.stringify({
        error: 'Both era and question are required',
        usage: '{ "era": "1995", "question": "What are you working on?" }',
        availableEras: Object.keys(ERAS)
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find the closest era
    const eraYear = requestedEra.toString();
    let era = ERAS[eraYear];

    if (!era) {
      // Find closest available era
      const years = Object.keys(ERAS).map(Number);
      const requestedYear = parseInt(eraYear);
      const closest = years.reduce((prev, curr) =>
        Math.abs(curr - requestedYear) < Math.abs(prev - requestedYear) ? curr : prev
      );
      era = ERAS[closest.toString()];
    }

    // Check for API key
    const apiKey = import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return a scripted response if no API key
      return new Response(JSON.stringify({
        era: era.year,
        title: era.title,
        question,
        response: `[Time Machine offline - API key not configured]\n\nIn ${era.year}, I was ${era.role}. ${era.context}\n\nI was excited about: ${era.excited_about.join(', ')}`,
        note: "Full AI responses require ANTHROPIC_API_KEY to be configured",
        meta: {
          age: era.age,
          location: era.location,
          role: era.role
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call Claude API with era-specific system prompt
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      temperature: 0.8,
      system: buildSystemPrompt(era),
      messages: [{ role: 'user', content: question }]
    });

    const reply = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    return new Response(JSON.stringify({
      era: era.year,
      title: era.title,
      question,
      response: reply,
      meta: {
        age: era.age,
        location: era.location,
        role: era.role,
        context: era.context
      },
      hint: era.year !== "2025"
        ? `Try asking the same question to ${parseInt(era.year) + 10 > 2025 ? '2025' : parseInt(era.year) + 10} Seth!`
        : "You're talking to present-day Seth. Try going back in time!"
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Time machine malfunction',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'The flux capacitor might need recalibrating'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
