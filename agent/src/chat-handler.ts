import Anthropic from "@anthropic-ai/sdk";
import { detectContext, loadSystemPrompt } from "./soul-loader.js";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Session {
  messages: Message[];
  lastActive: number;
}

interface ChatResponse {
  reply: string;
  suggestedActions?: string[];
}

const ACTION_PATTERNS: Array<{ pattern: RegExp; actions: string[] }> = [
  {
    pattern: /workstream|build|contribut/i,
    actions: ["View workstreams", "Start building"],
  },
  {
    pattern: /constitution|pillar|principle/i,
    actions: ["Read constitution", "Explore the pillars"],
  },
  {
    pattern: /join|sign\s*up|member/i,
    actions: ["Join the network", "Read the constitution first"],
  },
  {
    pattern: /council|influence/i,
    actions: ["Meet the council", "Read their principles"],
  },
  {
    pattern: /toolkit|campaign|spread/i,
    actions: ["Open the toolkit", "Generate campaign art"],
  },
];

function detectActions(reply: string): string[] | undefined {
  for (const { pattern, actions } of ACTION_PATTERNS) {
    if (pattern.test(reply)) {
      return actions;
    }
  }
  return undefined;
}

export class ChatHandler {
  private sessions: Map<string, Session> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async chat(sessionId: string, message: string): Promise<ChatResponse> {
    this.cleanup();

    let session = this.sessions.get(sessionId);
    if (!session) {
      session = { messages: [], lastActive: Date.now() };
      this.sessions.set(sessionId, session);
    }
    session.lastActive = Date.now();

    const context = detectContext(message);
    const systemPrompt = loadSystemPrompt(context);

    session.messages.push({ role: "user", content: message });

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: session.messages,
    });

    const reply =
      response.content[0].type === "text" ? response.content[0].text : "";

    session.messages.push({ role: "assistant", content: reply });

    const suggestedActions = detectActions(reply);

    return { reply, suggestedActions };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.lastActive > this.SESSION_TIMEOUT) {
        this.sessions.delete(id);
      }
    }
  }
}
