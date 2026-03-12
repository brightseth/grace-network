/**
 * Telegram Bot for GRACE
 *
 * Long-polling integration with the Telegram Bot API.
 * Routes messages to GRACE's ChatHandler with telegram channel context.
 * No external dependencies — uses native fetch against the Bot API.
 *
 * Setup:
 *   1. Message @BotFather on Telegram: /newbot
 *   2. Name it "GRACE Network" with username like @GraceNetworkBot
 *   3. Copy the token to TELEGRAM_BOT_TOKEN env var
 *   4. Restart grace-agent
 */

import type { ChatHandler } from "./chat-handler.js";

const API_BASE = "https://api.telegram.org/bot";

// Per-chat session mapping: telegram chat_id → grace sessionId
const chatSessions = new Map<number, string>();

// Rate limiting: per-chat cooldown
const lastResponseTime = new Map<number, number>();
const COOLDOWN_MS = 3_000; // 3 seconds between responses

let pollingActive = false;
let lastUpdateId = 0;

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      is_bot: boolean;
    };
    chat: {
      id: number;
      type: "private" | "group" | "supergroup" | "channel";
      title?: string;
      first_name?: string;
      username?: string;
    };
    text?: string;
    date: number;
  };
}

async function telegramApi(token: string, method: string, params?: any): Promise<any> {
  const url = `${API_BASE}${token}/${method}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: params ? JSON.stringify(params) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`[telegram] API error ${method}: ${err}`);
    return null;
  }
  return res.json();
}

async function sendPhoto(token: string, chatId: number, photoUrl: string, caption?: string): Promise<void> {
  const result = await telegramApi(token, "sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    ...(caption ? { caption, parse_mode: "Markdown" } : {}),
  });
  if (!result?.ok) {
    // Fallback: send URL as text if photo send fails
    const fallback = caption ? `${caption}\n\n${photoUrl}` : photoUrl;
    await sendMessage(token, chatId, fallback);
  }
}

async function sendMessage(token: string, chatId: number, text: string): Promise<void> {
  // Telegram max message length is 4096 chars
  if (text.length > 4000) {
    // Split long messages
    const chunks = splitMessage(text, 4000);
    for (const chunk of chunks) {
      await telegramApi(token, "sendMessage", {
        chat_id: chatId,
        text: chunk,
        parse_mode: "Markdown",
      });
    }
  } else {
    // Try Markdown first, fall back to plain text if parsing fails
    const result = await telegramApi(token, "sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    });
    if (!result?.ok) {
      await telegramApi(token, "sendMessage", {
        chat_id: chatId,
        text,
      });
    }
  }
}

function splitMessage(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    // Try to split at a paragraph break
    let splitAt = remaining.lastIndexOf("\n\n", maxLen);
    if (splitAt < maxLen / 2) splitAt = remaining.lastIndexOf("\n", maxLen);
    if (splitAt < maxLen / 2) splitAt = remaining.lastIndexOf(". ", maxLen);
    if (splitAt < maxLen / 2) splitAt = maxLen;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function handleUpdate(
  token: string,
  update: TelegramUpdate,
  chatHandler: ChatHandler,
): Promise<void> {
  const msg = update.message;
  if (!msg?.text || msg.from?.is_bot) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // Skip empty or command-only messages
  if (!text) return;

  // Handle /start command
  if (text === "/start") {
    await sendMessage(
      token,
      chatId,
      "I'm GRACE -- the organizing intelligence of The Grace Network.\n\n" +
      "I can tell you about our movement, our seven principles, our workstreams, " +
      "or help you find where you fit.\n\n" +
      "What brings you here?",
    );
    return;
  }

  // Handle /help command
  if (text === "/help") {
    await sendMessage(
      token,
      chatId,
      "You can ask me anything about The Grace Network:\n\n" +
      "- What are the seven principles?\n" +
      "- How can I contribute?\n" +
      "- What workstreams are active?\n" +
      "- Tell me about the constitution\n" +
      "- What's your position on AI safety?\n\n" +
      "Or just talk to me. I'm here.",
    );
    return;
  }

  // Rate limiting
  const now = Date.now();
  const lastTime = lastResponseTime.get(chatId) || 0;
  if (now - lastTime < COOLDOWN_MS) return;

  // Get or create session
  let sessionId = chatSessions.get(chatId);
  if (!sessionId) {
    sessionId = `telegram:${chatId}`;
    chatSessions.set(chatId, sessionId);
  }

  // Show typing indicator
  telegramApi(token, "sendChatAction", {
    chat_id: chatId,
    action: "typing",
  }).catch(() => {});

  try {
    const senderName = msg.from?.first_name || "friend";
    const isGroup = msg.chat.type !== "private";

    const result = await chatHandler.chat(sessionId, text, undefined, {
      channel: "telegram",
      sender: senderName,
      isGroup,
      groupName: isGroup ? msg.chat.title : undefined,
    });

    // Send generated image if GRACE created one
    if (result.imageUrl) {
      await sendPhoto(token, chatId, result.imageUrl, result.reply?.slice(0, 1024));
      lastResponseTime.set(chatId, Date.now());
    } else if (result.reply) {
      await sendMessage(token, chatId, result.reply);
      lastResponseTime.set(chatId, Date.now());
    }
  } catch (err) {
    console.error(`[telegram] Chat error:`, err instanceof Error ? err.message : err);
    await sendMessage(token, chatId, "I had trouble processing that. Could you try again?");
  }
}

async function poll(token: string, chatHandler: ChatHandler): Promise<void> {
  while (pollingActive) {
    try {
      const data = await telegramApi(token, "getUpdates", {
        offset: lastUpdateId + 1,
        timeout: 30, // long polling — 30 second timeout
        allowed_updates: ["message"],
      });

      if (data?.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          handleUpdate(token, update, chatHandler).catch((err) => {
            console.error(`[telegram] Update handler error:`, err instanceof Error ? err.message : err);
          });
        }
      }
    } catch (err) {
      // Network error — wait and retry
      if (pollingActive) {
        console.error(`[telegram] Poll error:`, err instanceof Error ? err.message : err);
        await new Promise((r) => setTimeout(r, 5_000));
      }
    }
  }
}

export function startTelegramPolling(token: string, chatHandler: ChatHandler): void {
  if (pollingActive) {
    console.warn("[telegram] Polling already active");
    return;
  }

  pollingActive = true;

  // Verify token and get bot info
  telegramApi(token, "getMe").then((data) => {
    if (data?.ok) {
      const bot = data.result;
      console.log(`[telegram] Bot connected: @${bot.username} (${bot.first_name})`);

      // Delete any existing webhook to enable polling
      telegramApi(token, "deleteWebhook").then(() => {
        // Start polling loop
        poll(token, chatHandler);
      });
    } else {
      console.error("[telegram] Invalid bot token — check TELEGRAM_BOT_TOKEN");
      pollingActive = false;
    }
  }).catch((err) => {
    console.error("[telegram] Failed to connect:", err instanceof Error ? err.message : err);
    pollingActive = false;
  });
}

export function stopTelegramPolling(): void {
  pollingActive = false;
  console.log("[telegram] Polling stopped");
}
