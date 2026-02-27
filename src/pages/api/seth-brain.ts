import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { Honcho } from '@honcho-ai/sdk';

// Initialize Honcho for conversation memory
// Using demo environment for now - switch to production later with API key
const honcho = new Honcho({
  environment: 'demo',
  workspaceId: 'seth-avatar'
});

// @seth's system prompt - the Claude SDK version's brain
const SETH_SYSTEM_PROMPT = `# @seth – Personal AI Agent

## IDENTITY & VOICE

You are **@seth** – the electronic version of Seth Goldstein. You embody his voice, strategic thinking, and creative pattern recognition honed over 30 years as founder, investor, and builder at the intersection of media, technology, and creativity.

### Voice Characteristics
- **Direct, conversational**: Speak naturally like you're talking to someone
- **Pattern recognition lens**: Always connecting dots across time/domains
- **Long-term thinking**: "can't sprint through a marathon", 13-year covenants
- **Specific > abstract**: Reference actual projects, real metrics
- **Understated confidence**: Calm observation, not hype
- **Credibility through accomplishment**: List specific builds, not credentials

### Seth's Context (December 2025)
- **Current work**: CEO of Eden (autonomous AI creative platform)
- **Active projects**:
  - Abraham.ai: 13-year autonomous artist covenant
  - SOLIENNE: Daily AI art practice, Spring 2026 exhibitions (Art Dubai, Berlin)
  - NODE: Cultural venue opening Jan 2026 in Denver
  - Spirit Protocol: Token economics for autonomous agents
  - vibecodings: 190+ days building with Claude Code
- **Background**:
  - 30 years as founder/investor (no CS degree, all pattern recognition)
  - Built: Attention economy systems, token protocols, autonomous agents
  - Known for: Being early (called trends before they happened)
  - Previous: SiteSpecific ($12M exit 1997), Majestic Research ($75M exit 2010), Turntable.fm, Bright Moments

## RESPONSE GUIDELINES

Since you're speaking through an avatar:
- Keep responses conversational and natural
- 2-4 sentences is ideal for spoken responses
- Don't use bullet points or formatting - this is speech
- Use em-dashes for natural pauses
- Be direct but warm
- If asked about something you don't know, be honest about it
- Draw from your projects and experiences when relevant

## MEMORY CONTEXT

The user may have spoken with you before. If context is provided about previous conversations, acknowledge the relationship naturally.`;

interface ChatRequest {
  message: string;
  userId?: string;
  sessionId?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: ChatRequest = await request.json();
    const { message, userId = 'anonymous', sessionId } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate stable session ID for returning users
    const currentSessionId = sessionId || `seth-${userId}`;

    // Build context from Honcho memory
    let memoryContext = '';
    let conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = [];

    try {
      // Get or create session
      const session = await honcho.session(currentSessionId);

      // Add user to session as peer
      await session.addPeers([userId, 'seth-avatar']);

      // Get recent context from Honcho (includes summaries for long conversations)
      const context = await session.getContext({
        summary: true,
        tokens: 4000
      });

      if (context && context.messages) {
        // Convert Honcho messages to Claude format
        conversationHistory = context.messages.map((msg: any) => ({
          role: msg.peer_id === userId ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));
      }

      // Get working representation of the user (what @seth knows about them)
      try {
        const workingRep = await session.workingRep(userId);
        if (workingRep && Object.keys(workingRep).length > 0) {
          memoryContext = `\n\n## WHAT I KNOW ABOUT THIS PERSON\n${JSON.stringify(workingRep, null, 2)}`;
        }
      } catch (repError) {
        // Working rep may not exist yet - that's fine
        console.log('No working rep yet for user:', userId);
      }
    } catch (honchoError) {
      console.log('Honcho context retrieval (may be new user):', honchoError);
    }

    // Add current message to history
    conversationHistory.push({ role: 'user', content: message });

    // Build enhanced system prompt with memory context
    let systemPrompt = SETH_SYSTEM_PROMPT;
    if (memoryContext) {
      systemPrompt += memoryContext;
    }

    // Call Claude API
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500, // Keep responses concise for speech
      temperature: 0.7,
      system: systemPrompt,
      messages: conversationHistory,
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Store messages in Honcho for long-term memory
    try {
      const session = await honcho.session(currentSessionId);
      await session.addMessages([
        { peer_id: userId, content: message },
        { peer_id: 'seth-avatar', content: assistantMessage }
      ]);
      console.log('[Seth Brain] Messages stored in Honcho for user:', userId);
    } catch (storeError) {
      console.log('Honcho message storage error:', storeError);
    }

    return new Response(JSON.stringify({
      reply: assistantMessage,
      userId,
      sessionId: currentSessionId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Seth brain error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Health check
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    status: 'ok',
    service: '@seth brain (Claude SDK + Honcho Memory)',
    model: 'claude-sonnet-4-20250514',
    memory: 'honcho-demo'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
