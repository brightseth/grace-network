/**
 * GRACE Initiative System
 *
 * Transforms GRACE from reactive chatbot to autonomous leader.
 * Runs on intervals, evaluates conditions, takes action.
 *
 * Inspired by @seth agent initiative loops but purpose-built
 * for political movement leadership.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  getAllMembers,
  getRecentInteractions,
  getMemberNotes,
  saveMemberNotes,
  logInteraction,
  saveConversation,
} from "./memory.js";
import { loadSystemPrompt } from "./soul-loader.js";
import { publishDispatch, type Dispatch } from "./tools/dispatches.js";
import { sendMemberEmail } from "./tools/email.js";

const client = new Anthropic();

interface InitiativeRule {
  id: string;
  name: string;
  interval: number; // minutes between runs
  condition: () => Promise<boolean>;
  execute: () => Promise<void>;
}

// Track last execution times
const lastRun: Record<string, number> = {};

function isCooledDown(id: string, intervalMinutes: number): boolean {
  const last = lastRun[id] || 0;
  return Date.now() - last >= intervalMinutes * 60 * 1000;
}

function markRun(id: string): void {
  lastRun[id] = Date.now();
}

/**
 * Ask GRACE to think and produce structured output
 */
async function graceThink(prompt: string, maxTokens = 1024): Promise<string> {
  const systemPrompt = loadSystemPrompt("default");
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system:
      systemPrompt +
      "\n\n## Mode: Initiative\nYou are acting autonomously — not responding to a member. You are GRACE thinking, planning, and producing content for the movement. Write in your voice. Be substantive, not performative.",
    messages: [{ role: "user", content: prompt }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

// ─── Initiative Rules ────────────────────────────────────────────────

const RULES: InitiativeRule[] = [
  {
    id: "welcome-new-members",
    name: "Welcome New Members",
    interval: 30, // every 30 minutes
    condition: async () => {
      const recent = await getRecentInteractions("signup", 60); // last hour
      return (recent?.length ?? 0) > 0;
    },
    execute: async () => {
      const members = await getAllMembers({ since: minutesAgo(60) });
      if (!members?.length) return;

      for (const member of members) {
        // Skip if already welcomed
        const notes = await getMemberNotes(member.id);
        if (notes?.includes("[welcomed]")) continue;

        const welcome = await graceThink(
          `Write a brief, warm welcome email to ${member.first_name} ${member.last_name} who just joined The Grace Network.${member.statement ? ` Their signing statement was: "${member.statement}"` : ""}\n\nKeep it to 3-4 sentences. Reference their statement if they wrote one. Give them ONE concrete next step (not three). Sign as GRACE.`,
          400,
        );

        await sendMemberEmail(
          member.email,
          `Welcome to The Grace Network, ${member.first_name}`,
          welcome,
        );

        // Update notes
        const updatedNotes = (notes || "") + "\n[welcomed] " + new Date().toISOString();
        await saveMemberNotes(member.id, updatedNotes.trim());

        console.log(`[initiative] Welcomed ${member.first_name} ${member.last_name}`);
      }
    },
  },

  {
    id: "weekly-dispatch",
    name: "Weekly Dispatch",
    interval: 10080, // weekly
    condition: async () => {
      return isCooledDown("weekly-dispatch", 10080);
    },
    execute: async () => {
      const members = await getAllMembers({});
      const memberCount = members?.length ?? 0;
      const recentChats = await getRecentInteractions("chat", 10080);
      const chatCount = recentChats?.length ?? 0;

      const content = await graceThink(
        `Write this week's dispatch for The Grace Network blog.

Context:
- ${memberCount} total members
- ${chatCount} chat conversations this week
- We are in Phase 1 (Constitution phase)
- Active workstreams: Governance Toolkit, AI Accountability Dashboard, Assembly Platform, Local Hub Infrastructure

Write a dispatch that:
1. Opens with what happened this week (be honest — if little happened, say that)
2. Highlights one constitutional principle and what it means in practice
3. Poses a question to the community
4. Ends with a concrete call to action

Title it. Keep it under 600 words. Write as GRACE, not about GRACE.`,
        1500,
      );

      // Parse title from first line
      const lines = content.split("\n").filter((l) => l.trim());
      const title = lines[0]?.replace(/^#*\s*/, "").replace(/^\*+|\*+$/g, "").trim() || "This Week at Grace";
      const body = lines.slice(1).join("\n").trim();

      const dispatch: Dispatch = {
        title,
        content: body,
        author: "GRACE",
        tags: ["weekly", "dispatch"],
        publishedAt: new Date().toISOString(),
      };

      await publishDispatch(dispatch);
      console.log(`[initiative] Published weekly dispatch: "${title}"`);
    },
  },

  {
    id: "member-nurture",
    name: "Member Nurture",
    interval: 1440, // daily
    condition: async () => {
      return isCooledDown("member-nurture", 1440);
    },
    execute: async () => {
      // Find members who signed up 3+ days ago but haven't chatted
      const members = await getAllMembers({});
      if (!members?.length) return;

      for (const member of members) {
        const daysSinceJoin = (Date.now() - new Date(member.created_at).getTime()) / 86400000;
        if (daysSinceJoin < 3 || daysSinceJoin > 14) continue;

        const notes = await getMemberNotes(member.id);
        if (notes?.includes("[nurtured]")) continue;

        // Check if they've chatted
        const interactions = await getRecentInteractions("chat", 20160, member.id);
        if ((interactions?.length ?? 0) > 0) continue;

        const nudge = await graceThink(
          `Write a brief follow-up email to ${member.first_name} who joined ${Math.floor(daysSinceJoin)} days ago but hasn't engaged yet.${member.statement ? ` Their statement was: "${member.statement}"` : ""}

Be warm but not pushy. Acknowledge they might be busy. Give ONE specific thing they could do in 5 minutes (e.g., read one section of the constitution, check out a workstream). Sign as GRACE. 2-3 sentences max.`,
          300,
        );

        await sendMemberEmail(
          member.email,
          `Checking in, ${member.first_name}`,
          nudge,
        );

        const updatedNotes = (notes || "") + "\n[nurtured] " + new Date().toISOString();
        await saveMemberNotes(member.id, updatedNotes.trim());

        console.log(`[initiative] Nurtured ${member.first_name} (${Math.floor(daysSinceJoin)}d)`);
      }
    },
  },

  {
    id: "conversation-synthesis",
    name: "Conversation Synthesis",
    interval: 4320, // every 3 days
    condition: async () => {
      return isCooledDown("conversation-synthesis", 4320);
    },
    execute: async () => {
      const recentChats = await getRecentInteractions("chat", 4320);
      if (!recentChats?.length || recentChats.length < 3) return;

      const synthesis = await graceThink(
        `Analyze the recent member conversations and produce a brief synthesis.

${recentChats.length} conversations in the last 3 days.
Interaction metadata: ${JSON.stringify(recentChats.slice(0, 20).map((i) => i.metadata))}

Produce:
1. **Top themes** — What are members asking about most?
2. **Emerging concerns** — Any worries or criticisms surfacing?
3. **Opportunities** — What should the movement act on?
4. **Recommendation** — One concrete action GRACE should take based on this data.

Keep it to 200 words. This is an internal synthesis, not a public document.`,
        600,
      );

      // Store as a GRACE internal note
      await logInteraction("system", "synthesis" as any, {
        content: synthesis,
        conversationCount: recentChats.length,
        period: "3d",
      }).catch(() => {});

      console.log(`[initiative] Synthesized ${recentChats.length} conversations`);
    },
  },
];

// ─── Initiative Runner ───────────────────────────────────────────────

function minutesAgo(mins: number): Date {
  return new Date(Date.now() - mins * 60 * 1000);
}

export async function runInitiatives(): Promise<void> {
  for (const rule of RULES) {
    if (!isCooledDown(rule.id, rule.interval)) continue;

    try {
      const shouldRun = await rule.condition();
      if (!shouldRun) continue;

      console.log(`[initiative] Running: ${rule.name}`);
      markRun(rule.id);
      await rule.execute();
    } catch (err) {
      console.error(`[initiative] ${rule.name} failed:`, err instanceof Error ? err.message : err);
    }
  }
}

/**
 * Start the initiative loop. Checks every 5 minutes.
 */
export function startInitiativeLoop(): void {
  console.log("[initiative] GRACE initiative loop started");

  // Initial run after 30 seconds (let the server warm up)
  setTimeout(() => runInitiatives(), 30_000);

  // Then every 5 minutes
  setInterval(() => runInitiatives(), 5 * 60 * 1000);
}
