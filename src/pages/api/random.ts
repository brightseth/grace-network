import type { APIRoute } from 'astro';

/**
 * Random Discovery API - Surprise facts, quotes, and stories about Seth
 *
 * GET /api/random - Get a random piece of Seth content
 * GET /api/random?type=quote - Get a random quote
 * GET /api/random?type=fact - Get a random fact
 * GET /api/random?type=story - Get a random story
 */

interface RandomContent {
  type: 'quote' | 'fact' | 'story' | 'connection' | 'principle';
  content: string;
  context?: string;
  year?: string;
  source?: string;
}

const RANDOM_CONTENT: RandomContent[] = [
  // Quotes
  {
    type: 'quote',
    content: "If you aren't embarrassed by what you release, you have waited too long.",
    context: "On shipping products",
    source: "Seth Goldstein"
  },
  {
    type: 'quote',
    content: "Have difficult conversations now. Do not wait. They do not get easier or better with time.",
    context: "On communication",
    source: "Seth Goldstein"
  },
  {
    type: 'quote',
    content: "Money is not the goal, it's a means of helping you work on what you want, when you want and with whom you want.",
    context: "On wealth",
    source: "Seth Goldstein"
  },
  {
    type: 'quote',
    content: "The CEO's job is to be anxious when things are going too well, and relaxed when things are going too badly; like a shock absorber.",
    context: "On leadership",
    source: "Seth Goldstein"
  },
  {
    type: 'quote',
    content: "The class of generative artists working today will be revered in the future as the last tribe of artisanal coders who held out the promise of human digital creativity before the onset of AI.",
    context: "On generative art",
    source: "Seth Goldstein"
  },
  {
    type: 'quote',
    content: "I doubt that I will ever give up trying to create new things.",
    context: "On entrepreneurship",
    source: "Seth Goldstein"
  },

  // Facts
  {
    type: 'fact',
    content: "Seth was cast by legendary theater director Robert Wilson at age 14.",
    year: "1984",
    context: "The play was 'Civil WarS' at the American Repertory Theater"
  },
  {
    type: 'fact',
    content: "SiteSpecific became the subject of Harvard Business School's first case study on internet marketing.",
    year: "1996",
    context: "Seth was recognized as one of Red Herring's Top 20 Entrepreneurs"
  },
  {
    type: 'fact',
    content: "Turntable.fm reached 600,000 users in just four months after launch.",
    year: "2011",
    context: "The social music platform combined DJing, gaming, and social networking"
  },
  {
    type: 'fact',
    content: "Bright Moments expanded to 9 cities worldwide, ending with 'The Finale' in Venice, Italy.",
    year: "2024",
    context: "Cities included Venice Beach, New York, Berlin, London, Tokyo, and more"
  },
  {
    type: 'fact',
    content: "Seth has no computer science degree - his career is built entirely on pattern recognition and first-principles thinking.",
    context: "A reminder that formal credentials aren't everything"
  },
  {
    type: 'fact',
    content: "Seth has been building with Claude Code for 190+ consecutive days as of January 2026.",
    year: "2025-2026",
    context: "Documented at vibecodings.vercel.app"
  },
  {
    type: 'fact',
    content: "The first computer graphic Seth ever saw was a digital image of a bear at his dad's office at Applicon.",
    year: "Late 1970s",
    context: "His father worked as a QA consultant on Boston's Route 128"
  },

  // Stories
  {
    type: 'story',
    content: "I woke up the next morning and realized that my NFT had been sold while I was asleep, and that there was ETH in my wallet. This was a breakthrough moment for me, as it dawned on me how significant this file format could be as a creative unlock.",
    year: "2021",
    context: "The moment that led to founding Bright Moments"
  },
  {
    type: 'story',
    content: "What we stumbled onto is the special experience of a human being looking at a screen with other humans as a work of generative art is revealed for the first time. It's memorable because you're bringing something that is mathematically random into the real world.",
    year: "2021",
    context: "On discovering the magic of live minting"
  },
  {
    type: 'story',
    content: "It was really the glory years of the internet before it became overrun by MBAs and bankers and all sorts of mercenaries and opportunists. It was naïve and wonderful and it really felt like we were doing something original.",
    year: "1995",
    context: "On the early days of SiteSpecific"
  },

  // Connections
  {
    type: 'connection',
    content: "Seth's path from avant-garde theater (1984) to AI agents (2025) shows a consistent thread: using technology to enhance human creativity and connection.",
    context: "A 40-year arc"
  },
  {
    type: 'connection',
    content: "Robert Wilson (theater mentor) → digital archives → interactive media → web → social music → NFTs → AI agents: each transition anticipated the next platform shift.",
    context: "Pattern recognition across decades"
  },

  // Principles
  {
    type: 'principle',
    content: "Anticipate the future - identify technologies 3-5 years before mainstream adoption.",
    context: "Core operating principle"
  },
  {
    type: 'principle',
    content: "Build community-centric innovation - platforms that bring people together in meaningful ways.",
    context: "Core operating principle"
  },
  {
    type: 'principle',
    content: "Embrace adaptability - pivot when necessary while maintaining focus on long-term vision.",
    context: "Core operating principle"
  }
];

export const GET: APIRoute = async ({ url }) => {
  const typeFilter = url.searchParams.get('type');
  const count = Math.min(parseInt(url.searchParams.get('count') || '1'), 5);

  let pool = RANDOM_CONTENT;

  if (typeFilter && ['quote', 'fact', 'story', 'connection', 'principle'].includes(typeFilter)) {
    pool = RANDOM_CONTENT.filter(c => c.type === typeFilter);
  }

  // Get random items
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  const response = {
    random: count === 1 ? selected[0] : selected,
    meta: {
      totalAvailable: pool.length,
      types: [...new Set(RANDOM_CONTENT.map(c => c.type))],
      usage: {
        all: "GET /api/random",
        filtered: "GET /api/random?type=quote",
        multiple: "GET /api/random?count=3"
      }
    },
    hint: "Refresh for another random discovery! Or try /api/timemachine to talk to past-Seth."
  };

  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache' // Always fresh random content
    }
  });
};
