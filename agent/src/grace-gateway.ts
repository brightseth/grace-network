import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { ChatHandler } from "./chat-handler.js";
import { startInitiativeLoop } from "./initiative.js";
import { getDispatches, getDispatchBySlug } from "./tools/dispatches.js";
import { startTelegramPolling } from "./telegram.js";
import { scanResearchForGrace, refreshCurrentEventsLore } from "./knowledge.js";

const app = new Hono();
const chatHandler = new ChatHandler();

const PORT = parseInt(process.env.PORT || "4200", 10);
const API_KEY = process.env.GRACE_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Auth middleware — skip for health check and telegram webhook
app.use("*", async (c, next) => {
  if (c.req.path === "/health" && c.req.method === "GET") {
    return next();
  }
  if (c.req.path === "/telegram/webhook" && c.req.method === "POST") {
    return next();
  }

  if (API_KEY) {
    const provided = c.req.header("X-Api-Key");
    if (provided !== API_KEY) {
      return c.json({ error: "Unauthorized" }, 401);
    }
  }

  return next();
});

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    agent: "grace",
    mode: "autonomous",
    uptime: process.uptime(),
  });
});

// Dispatches API — public, read-only
app.get("/dispatches", async (c) => {
  const dispatches = await getDispatches(20);
  return c.json({ dispatches });
});

app.get("/dispatches/:slug", async (c) => {
  const slug = c.req.param("slug");
  const dispatch = await getDispatchBySlug(slug);
  if (!dispatch) return c.json({ error: "Not found" }, 404);
  return c.json(dispatch);
});

// Status endpoint — richer than health, for coordinator queries
app.get("/status", async (c) => {
  const channels = ["web"];
  if (TELEGRAM_BOT_TOKEN) channels.push("telegram");
  const knowledgeEntries = scanResearchForGrace();
  return c.json({
    agent: "grace",
    mode: "autonomous",
    uptime: process.uptime(),
    channels,
    capabilities: [
      "chat",
      "dispatches",
      "initiatives",
      "member-memory",
      "knowledge",
    ],
    knowledge: {
      entries: knowledgeEntries.length,
      categories: [...new Set(knowledgeEntries.map((e) => e.category))],
      lastRefresh: knowledgeEntries[0]?.created_at || null,
    },
    ready: true,
  });
});

// Knowledge endpoint — view GRACE's current intelligence
app.get("/knowledge", async (c) => {
  const entries = scanResearchForGrace();
  return c.json({
    count: entries.length,
    entries: entries.slice(0, 20).map((e) => ({
      topic: e.topic,
      category: e.category,
      relevance: e.relevance_score,
      summary: e.summary.slice(0, 300),
      sources: e.sources.slice(0, 3),
      date: e.created_at,
    })),
  });
});

// Knowledge refresh endpoint — trigger a manual refresh
app.post("/knowledge/refresh", async (c) => {
  const count = await refreshCurrentEventsLore();
  return c.json({ refreshed: true, entries: count });
});

// Chat endpoint
app.post("/chat", async (c) => {
  try {
    const body = await c.req.json<{
      message?: string;
      sessionId?: string;
      email?: string;
      channel?: string;
      sender?: string;
      isGroup?: boolean;
      groupName?: string;
    }>();

    if (!body.message || typeof body.message !== "string") {
      return c.json({ error: "message is required" }, 400);
    }

    const sessionId = body.sessionId || crypto.randomUUID();
    const email = typeof body.email === "string" ? body.email : undefined;
    const channelContext = body.channel ? {
      channel: body.channel as any,
      sender: body.sender,
      isGroup: body.isGroup,
      groupName: body.groupName,
    } : undefined;
    const result = await chatHandler.chat(sessionId, body.message, email, channelContext);

    return c.json({
      reply: result.reply,
      sessionId,
      suggestedActions: result.suggestedActions,
      ...(result.imageUrl ? { imageUrl: result.imageUrl } : {}),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[GRACE] Chat error:", message);
    return c.json({ error: message }, 500);
  }
});

// Telegram webhook endpoint (receives updates from Telegram Bot API)
app.post("/telegram/webhook", async (c) => {
  try {
    const update = await c.req.json();
    // Webhook handler is managed by telegram.ts — this is a fallback
    // In polling mode, this endpoint isn't used but exists for future webhook mode
    return c.json({ ok: true });
  } catch {
    return c.json({ ok: false }, 400);
  }
});

// Start server
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`GRACE agent listening on port ${PORT}`);
  console.log(`GRACE mode: autonomous leader`);

  // Start the initiative loop — GRACE acts, not just reacts
  startInitiativeLoop();

  // Start Telegram bot if token is configured
  if (TELEGRAM_BOT_TOKEN) {
    startTelegramPolling(TELEGRAM_BOT_TOKEN, chatHandler);
    console.log(`GRACE Telegram bot: active (polling mode)`);
  }
});
