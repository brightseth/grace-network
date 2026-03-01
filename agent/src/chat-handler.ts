import Anthropic from "@anthropic-ai/sdk";
import { detectContext, loadSystemPrompt } from "./soul-loader.js";
import {
  saveConversation,
  loadConversation,
  getMemberByEmail,
  getMemberHistory,
  logInteraction,
} from "./memory.js";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Session {
  messages: Message[];
  lastActive: number;
  memberId?: string;
}

interface ActionLink {
  label: string;
  url: string;
}

interface ChatResponse {
  reply: string;
  suggestedActions?: ActionLink[];
}

const ACTION_PATTERNS: Array<{ pattern: RegExp; actions: ActionLink[] }> = [
  {
    pattern: /workstream|build|contribut/i,
    actions: [
      { label: "Start Building", url: "/build" },
      { label: "Join the Network", url: "/#sign" },
    ],
  },
  {
    pattern: /constitution|pillar|principle/i,
    actions: [
      { label: "Read the Constitution", url: "/constitution" },
      { label: "Meet the Council", url: "/council" },
    ],
  },
  {
    pattern: /join|sign\s*up|member/i,
    actions: [
      { label: "Join the Network", url: "/#sign" },
      { label: "Read the Constitution", url: "/constitution" },
    ],
  },
  {
    pattern: /council|influence/i,
    actions: [
      { label: "Meet the Council", url: "/council" },
      { label: "Read the Constitution", url: "/constitution" },
    ],
  },
  {
    pattern: /toolkit|campaign|spread/i,
    actions: [
      { label: "Open the Toolkit", url: "/toolkit" },
      { label: "Start Building", url: "/build" },
    ],
  },
  {
    pattern: /transparen|how.+work|source.+code|open.+source/i,
    actions: [
      { label: "Read Our Transparency Page", url: "/transparency" },
      { label: "Read the Constitution", url: "/constitution" },
    ],
  },
];

function detectActions(reply: string): ActionLink[] | undefined {
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

  async chat(
    sessionId: string,
    message: string,
    memberEmail?: string,
  ): Promise<ChatResponse> {
    this.cleanup();

    let session = this.sessions.get(sessionId);

    if (!session) {
      // Try to restore from Supabase
      const savedMessages = await loadConversation(sessionId);
      session = {
        messages: savedMessages || [],
        lastActive: Date.now(),
      };
      this.sessions.set(sessionId, session);
    }
    session.lastActive = Date.now();

    // Build member context if email provided
    let memberContext = "";
    if (memberEmail && !session.memberId) {
      const member = await getMemberByEmail(memberEmail);
      if (member) {
        session.memberId = member.id;
        const history = await getMemberHistory(member.id);
        const joinDate = new Date(member.created_at).toLocaleDateString(
          "en-US",
          { year: "numeric", month: "long", day: "numeric" },
        );
        memberContext = `\n\n## Member Context\nThe person you are speaking with is ${member.first_name} ${member.last_name}, who joined on ${joinDate}.`;
        if (member.statement) {
          memberContext += ` When they signed the constitution, they wrote: "${member.statement}"`;
        }
        if (history && history.chatCount > 0) {
          memberContext += `\nThis member has spoken with you ${history.chatCount} time${history.chatCount === 1 ? "" : "s"} before.`;
        }
      }
    }

    const context = detectContext(message);
    const systemPrompt = loadSystemPrompt(context) + memberContext;

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

    // Persist to Supabase (fire and forget)
    saveConversation(sessionId, session.messages, session.memberId).catch(
      (err) => console.error("[GRACE] Memory save error:", err),
    );

    // Log chat interaction for known members
    if (session.memberId) {
      logInteraction(session.memberId, "chat", {
        sessionId,
        messagePreview: message.slice(0, 100),
      }).catch((err) => console.error("[GRACE] Interaction log error:", err));
    }

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
