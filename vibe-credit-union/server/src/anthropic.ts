// VIBE Credit Union — Anthropic API Forwarding

import type { Response as ExpressResponse } from 'express';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

export interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: any[];
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

/**
 * Usage data extracted from an SSE stream's final message_delta event.
 */
export interface StreamUsage {
  input_tokens: number;
  output_tokens: number;
}

/**
 * Forward a request body to the Anthropic Messages API (non-streaming).
 * Passes through the body as-is, adding auth headers.
 */
export async function forwardToAnthropic(body: any): Promise<AnthropicResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // Ensure stream is false for non-streaming path
  const requestBody = { ...body, stream: false };

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errorBody}`);
  }

  return response.json() as Promise<AnthropicResponse>;
}

/**
 * Forward a streaming request to the Anthropic Messages API.
 * Pipes the SSE stream directly to the Express response while
 * capturing usage data from the final message_delta event.
 *
 * Returns the actual token usage once the stream completes.
 */
export async function forwardToAnthropicStream(
  body: any,
  clientRes: ExpressResponse,
): Promise<StreamUsage> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // Force stream: true
  const requestBody = { ...body, stream: true };

  const upstreamRes = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(requestBody),
  });

  if (!upstreamRes.ok) {
    const errorBody = await upstreamRes.text();
    throw new Error(`Anthropic API ${upstreamRes.status}: ${errorBody}`);
  }

  if (!upstreamRes.body) {
    throw new Error('Anthropic API returned no body for streaming request');
  }

  // Set SSE headers on the client response
  clientRes.setHeader('Content-Type', 'text/event-stream');
  clientRes.setHeader('Cache-Control', 'no-cache');
  clientRes.setHeader('Connection', 'keep-alive');
  clientRes.flushHeaders();

  // Track usage from the stream
  let inputTokens = 0;
  let outputTokens = 0;

  const reader = upstreamRes.body.getReader();
  const decoder = new TextDecoder();

  try {
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      // Write the raw SSE chunk directly to client
      clientRes.write(chunk);

      // Also parse it to extract usage data
      buffer += chunk;

      // Process complete SSE events in the buffer
      const lines = buffer.split('\n');
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const event = JSON.parse(jsonStr);

            // message_start contains initial usage (input tokens)
            if (event.type === 'message_start' && event.message?.usage) {
              inputTokens = event.message.usage.input_tokens || 0;
            }

            // message_delta contains final output usage
            if (event.type === 'message_delta' && event.usage) {
              outputTokens = event.usage.output_tokens || 0;
            }
          } catch {
            // Not valid JSON — skip (could be partial data)
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // End the SSE stream
  clientRes.end();

  return { input_tokens: inputTokens, output_tokens: outputTokens };
}
