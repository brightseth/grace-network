#!/usr/bin/env npx tsx
/**
 * GRACE Research Queue Seeder
 *
 * Seeds LEVI's overnight research queue with GRACE-relevant policy topics.
 * Run daily (e.g., via cron or @seth pipeline) to keep GRACE's intelligence current.
 *
 * Usage:
 *   npx tsx scripts/seed-research-queue.ts
 *   npx tsx scripts/seed-research-queue.ts --dry-run
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const HOME = process.env.HOME || "/Users/sethstudio1";
const QUEUE_PATH = path.join(HOME, ".seth/research-queue.json");
const DRY_RUN = process.argv.includes("--dry-run");

// Import GRACE's policy watchlist
import { POLICY_WATCHLIST } from "../src/knowledge.js";

// ─── Research Queue Types (mirrored from @seth research-queue.ts) ────

interface ResearchTopic {
  id: string;
  query: string;
  context: string;
  source: "state-md" | "agent-request" | "manual" | "follow-up";
  sourceAgent?: string;
  parentTopicId: string | null;
  depth: number;
  maxDepth: number;
  priority: number;
  status: "pending" | "in-progress" | "completed" | "discarded";
  createdAt: string;
  qualityScore?: number;
  resultPath?: string;
}

interface ResearchQueue {
  topics: ResearchTopic[];
  nightBudget: {
    maxTopics: number;
    maxApiCalls: number;
    maxCostCents: number;
  };
  stats: {
    totalCompleted: number;
    totalDiscarded: number;
    avgQualityScore: number;
  };
}

function loadQueue(): ResearchQueue {
  try {
    return JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8"));
  } catch {
    return {
      topics: [],
      nightBudget: { maxTopics: 15, maxApiCalls: 100, maxCostCents: 200 },
      stats: { totalCompleted: 0, totalDiscarded: 0, avgQualityScore: 0 },
    };
  }
}

function saveQueue(queue: ResearchQueue): void {
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
}

/**
 * Check if a query is too similar to existing pending topics.
 */
function isDuplicate(query: string, queue: ResearchQueue): boolean {
  const queryWords = new Set(query.toLowerCase().split(/\s+/));
  for (const topic of queue.topics) {
    if (topic.status !== "pending") continue;
    const topicWords = new Set(topic.query.toLowerCase().split(/\s+/));
    const overlap = [...queryWords].filter((w) => topicWords.has(w)).length;
    const similarity = overlap / Math.max(queryWords.size, topicWords.size);
    if (similarity > 0.6) return true;
  }
  return false;
}

// ─── Main ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("[grace-seeder] Seeding LEVI research queue with GRACE policy topics...");

  const queue = loadQueue();
  const pendingCount = queue.topics.filter((t) => t.status === "pending").length;

  // Don't flood the queue
  const maxToAdd = Math.max(0, 15 - pendingCount);
  if (maxToAdd === 0) {
    console.log("[grace-seeder] Queue already has 15+ pending topics — skipping");
    return;
  }

  // Select topics: 1 random topic per category, up to maxToAdd
  let added = 0;
  const shuffledCategories = POLICY_WATCHLIST.sort(() => Math.random() - 0.5);

  for (const category of shuffledCategories) {
    if (added >= maxToAdd) break;

    // Pick a random topic from this category
    const topic = category.topics[Math.floor(Math.random() * category.topics.length)];

    if (isDuplicate(topic, queue)) {
      console.log(`  [skip] Duplicate: "${topic}"`);
      continue;
    }

    const newTopic: ResearchTopic = {
      id: `rt_${crypto.randomBytes(6).toString("hex")}`,
      query: topic,
      context: `GRACE Network policy intelligence — ${category.category}. Research for The Grace Network political movement.`,
      source: "agent-request",
      sourceAgent: "grace",
      parentTopicId: null,
      depth: 0,
      maxDepth: 2,
      priority: 3, // medium priority — doesn't override manual/urgent research
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    if (DRY_RUN) {
      console.log(`  [dry-run] Would add: "${topic}" (${category.category})`);
    } else {
      queue.topics.push(newTopic);
      console.log(`  [added] "${topic}" (${category.category})`);
    }
    added++;
  }

  if (!DRY_RUN && added > 0) {
    saveQueue(queue);
  }

  console.log(
    `[grace-seeder] ${DRY_RUN ? "Would add" : "Added"} ${added} topics. Queue now has ${queue.topics.filter((t) => t.status === "pending").length} pending.`,
  );
}

main().catch((err) => {
  console.error("[grace-seeder] Error:", err.message);
  process.exit(1);
});
