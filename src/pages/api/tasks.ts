import type { APIRoute } from 'astro';

// Static snapshot updated manually or via deployment
// Source: /Users/seth/openai-chat-service/CONSOLIDATED_TASKS_JAN_2026.md
const TASKS_SNAPSHOT = {
  updated: "2026-01-03",
  sources: "3,099 conversations (ChatGPT, Granola, Limitless)",

  deadlines: [
    { date: "Jan 22, 2026", item: "NODE VIP Dinner (7-10pm)", daysAway: 19 },
    { date: "Jan 23, 2026", item: "NODE Donor Preview", daysAway: 20 },
    { date: "Jan 24, 2026", item: "NODE Public Opening (1000+ RSVPs)", daysAway: 21 },
    { date: "Jan 25, 2026", item: "NODE Talks + Late Night Party", daysAway: 22 },
    { date: "Jan 30, 2026", item: "Betaworks presentation", daysAway: 27 },
    { date: "Mar 2026", item: "Berlin move / Blue Card", daysAway: 60 },
    { date: "Apr 2026", item: "Art Dubai", daysAway: 90 }
  ],

  priorities: {
    p0: {
      label: "Immediate / Blocking",
      categories: ["IRS / Tax", "Legal / Murphy Lawsuit"],
      count: 10,
      sample: ["Call IRS collections", "Finalize affidavit with Daniel Gregory"]
    },
    p1: {
      label: "This Week",
      categories: ["Spirit Protocol", "Admin / Visa", "Solienne", "NODE Grand Opening"],
      count: 14,
      sample: ["Investor follow-ups from NYC trip", "Book Friday night restaurants", "Develop talk script"]
    },
    p2: {
      label: "This Month",
      categories: ["Eden / Spirit Engineering", "Solienne LiveAvatar", "NODE Foundation"],
      count: 17,
      sample: ["Spirit contracts", "Art Dubai storyboard", "VIP Dinner asks"]
    },
    p3: {
      label: "Backlog / Q1",
      categories: ["Spirit Post-Launch", "Infrastructure", "Art Dubai"],
      count: 8,
      sample: ["Cross-memory implementation", "Vibecodings sync", "Zaven Pare framework"]
    }
  },

  focus: {
    thisWeek: "NODE Grand Opening prep (20 days), Spirit investor follow-ups",
    blocking: "IRS payment plan, Murphy lawsuit affidavit",
    nextMilestone: "NODE VIP Dinner - Jan 22, 2026"
  },

  stats: {
    total: 49,
    completed: 7,
    pending: 42
  },

  forAgents: {
    description: "Seth's consolidated task list from ChatGPT, Granola, and Limitless",
    localPath: "/Users/seth/openai-chat-service/CONSOLIDATED_TASKS_JAN_2026.md",
    syncCommand: "cd /Users/seth/openai-chat-service && node bin/cli.js export-tasks",
    priorityScale: "P0 (blocking) → P1 (this week) → P2 (this month) → P3 (backlog)"
  }
};

export const GET: APIRoute = async ({ url }) => {
  const priority = url.searchParams.get('priority');
  const format = url.searchParams.get('format') || 'json';

  if (format === 'text') {
    const text = `
SETH'S TASKS (Updated: ${TASKS_SNAPSHOT.updated})

NEXT MILESTONE: ${TASKS_SNAPSHOT.focus.nextMilestone}

THIS WEEK: ${TASKS_SNAPSHOT.focus.thisWeek}
BLOCKING: ${TASKS_SNAPSHOT.focus.blocking}

DEADLINES:
${TASKS_SNAPSHOT.deadlines.map(d => `  ${d.date}: ${d.item}`).join('\n')}

STATS: ${TASKS_SNAPSHOT.stats.pending} pending / ${TASKS_SNAPSHOT.stats.total} total
    `.trim();

    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  if (priority && TASKS_SNAPSHOT.priorities[priority as keyof typeof TASKS_SNAPSHOT.priorities]) {
    const p = TASKS_SNAPSHOT.priorities[priority as keyof typeof TASKS_SNAPSHOT.priorities];
    return new Response(JSON.stringify({
      priority: priority.toUpperCase(),
      ...p
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify(TASKS_SNAPSHOT, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
