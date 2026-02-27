// VIBE Credit Union — Pricing Engine
// All costs in micro-USDC (6 decimals). $1.00 = 1_000_000
// Opus 4.6 for vibecoders. Pay what you use.

export const DEFAULT_MODEL = 'claude-opus-4-6';

export interface ModelPricing {
  id: string;
  inputPer1M: number;   // USD per 1M input tokens
  outputPer1M: number;  // USD per 1M output tokens
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // HERO MODEL — Opus 4.6
  'claude-opus-4-6': {
    id: 'claude-opus-4-6',
    inputPer1M: 15.0,
    outputPer1M: 75.0,
  },
  'claude-sonnet-4-20250514': {
    id: 'claude-sonnet-4-20250514',
    inputPer1M: 3.0,
    outputPer1M: 15.0,
  },
  'claude-haiku-4-5-20251001': {
    id: 'claude-haiku-4-5-20251001',
    inputPer1M: 0.8,
    outputPer1M: 4.0,
  },
  // Legacy alias kept for backward compat
  'claude-opus-4-20250514': {
    id: 'claude-opus-4-20250514',
    inputPer1M: 15.0,
    outputPer1M: 75.0,
  },
};

// Also accept short aliases
const MODEL_ALIASES: Record<string, string> = {
  'claude-opus-4': 'claude-opus-4-6',
  'claude-sonnet-4': 'claude-sonnet-4-20250514',
  'claude-haiku-4': 'claude-haiku-4-5-20251001',
  'claude-haiku-4-5': 'claude-haiku-4-5-20251001',
};

export function resolveModel(model: string): ModelPricing | null {
  return MODEL_PRICING[model] ?? MODEL_PRICING[MODEL_ALIASES[model]] ?? null;
}

/**
 * Estimate input tokens from message content.
 * Rough heuristic: ~4 characters per token for English text.
 */
function estimateInputTokens(body: any): number {
  let charCount = 0;

  if (body.system) {
    charCount += typeof body.system === 'string'
      ? body.system.length
      : JSON.stringify(body.system).length;
  }

  if (Array.isArray(body.messages)) {
    for (const msg of body.messages) {
      if (typeof msg.content === 'string') {
        charCount += msg.content.length;
      } else if (Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (block.type === 'text') charCount += block.text.length;
          else charCount += JSON.stringify(block).length;
        }
      }
    }
  }

  // ~4 chars per token, minimum 100 tokens for overhead
  return Math.max(Math.ceil(charCount / 4), 100);
}

/**
 * Estimate total cost of a call BEFORE execution.
 * Used by x402 to set the payment price.
 * Returns micro-USDC (6 decimals).
 */
export function estimateCallCost(model: string, body: any): number {
  const pricing = resolveModel(model);
  if (!pricing) {
    // Unknown model — use Opus 4.6 pricing as safe default
    return estimateCallCost(DEFAULT_MODEL, body);
  }

  const inputTokens = estimateInputTokens(body);
  const outputTokens = body.max_tokens ?? 1024;

  const inputCostUsd = (inputTokens / 1_000_000) * pricing.inputPer1M;
  const outputCostUsd = (outputTokens / 1_000_000) * pricing.outputPer1M;
  const totalUsd = inputCostUsd + outputCostUsd;

  // Add 10% buffer for estimation variance
  const bufferedUsd = totalUsd * 1.1;

  // Convert to micro-USDC (6 decimals), minimum $0.001
  return Math.max(Math.ceil(bufferedUsd * 1_000_000), 1000);
}

/**
 * Calculate the ACTUAL cost after a call completes.
 * Returns micro-USDC (6 decimals).
 */
export function calculateActualCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = resolveModel(model);
  if (!pricing) {
    return calculateActualCost(DEFAULT_MODEL, inputTokens, outputTokens);
  }

  const inputCostUsd = (inputTokens / 1_000_000) * pricing.inputPer1M;
  const outputCostUsd = (outputTokens / 1_000_000) * pricing.outputPer1M;
  const totalUsd = inputCostUsd + outputCostUsd;

  return Math.ceil(totalUsd * 1_000_000);
}

/**
 * Format micro-USDC as a dollar string for x402.
 * e.g. 50000 -> "$0.05"
 */
export function formatUsdcPrice(microUsdc: number): string {
  return `$${(microUsdc / 1_000_000).toFixed(6)}`;
}

/**
 * Get all supported models with pricing info.
 * Opus 4.6 listed first as the hero model.
 */
export function getModelList() {
  // Explicitly order: Opus 4.6 first, then Sonnet, then Haiku
  // Exclude legacy opus-4-20250514 from public listing
  const orderedIds = [
    'claude-opus-4-6',
    'claude-sonnet-4-20250514',
    'claude-haiku-4-5-20251001',
  ];

  return orderedIds
    .map((id) => MODEL_PRICING[id])
    .filter(Boolean)
    .map((m) => ({
      id: m.id,
      input_per_1m_usd: m.inputPer1M,
      output_per_1m_usd: m.outputPer1M,
    }));
}
