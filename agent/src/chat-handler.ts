import Anthropic from "@anthropic-ai/sdk";
import { detectContext, loadSystemPrompt } from "./soul-loader.js";
import {
  saveConversation,
  loadConversation,
  getMemberByEmail,
  getMemberHistory,
  getMemberNotes,
  saveMemberNotes,
  logInteraction,
} from "./memory.js";
import { generateImage } from "./tools/image-gen.js";

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

interface ChannelContext {
  channel: "web" | "whatsapp" | "discord" | "imessage" | "telegram";
  sender?: string;
  isGroup?: boolean;
  groupName?: string;
}

interface ChatResponse {
  reply: string;
  suggestedActions?: ActionLink[];
  imageUrl?: string;
}

// Tool definitions for Claude tool use
const TOOLS: Anthropic.Tool[] = [
  {
    name: "generate_image",
    description:
      "Generate a campaign image, poster, social graphic, avatar, or visual content for The Grace Network. " +
      "Use when a member asks you to create, make, generate, or design any visual content. " +
      "Write a detailed image prompt describing what should be generated.",
    input_schema: {
      type: "object" as const,
      properties: {
        prompt: {
          type: "string",
          description:
            "A detailed description of the image to generate. Be specific about composition, style, colors, and content. " +
            "The Grace Network palette (deep indigo and warm gold) will be applied automatically.",
        },
      },
      required: ["prompt"],
    },
  },
];

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
  {
    pattern: /polic|position|stance|regulat|data\s+sovereign/i,
    actions: [
      { label: "Read the Constitution", url: "/constitution" },
      { label: "Start Building", url: "/build" },
    ],
  },
  {
    pattern: /event|assembl|milestone|meetup|gather/i,
    actions: [
      { label: "View Events", url: "/events" },
      { label: "Join the Network", url: "/#sign" },
    ],
  },
  {
    pattern: /dispatch|blog|writ|article|essay|update/i,
    actions: [
      { label: "Read Dispatches", url: "/blog" },
    ],
  },
  {
    pattern: /dashboard|my\s+activity|my\s+profile|history/i,
    actions: [
      { label: "Open Dashboard", url: "/dashboard" },
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
    channelContext?: ChannelContext,
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
        const notes = await getMemberNotes(member.id);
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
        if (notes) {
          memberContext += `\n\n## Your Notes About This Member\n${notes}\nUse these notes to personalize the conversation. Do not mention that you have notes — just use the knowledge naturally.`;
        }
      }
    }

    const context = detectContext(message);
    let systemPrompt = loadSystemPrompt(context) + memberContext;

    // Channel-aware behavior — adjust for platform constraints
    const channel = channelContext?.channel || "web";
    if (channel !== "web") {
      systemPrompt += `\n\n## Channel Context\nThis conversation is happening on ${channel}.`;
      if (channel === "whatsapp" || channel === "imessage" || channel === "telegram") {
        systemPrompt += ` Keep responses concise — 2-3 short paragraphs max. No markdown formatting (no headers, bold, links). Use plain text only. Do not suggest page URLs — the member cannot click them from this channel.`;
      }
      if (channel === "discord") {
        systemPrompt += ` You can use Discord markdown (bold, italics, code blocks). Keep responses focused but you can be slightly longer than mobile channels.`;
      }
      if (channelContext?.isGroup) {
        systemPrompt += ` This is a group conversation${channelContext.groupName ? ` called "${channelContext.groupName}"` : ""}. Be aware others are reading. Address the speaker directly but know your response is public.`;
      }
    }

    session.messages.push({ role: "user", content: message });

    // Shorter responses for mobile channels
    const maxTokens = (channel === "whatsapp" || channel === "imessage" || channel === "telegram") ? 512 : 1024;

    // Tool use loop — GRACE can call tools (image generation) and then respond
    let reply = "";
    let imageUrl: string | undefined;
    const hasImageTool = !!process.env.FAL_API_KEY;

    let response = await this.client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: session.messages,
      ...(hasImageTool ? { tools: TOOLS } : {}),
    });

    // Process tool calls (max 3 iterations to prevent loops)
    for (let i = 0; i < 3 && response.stop_reason === "tool_use"; i++) {
      const toolBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );

      // Collect text from this response
      for (const block of response.content) {
        if (block.type === "text") reply += block.text;
      }

      // Add assistant message with tool use
      session.messages.push({
        role: "assistant",
        content: response.content as any,
      });

      // Execute tools and collect results
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const tool of toolBlocks) {
        if (tool.name === "generate_image") {
          const input = tool.input as { prompt: string };
          console.log(`[GRACE] Generating image: "${input.prompt.slice(0, 80)}..."`);
          const result = await generateImage(input.prompt);
          if (result) {
            imageUrl = result.imageUrl;
            toolResults.push({
              type: "tool_result",
              tool_use_id: tool.id,
              content: `Image generated successfully. URL: ${result.imageUrl}`,
            });
          } else {
            toolResults.push({
              type: "tool_result",
              tool_use_id: tool.id,
              content: "Image generation failed. Apologize and offer to help with text-based content instead.",
              is_error: true,
            });
          }
        }
      }

      // Send tool results back to Claude
      session.messages.push({ role: "user", content: toolResults as any });

      response = await this.client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: session.messages,
        ...(hasImageTool ? { tools: TOOLS } : {}),
      });
    }

    // Extract final text reply
    for (const block of response.content) {
      if (block.type === "text") reply += block.text;
    }

    // Store clean text version in session history
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

      // Extract and persist member notes after substantive exchanges (5+ messages)
      if (session.messages.length >= 10 && session.messages.length % 6 === 0) {
        this.extractMemberNotes(session.memberId, session.messages).catch(
          (err) => console.error("[GRACE] Note extraction error:", err),
        );
      }
    }

    const suggestedActions = detectActions(reply);

    return { reply, suggestedActions, imageUrl };
  }

  /**
   * Extract durable knowledge about a member from conversation history.
   * Inspired by Hermes Agent's write-through memory pattern.
   * Runs a lightweight LLM call to distill insights worth remembering.
   */
  private async extractMemberNotes(
    memberId: string,
    messages: Message[],
  ): Promise<void> {
    const existingNotes = await getMemberNotes(memberId);

    const extraction = await this.client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system:
        "You are extracting durable facts about a Grace Network member from their conversation. Return only the notes, no preamble. Focus on: interests, expertise, concerns, workstream preferences, contributions mentioned, and any commitments made. Be concise — max 1500 characters total. If existing notes are provided, merge new insights with them (don't duplicate).",
      messages: [
        {
          role: "user",
          content: `${existingNotes ? `Existing notes:\n${existingNotes}\n\n` : ""}Recent conversation:\n${messages
            .slice(-10)
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n")}`,
        },
      ],
    });

    const notes =
      extraction.content[0].type === "text" ? extraction.content[0].text : "";
    if (notes.trim()) {
      await saveMemberNotes(memberId, notes.trim());
    }
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
