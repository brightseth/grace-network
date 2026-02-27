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

    const enhancedPrompt = `Political campaign imagery for 'The Grace Network', a futuristic network state movement for human flourishing. Dark background with purple and gold accents, modern minimalist design, elegant typography. ${prompt}`;

    fal.config({
      credentials: import.meta.env.FAL_KEY || process.env.FAL_KEY,
    });

    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: enhancedPrompt,
        image_size: 'landscape_16_9',
        num_images: 1,
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
      url: imageUrl,
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
