import type { APIRoute } from 'astro';
import * as fal from '@fal-ai/serverless-client';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const enhancedPrompt = `Political campaign imagery for 'The Grace Network', a network state movement for human flourishing. Minimal, light, confident design inspired by Anthropic aesthetics and Shepard Fairey poster art. Clean typography, purposeful color. ${prompt}`;

    fal.config({
      credentials: import.meta.env.FAL_KEY || process.env.FAL_KEY,
    });

    const result = await fal.subscribe('fal-ai/nano-banana-pro', {
      input: {
        prompt: enhancedPrompt,
        aspect_ratio: '16:9',
        num_images: 1,
        output_format: 'png',
      },
    }) as any;

    const imageUrl = result?.images?.[0]?.url;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'No image generated' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      imageUrl: imageUrl,
      prompt: enhancedPrompt
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
