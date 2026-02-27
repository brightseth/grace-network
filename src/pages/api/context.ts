import type { APIRoute } from 'astro';

// Powers of 10 bio content - machine-readable API for LLMs
const bioLevels: Record<number, { title: string; content: string; wordCount: number }> = {
  1: {
    title: "1 Word",
    content: "@seth",
    wordCount: 1
  },
  10: {
    title: "10 Words",
    content: "Pioneer connecting creativity and technology through meaningful human experiences.",
    wordCount: 10
  },
  100: {
    title: "100 Words",
    content: `Seth Goldstein is a visionary entrepreneur and digital art pioneer who has consistently bridged the worlds of technology and creativity throughout his career. From founding groundbreaking internet companies to launching innovative social platforms and championing the NFT art movement, his work focuses on building meaningful connections between people and technology. Through ventures like Bright Moments, he continues to push the boundaries of digital expression and community engagement. His ability to identify transformative technologies before mainstream adoption has established him as a forward-thinking leader in both the tech and art worlds.`,
    wordCount: 100
  },
  1000: {
    title: "1000 Words",
    content: `Seth Goldstein: Pioneer, Entrepreneur, Creator

Seth Goldstein has spent three decades identifying transformative technology platforms years before mainstream adoption, from early web advertising to blockchain and NFTs. His career represents a unique convergence of artistic sensibility, entrepreneurial drive, and technological vision.

Beginning in theater and performance art, Seth's formative experiences shaped his understanding of human connection and creative expression. As a teenager in the 1980s, he performed in avant-garde productions and was mentored by visionary theater director Robert Wilson. This early exposure to experimental art forms laid the foundation for his interdisciplinary approach to business and technology.

In the early 1990s, Seth pioneered the digital documentation of performing arts, creating interactive CD-ROM archives of Robert Wilson's theatrical work and William Forsythe's choreography. These projects represented early explorations of how technology could preserve and transform artistic experiences.

With the dawn of the commercial internet, Seth founded SiteSpecific in 1995, one of the first interactive advertising agencies. The company quickly grew from his apartment to a multimillion-dollar business creating innovative campaigns for major brands when web marketing was still being defined. After SiteSpecific's acquisition, Seth joined Flatiron Partners as their first Entrepreneur-in-Residence, developing investments in pervasive computing technologies.

In 2002, Seth co-founded Majestic Research, pioneering the use of alternative data for financial research—a concept that would become industry standard years later. This was followed by the creation of AttentionTrust.org in 2006, advocating for personal data rights well before privacy concerns entered mainstream consciousness.

Seth's innovation in social media came with Turntable.fm in 2011, a revolutionary platform that allowed users to DJ together in virtual rooms. The site exploded to 600,000 users in four months, creating a cultural phenomenon that combined music, gaming, and social networking in ways that anticipated future virtual social spaces.

In 2021, Seth returned to his artistic roots by founding Bright Moments, a crypto art gallery and DAO that has pioneered 'live minting' experiences for generative art. By creating immersive in-person events where artists and collectors witness the creation of algorithmic art together, Seth has helped bridge the physical and digital art worlds in unprecedented ways.

From his early theatrical work to his current focus on NFTs and generative art, Seth Goldstein's career demonstrates a consistent thread: using technology to enhance human creativity and connection. His ventures have repeatedly identified significant shifts in technology and culture years before they became mainstream, establishing him as both a visionary entrepreneur and a meaningful contributor to the evolution of digital expression.`,
    wordCount: 1000
  },
  10000: {
    title: "10000 Words",
    content: `Seth Goldstein: A Journey Through Technology, Art, and Entrepreneurship

In the evolving landscape where technology and creativity intersect, Seth Goldstein stands as a unique figure whose career spans over three decades of pioneering innovation. Not easily categorized as either purely a technologist or an artist, Seth has consistently occupied the fertile space between these domains, recognizing transformative platforms years before mainstream adoption and building ventures that enhance human connection and creative expression.

**Early Foundations: Theater and Technology (1980s)**

Seth's journey begins not with computers but on stage. As a child in Boston during the late 1970s and early 1980s, he was immersed in two seemingly disparate worlds that would later converge in his professional life: experimental theater and emerging computing technology.

"When I was a kid in the late 70's, my dad worked as a quality assurance consultant for computer companies up and down Boston's Route 128," Seth recalls. "He tested new machines and software packages, looking for bugs. One night he brought me to his office at Applicon, an early CAD pioneer, and showed me a digital image of a bear. It was the first computer graphic I had ever seen."

While this early exposure to digital imaging planted a seed, Seth's primary passion was theatrical performance. He began as a child actor in avant-garde productions at the American Repertory Theater in Cambridge, Massachusetts, receiving an education in experimental art that would profoundly influence his later work.

A pivotal moment came in 1984 when, at just 14 years old, Seth was cast by legendary theater director Robert Wilson for the restaging of the Cologne section of "Civil WarS." Wilson's visionary approach to integrating visual art, movement, and technology in theatrical production became a fundamental influence on Seth's developing aesthetic and conceptual framework.

Seth continued his artistic education at Interlochen Arts Academy in Michigan for his senior year of high school. There, surrounded by musicians, poets, dancers, and fellow actors, he further developed his understanding of creative collaboration and interdisciplinary approaches. He went on to study Dramatic Literature at Columbia University, where he continued theatrical pursuits while developing a deeper theoretical understanding of narrative and performance.

**Digital Documentation of Performance (1992-1995)**

After graduating from Columbia in 1992, Seth began working as an archivist at Robert Wilson's Byrd Hoffman Foundation. This position gave him intimate access to Wilson's groundbreaking body of work, from the 7-day play "KA Mountain" in Iran to the revolutionary opera "Einstein on the Beach" with Philip Glass.

It was in this context that Seth's technological vision began to emerge. Recognizing the limitations of traditional documentation methods for capturing the full dimensionality of Wilson's work, Seth conceived the Interactive Multimedia Archive Project (IMAP). This pioneering project represented one of the first attempts to use CD-ROM technology to create a comprehensive digital archive of a performing artist's work.

With a $50,000 grant, Seth created one of the first multimedia documentations of a performing artist's work, incorporating research photos, drawings, furniture design, rehearsal and performance video, and text for Wilson's "The Life and Times of Joseph Stalin." This project was revolutionary for its time, using interactive technology to present a non-linear exploration of artistic work.

In 1993, Seth brought his multimedia application to the Mediale Convention in Hamburg and the Frankfurt Book Fair, expanding his exploration of artistic technology to Europe. This exposure led to a collaboration with William Forsythe, director of the Frankfurt Ballet, who invited Seth to create a similar multimedia presentation for his choreographic work. The resulting project, "Improvisation Technologies," became a groundbreaking digital documentation of Forsythe's dance methodology, used by dance companies and educational institutions worldwide.

Simultaneously, Seth was invited by the Center for Art and Media Technology (ZKM) in Karlsruhe to become an Artist in Residence, helping develop their CD-ROM publishing lab.

**The Internet Pioneer (1995-2000)**

When the World Wide Web emerged as a commercial medium in the mid-1990s, Seth recognized its transformative potential and returned to New York to engage with this new technology.

In August 1995, at just 25 years old, Seth founded SiteSpecific, one of the first interactive marketing agencies. The company quickly evolved from Seth's apartment in New York City to a leading force in the nascent internet advertising industry. SiteSpecific created innovative campaigns for major brands like Duracell, Microsoft, and AT&T, pioneering many techniques that would become standard in digital marketing.

"It was really the glory years of the internet before it became overrun by MBAs and bankers and all sorts of mercenaries and opportunists," Seth recalls. "It was naïve and wonderful and it really felt like we were doing something original."

Within 18 months, SiteSpecific grew to over $3 million in annual revenue. The company became the subject of Harvard Business School's first case study on internet marketing, and Seth was recognized as one of Red Herring's Top 20 Entrepreneurs of the year. In 1997, SiteSpecific was acquired by CKS Group for approximately $12 million.

Following this success, Seth joined Flatiron Partners in 1999 as their first Entrepreneur-in-Residence and Investment Principal. Working alongside renowned VC Fred Wilson, Seth developed a $75 million portfolio focused on "pervasive computing"—technologies that would move the internet beyond desktop computers.

**Data and Research Innovation (2002-2010)**

In 2002, Seth co-founded Majestic Research, a groundbreaking financial research firm that harnessed internet data to provide market insights. Years before "alternative data" became a Wall Street buzzword, Majestic Research analyzed web traffic and commerce data to provide hedge funds with proprietary guidance.

"In 2009-2010 we were selling $200,000 worth of research to over 200 different hedge funds," Seth notes.

The company was acquired by Investment Technology Group (ITG) in 2010 for approximately $75 million, validating Seth's vision of data-driven financial services.

During this period, Seth established AttentionTrust.org in 2006, advocating for personal information rights and distributing a free browser plugin that gave users more control over their data—a prescient concern that would become mainstream years later.

**Social Media and Music Innovation (2010-2016)**

In 2011, Seth co-founded Turntable.fm, a revolutionary social music platform that allowed users to DJ and listen to music together in virtual rooms. The site exploded to 600,000 users within four months.

"Within like two or three months, Billy and another engineer finished the prototype. We then plugged in an integration with MediaNet so people could choose music from that library. It was clear early on there was something compelling about this way of listening to music."

Turntable.fm secured $7 million in venture funding at a $37 million valuation, with Seth serving as Chairman. The platform became a cultural phenomenon, combining music, gaming, and social networking in a way that predated many later developments in virtual social spaces.

**Web3 and Crypto Art Revolution (2020-Present)**

In 2021, Seth founded Bright Moments, a crypto art gallery organized as a Decentralized Autonomous Organization (DAO). Beginning with a small gallery space beneath the Venice sign, Bright Moments pioneered the concept of "live minting"—creating immersive in-person experiences where artists and collectors could witness the generation of algorithmic art together in real time.

"I woke up the next morning and realized that my NFT had been sold while I was asleep, and that there was ETH in my wallet. This was a breakthrough moment for me, as it dawned on me how significant this file format could be as a creative unlock. This moment reminded me of what I felt with the dawn of the Web in the summer of 1995."

Bright Moments quickly evolved from a local gallery to a global art movement, expanding to include unique collections for New York, Berlin, London, Mexico City, Tokyo, Buenos Aires, Paris, and Venice, Italy.

The Bright Moments journey concluded in April 2024 with "The Finale" at the Scuola Grande San Giovanni in Venice, Italy—bringing together almost every artist who participated in the DAO's previous projects.

**Current Focus (2025)**

Now Seth continues to innovate at the intersection of technology, art, and community as CEO of Eden, building autonomous AI creative agents. His current projects include:

- **Eden**: Autonomous AI creative platform enabling artists to create AI agents
- **Abraham**: 13-year autonomous artist covenant
- **SOLIENNE**: Daily AI art practice with Spring 2026 exhibitions
- **NODE**: Cultural venue opening January 2026 in Denver
- **Spirit Protocol**: Token economics for autonomous AI agents
- **vibecodings**: 190+ consecutive days building with Claude Code

**Legacy and Impact**

Throughout his journey, Seth has mentored countless entrepreneurs and creators. His support for artists transitioning into new technological frontiers has been particularly significant, helping traditional creators navigate the complexities of blockchain, NFTs, and generative systems.

"We built a diverse team of people from Venice Beach to New York to Tokyo to Buenos Aires. To see folks in their twenties who came of age at a very difficult time during Covid develop valuable skills in smart contracts, web3 marketing, live event production, generative AI—that's really special. That's our real legacy."

Seth Goldstein's career defies simple categorization—he is simultaneously entrepreneur, artist, investor, community builder, and futurist. What remains consistent is his ability to see emerging possibilities before others and his commitment to using technology to enhance human creativity and connection.

"I doubt that I will ever give up trying to create new things."`,
    wordCount: 10000
  }
};

// Current projects and facts for structured responses
const currentFocus = {
  role: "CEO of Eden",
  description: "Autonomous AI creative platform",
  projects: [
    { name: "Abraham", description: "13-year autonomous artist covenant" },
    { name: "SOLIENNE", description: "Daily AI art practice, exhibitions 2026" },
    { name: "NODE", description: "Cultural venue opening Jan 2026, Denver" },
    { name: "Spirit Protocol", description: "Token economics for AI agents" },
    { name: "vibecodings", description: "190+ days building with Claude Code" }
  ],
  handles: { twitter: "@seth", email: "sethgoldstein@gmail.com" }
};

export const GET: APIRoute = async ({ url }) => {
  const depth = url.searchParams.get('depth');
  const format = url.searchParams.get('format') || 'json';

  // If no depth specified, return metadata about available depths
  if (!depth) {
    return new Response(JSON.stringify({
      service: "Seth Goldstein Context API",
      description: "Get bio information at different depth levels (Powers of 10)",
      usage: "GET /api/context?depth=1|10|100|1000|10000",
      availableDepths: Object.keys(bioLevels).map(d => ({
        depth: parseInt(d),
        title: bioLevels[parseInt(d)].title,
        wordCount: bioLevels[parseInt(d)].wordCount
      })),
      additionalParams: {
        format: "json (default) | text | markdown",
        include: "all | bio | projects | facts"
      },
      links: {
        fullProfile: "https://sethgoldstein.com/seth.json",
        llmsGuide: "https://sethgoldstein.com/llms.txt",
        chat: "https://sethgoldstein.com/api/seth-brain"
      }
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const depthNum = parseInt(depth);
  const validDepths = [1, 10, 100, 1000, 10000];

  // Find closest valid depth
  const closestDepth = validDepths.reduce((prev, curr) =>
    Math.abs(curr - depthNum) < Math.abs(prev - depthNum) ? curr : prev
  );

  const bio = bioLevels[closestDepth];

  // Handle text format
  if (format === 'text') {
    return new Response(bio.content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Handle markdown format
  if (format === 'markdown') {
    const markdown = `# Seth Goldstein (${bio.title})\n\n${bio.content}`;
    return new Response(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Default JSON response
  const response = {
    name: "Seth Goldstein",
    handle: "@seth",
    depth: closestDepth,
    depthTitle: bio.title,
    wordCount: bio.wordCount,
    bio: bio.content,
    currentFocus,
    meta: {
      requestedDepth: depthNum,
      servedDepth: closestDepth,
      availableDepths: validDepths,
      timestamp: new Date().toISOString(),
      links: {
        fullProfile: "https://sethgoldstein.com/seth.json",
        deeperContext: closestDepth < 10000
          ? `https://sethgoldstein.com/api/context?depth=${validDepths[validDepths.indexOf(closestDepth) + 1]}`
          : null,
        chat: "https://sethgoldstein.com/api/seth-brain"
      }
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
