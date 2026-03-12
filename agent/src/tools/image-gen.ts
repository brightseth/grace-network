/**
 * Image Generation Tool for GRACE
 *
 * Uses fal.ai's nano-banana-pro-2 model to generate campaign imagery,
 * posters, social graphics, and visual content for the movement.
 *
 * Called by GRACE via Claude tool use when members ask for visual content.
 */

import { fal } from "@fal-ai/client";

const FAL_API_KEY = process.env.FAL_API_KEY;

// Grace Network visual style prompt prefix
const STYLE_PREFIX =
  "Political campaign imagery for 'The Grace Network', a movement for human flourishing and AI governance. " +
  "Minimal, confident, purposeful design. Deep indigo (#3730A3) and warm gold (#B45309) palette. " +
  "Clean lines, modern, hopeful, not dystopian. ";

interface GenerateResult {
  imageUrl: string;
  prompt: string;
}

/**
 * Generate an image from a text prompt.
 * Returns the CDN URL of the generated image.
 */
export async function generateImage(prompt: string): Promise<GenerateResult | null> {
  if (!FAL_API_KEY) {
    console.error("[image-gen] No FAL_API_KEY configured");
    return null;
  }

  fal.config({ credentials: FAL_API_KEY });

  const enhancedPrompt = STYLE_PREFIX + prompt;

  try {
    console.log(`[image-gen] Generating: "${prompt.slice(0, 80)}..."`);

    const result = await fal.subscribe("fal-ai/nano-banana-pro", {
      input: {
        prompt: enhancedPrompt,
        aspect_ratio: "1:1",
        num_images: 1,
        output_format: "png",
      },
    }) as any;

    const imageUrl = result?.data?.images?.[0]?.url || result?.images?.[0]?.url;

    if (!imageUrl) {
      console.error("[image-gen] No image URL in response:", JSON.stringify(result).slice(0, 200));
      return null;
    }

    console.log(`[image-gen] Generated: ${imageUrl.slice(0, 80)}...`);
    return { imageUrl, prompt: enhancedPrompt };
  } catch (err) {
    console.error("[image-gen] Generation failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
