import type { APIRoute } from 'astro';

/**
 * Professional Resume API - Structured career data for LinkedIn, recruiters, and AI agents
 *
 * Returns Seth's professional background in multiple formats optimized for:
 * - LinkedIn profile imports
 * - Professional networking
 * - AI agent context building
 * - Recruiter/investor due diligence
 */

const RESUME = {
  basics: {
    name: "Seth Goldstein",
    label: "CEO & Serial Entrepreneur",
    email: "sethgoldstein@gmail.com",
    phone: "", // Available upon request
    url: "https://sethgoldstein.com",
    summary: "Serial entrepreneur with 30+ years building companies at the intersection of technology, art, and human connection. Two successful exits ($12M + $75M). Currently leading Eden, building autonomous AI creative agents. Pioneer in digital art galleries (Bright Moments), social music (Turntable.fm), and alternative data (Majestic Research).",
    location: {
      city: "San Francisco",
      region: "California",
      countryCode: "US"
    },
    profiles: [
      { network: "Twitter", username: "seth", url: "https://twitter.com/seth" },
      { network: "LinkedIn", username: "seth", url: "https://linkedin.com/in/sethg" },
      { network: "GitHub", username: "brightseth", url: "https://github.com/brightseth" }
    ]
  },

  work: [
    {
      company: "Eden",
      position: "CEO",
      url: "https://eden.art",
      startDate: "2024-01",
      endDate: null,
      summary: "Leading platform for autonomous AI creative agents. Building Spirit Protocol for AI agent economics and identity.",
      highlights: [
        "Launched Abraham - 13-year covenant with autonomous AI artist",
        "Created SOLIENNE - daily AI art practice with exhibitions at Paris Photo, Art Dubai",
        "Opening NODE cultural venue in Denver (January 2026)",
        "Developing Spirit Protocol for AI agent autonomy and economics"
      ]
    },
    {
      company: "Bright Moments",
      position: "Founder & CEO",
      url: "https://brightmoments.io",
      startDate: "2021-01",
      endDate: "2024-04",
      summary: "Founded pioneering NFT gallery DAO specializing in live, in-person generative art minting experiences.",
      highlights: [
        "Expanded to 9 cities: LA, NYC, Berlin, London, Tokyo, Mexico City, Buenos Aires, Paris, Venice",
        "Featured artists: Tyler Hobbs, Emily Xie, Dmitri Cherniak, Casey Reas",
        "Pioneered 'IRL minting' - witnessing generative art creation in real-time",
        "Structured as DAO with CryptoCitizens NFT membership"
      ]
    },
    {
      company: "Turntable.fm",
      position: "Co-Founder & CEO",
      url: "https://turntable.fm",
      startDate: "2011-01",
      endDate: "2014-01",
      summary: "Co-founded social music platform allowing users to DJ together in virtual rooms.",
      highlights: [
        "600,000 users in 4 months",
        "Raised $7M Series A at $37M valuation from Union Square Ventures",
        "Influenced later products including Discord and Spotify listening parties",
        "Celebrity DJs included Questlove, Lady Gaga's manager Troy Carter invested"
      ]
    },
    {
      company: "Majestic Research",
      position: "Founder & CEO, later Chairman",
      startDate: "2002-01",
      endDate: "2010-01",
      summary: "Pioneered alternative data research for hedge funds using web analytics.",
      highlights: [
        "Acquired by Investment Technology Group (ITG) for ~$75 million",
        "Sold $200K research subscriptions to 200+ hedge funds",
        "Pioneer in what became the 'alternative data' industry"
      ]
    },
    {
      company: "Flatiron Partners",
      position: "Entrepreneur-in-Residence & Investment Principal",
      startDate: "1999-01",
      endDate: "2001-01",
      summary: "Built and managed $75M portfolio in pervasive computing investments.",
      highlights: [
        "Early investor in del.icio.us (acquired by Yahoo)",
        "Early investor in Etherpad (acquired by Google)",
        "Worked with Fred Wilson and Jerry Colonna"
      ]
    },
    {
      company: "SiteSpecific",
      position: "Founder & CEO",
      startDate: "1995-08",
      endDate: "1997-05",
      summary: "Founded one of the first internet marketing agencies.",
      highlights: [
        "Acquired by CKS Group for ~$12 million",
        "Won Clio Award for Duracell corporate website",
        "Harvard Business School first case study on internet marketing",
        "Featured on Wall Street Journal front page"
      ]
    }
  ],

  education: [
    {
      institution: "Columbia University",
      area: "Dramatic Literature",
      studyType: "Bachelor of Arts",
      startDate: "1988",
      endDate: "1992",
      activities: "Founded Columbia Theater Network (CTN)"
    },
    {
      institution: "Interlochen Arts Academy",
      area: "Performing Arts",
      studyType: "High School",
      startDate: "1987",
      endDate: "1988"
    }
  ],

  skills: [
    { name: "Entrepreneurship", keywords: ["Startups", "Fundraising", "Exit Strategy", "Team Building"] },
    { name: "Digital Art", keywords: ["NFTs", "Generative Art", "AI Art", "Gallery Operations"] },
    { name: "Technology", keywords: ["AI Agents", "Web3", "Blockchain", "Platform Development"] },
    { name: "Leadership", keywords: ["CEO", "Board Member", "Advisor", "Public Speaking"] }
  ],

  awards: [
    { title: "Clio Award", date: "1996", awarder: "Clio Awards", summary: "Duracell corporate website" },
    { title: "Top 20 Entrepreneurs", date: "1997", awarder: "Red Herring Magazine" },
    { title: "I.D. Magazine Bronze Award", date: "1999", awarder: "I.D. Magazine", summary: "Improvisation Technologies CD-ROM" }
  ],

  interests: [
    { name: "AI & Autonomous Systems", keywords: ["AI Agents", "Spirit Protocol", "Eden", "Autonomous Art"] },
    { name: "Generative Art", keywords: ["On-chain art", "Algorithmic creativity", "Live minting"] },
    { name: "Community Building", keywords: ["DAOs", "IRL events", "Cultural venues"] }
  ],

  references: [
    { name: "Fred Wilson", reference: "Partner at Union Square Ventures, co-founded Flatiron Partners" },
    { name: "Gene Kogan", reference: "Co-founder of Eden" }
  ],

  meta: {
    version: "1.0",
    lastUpdated: "2026-01-01",
    format: "JSON Resume (https://jsonresume.org)",
    source: "https://sethgoldstein.com/api/resume"
  }
};

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'json';

  if (format === 'text' || format === 'plain') {
    // Plain text version for simple consumption
    const text = `
SETH GOLDSTEIN
${RESUME.basics.label}
${RESUME.basics.url}

${RESUME.basics.summary}

EXPERIENCE
----------
${RESUME.work.map(job => `
${job.position} at ${job.company}
${job.startDate} - ${job.endDate || 'Present'}
${job.summary}
${job.highlights.map(h => `• ${h}`).join('\n')}
`).join('\n')}

EDUCATION
---------
${RESUME.education.map(edu => `${edu.studyType} in ${edu.area}, ${edu.institution} (${edu.endDate})`).join('\n')}

CONTACT
-------
Email: ${RESUME.basics.email}
Twitter: @seth
LinkedIn: linkedin.com/in/seth
`;
    return new Response(text.trim(), {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // Default: JSON format
  return new Response(JSON.stringify(RESUME, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
