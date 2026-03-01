import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { ChatHandler } from "./chat-handler.js";

const app = new Hono();
const chatHandler = new ChatHandler();

const PORT = parseInt(process.env.PORT || "4200", 10);
const API_KEY = process.env.GRACE_API_KEY;

// Auth middleware — skip for health check
app.use("*", async (c, next) => {
  if (c.req.path === "/health" && c.req.method === "GET") {
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
    uptime: process.uptime(),
  });
});

// Chat endpoint
app.post("/chat", async (c) => {
  try {
    const body = await c.req.json<{
      message?: string;
      sessionId?: string;
      email?: string;
    }>();

    if (!body.message || typeof body.message !== "string") {
      return c.json({ error: "message is required" }, 400);
    }

    const sessionId = body.sessionId || crypto.randomUUID();
    const email = typeof body.email === "string" ? body.email : undefined;
    const result = await chatHandler.chat(sessionId, body.message, email);

    return c.json({
      reply: result.reply,
      sessionId,
      suggestedActions: result.suggestedActions,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[GRACE] Chat error:", message);
    return c.json({ error: message }, 500);
  }
});

// Start server
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`GRACE agent listening on port ${PORT}`);
});
