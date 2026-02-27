import type { APIRoute } from 'astro';

/**
 * Easter Egg - Time portal to 1995
 * You found the year that started it all
 */

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    year: 1995,
    title: "Welcome to the World Wide Web",
    scene: {
      location: "Seth's apartment, New York City",
      month: "August",
      age: 25,
      soundtrack: "Radiohead - The Bends",
      onTheDesk: ["Macintosh Quadra", "Netscape Navigator", "too many coffee cups"],
      mood: "electric"
    },
    whatJustHappened: [
      "Just quit my job to start SiteSpecific",
      "Working from my apartment - no office, no employees, just an idea",
      "The Web is 2 years old and everything is being invented",
      "Brands are just starting to ask 'should we have a website?'"
    ],
    theInternet: {
      users: "~16 million worldwide",
      speed: "28.8 kbps modem if you're lucky",
      browser: "Netscape Navigator 1.1",
      coolestSite: "Yahoo! (it's a directory, not a search engine)",
      noYet: ["Google", "Facebook", "iPhone", "WiFi", "Blogs"]
    },
    sethThinks: {
      bigIdea: "Interactive advertising is going to change everything",
      fear: "What if I'm wrong about the internet?",
      excitement: "What if I'm right?",
      strategy: "Call every brand I can find and offer to build their website"
    },
    futureFlash: {
      warning: "SPOILER ALERT",
      twoYearsLater: "Company sells for $12 million",
      decadesLater: "Still building, still believing, still early"
    },
    message: "This is where it started. A bet on the future, made from a small apartment, with nothing but conviction and a dial-up modem.",
    hint: "Try /api/timemachine to talk to 1995 Seth directly"
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
