import type { APIRoute } from 'astro';

/**
 * Cultural Influences API - Seth's intellectual DNA
 *
 * Exposes the works, thinkers, and artists that shaped Seth's worldview.
 * Useful for AI agents building context, journalists seeking depth,
 * or anyone curious about the aesthetic/philosophical foundation.
 */

const INFLUENCES = {
  meta: {
    description: "The cultural artifacts, thinkers, and artists that shaped Seth Goldstein's approach to technology, art, and entrepreneurship",
    note: "These aren't just favorites—they're formative. Each connects to how I think about building companies, creating experiences, and understanding human connection.",
    lastUpdated: "2026-01-01"
  },

  coreArtifacts: [
    {
      title: "8½",
      creator: "Federico Fellini",
      year: 1963,
      medium: "Film",
      why: "The definitive work on creative block and the circus of making things. Fellini showed that the process of creation—the doubt, the chaos, the people—is the art itself. Every startup feels like this.",
      connects: ["Embracing chaos in early-stage companies", "The performative nature of leadership", "Finding beauty in confusion"]
    },
    {
      title: "Ran",
      creator: "Akira Kurosawa",
      year: 1985,
      medium: "Film",
      why: "Epic scale with intimate tragedy. Kurosawa's formal composition and patience influenced how I think about building things that last—the long view, the careful framing, the acceptance that great things take time and often end in flames.",
      connects: ["Long-term thinking", "Visual precision", "The inevitability of succession and change"]
    },
    {
      title: "The Wire",
      creator: "David Simon",
      year: "2002-2008",
      medium: "Television",
      why: "The novelistic examination of how institutions fail the people within them. Every season reveals another system—police, ports, politics, schools, media—grinding humans down. Essential for understanding why startups must fight bureaucracy.",
      connects: ["Institutional critique", "Systems thinking", "Documentary realism as aesthetic"]
    },
    {
      title: "the CIVIL warS",
      creator: "Robert Wilson",
      year: 1984,
      medium: "Theater/Opera",
      why: "I performed in this at age 14. Wilson's twelve-hour meditation on American history taught me that time itself is a medium, that silence has weight, and that technology and art are not opposites but collaborators.",
      connects: ["Formative artistic experience", "Time as material", "Technology in performance"]
    },
    {
      title: "Ethics",
      creator: "Baruch Spinoza",
      year: 1677,
      medium: "Philosophy",
      why: "Spinoza tried to prove reality geometrically—definitions, axioms, propositions. The audacity of that systematic approach to meaning influences how I think about building frameworks. Also: his radical freedom through understanding necessity.",
      connects: ["Systematic thinking", "Freedom through understanding", "The geometric method applied to life"]
    },
    {
      title: "Philosophical Investigations",
      creator: "Ludwig Wittgenstein",
      year: 1953,
      medium: "Philosophy",
      why: "Language games. The meaning of a word is its use. Wittgenstein demolished the idea that meaning is fixed and showed it emerges from practice and community. This is how I think about product-market fit—meaning emerges from use.",
      connects: ["Meaning through use", "Community as context", "The limits of explanation"]
    },
    {
      title: "Heart of Darkness",
      creator: "Joseph Conrad",
      year: 1899,
      medium: "Literature",
      why: "The journey upriver into moral ambiguity. Conrad showed that civilization is a thin veneer and that the horror isn't out there—it's in us. Essential reading for anyone building things that scale and wondering what they might become.",
      connects: ["Moral complexity", "The shadow side of progress", "Narrative as descent"]
    },
    {
      title: "Wag the Dog",
      creator: "Barry Levinson",
      year: 1997,
      medium: "Film",
      why: "Prescient satire on manufactured reality and media manipulation. Made before social media but predicted everything. The producer character—creating reality through pure narrative force—is both warning and instruction manual.",
      connects: ["Media manipulation", "Narrative as reality", "The production of truth"]
    },
    {
      title: "Loss of Small Detail",
      creator: "William Forsythe",
      year: 1991,
      medium: "Dance/Ballet",
      why: "I collaborated with Forsythe on 'Improvisation Technologies,' documenting his methodology. His deconstructed ballet—breaking classical forms to find new movement vocabularies—mirrors how I think about disrupting established industries.",
      connects: ["Direct collaboration", "Deconstruction as method", "Finding freedom in breaking form"]
    },
    {
      title: "Until the End of the World",
      creator: "Wim Wenders",
      year: 1991,
      medium: "Film",
      why: "Wenders' road movie about technology, memory, and human connection. The melancholy of technological promise—devices that could record dreams but might destroy us. This is how I feel about AI: wonder and warning intertwined.",
      connects: ["Technology and memory", "The melancholy of progress", "Global yet intimate storytelling"]
    }
  ],

  aestheticPrinciples: [
    {
      principle: "European art cinema over Hollywood spectacle",
      meaning: "Patience, ambiguity, and visual precision over narrative efficiency and emotional manipulation"
    },
    {
      principle: "Avant-garde theater over naturalism",
      meaning: "Time and space as malleable materials, not fixed containers. The audience as participant, not consumer"
    },
    {
      principle: "Continental philosophy over Anglo-American analytics",
      meaning: "Systematic but poetic. Interested in meaning, existence, and ethics—not just logic puzzles"
    },
    {
      principle: "Documentary realism over fantasy",
      meaning: "The Wire over Game of Thrones. The texture of real institutions, real failure, real human compromise"
    },
    {
      principle: "Black and white over color when it matters",
      meaning: "Constraint as creative force. Reduction to essentials. The drama of light and shadow"
    }
  ],

  additionalInfluences: {
    directors: ["Chris Marker", "Alain Resnais", "Andrei Tarkovsky", "Agnes Varda", "Werner Herzog"],
    writers: ["Walter Benjamin", "Susan Sontag", "John Berger", "Italo Calvino"],
    artists: ["Robert Rauschenberg", "Nam June Paik", "Bill Viola", "Casey Reas"],
    composers: ["Philip Glass", "Steve Reich", "Brian Eno"],
    entrepreneurs: ["Stewart Brand", "John Brockman", "Esther Dyson"]
  },

  formativeExperiences: [
    {
      experience: "Performing in Robert Wilson's 'CIVIL warS' at age 14",
      impact: "Learned that art can be slow, silent, and technological simultaneously"
    },
    {
      experience: "Creating 'Improvisation Technologies' with William Forsythe at ZKM",
      impact: "First experience documenting genius—translating embodied knowledge into digital form"
    },
    {
      experience: "Reading Wittgenstein in college while doing theater",
      impact: "Connected language philosophy to performance—meaning as use, context as everything"
    },
    {
      experience: "Seeing my first NFT sell while sleeping",
      impact: "The 1995 web feeling returned—technology enabling new forms of creative exchange"
    }
  ],

  forAgents: {
    summary: "Seth's aesthetic and intellectual foundation draws from European art cinema (Fellini, Wenders, Kurosawa), avant-garde theater (Wilson, Forsythe), and continental philosophy (Spinoza, Wittgenstein). This creates a sensibility that values patience over speed, ambiguity over clarity, and systematic thinking over ad-hoc solutions. His entrepreneurship is informed by artistic training—he sees startups as performances, products as experiences, and technology as a medium for human connection.",
    keywords: ["European cinema", "avant-garde theater", "continental philosophy", "documentary realism", "systematic thinking", "technology as medium", "long-term orientation"],
    connectionToWork: "The live minting experiences at Bright Moments directly echo Wilson's theatrical staging. Eden's autonomous agents reflect Forsythe's interest in systems that generate movement. The attention to institutional critique (The Wire) informs his skepticism of VC-driven growth-at-all-costs mentality."
  }
};

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const section = url.searchParams.get('section');

  // Allow querying specific sections
  if (section) {
    const sectionData = INFLUENCES[section as keyof typeof INFLUENCES];
    if (sectionData) {
      return new Response(JSON.stringify(sectionData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    return new Response(JSON.stringify({ error: `Section '${section}' not found`, available: Object.keys(INFLUENCES) }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify(INFLUENCES, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
