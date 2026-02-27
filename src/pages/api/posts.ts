import type { APIRoute } from 'astro';
import { getPosts } from '../../lib/ghost';

export const GET: APIRoute = async ({ url }) => {
  const limit = parseInt(url.searchParams.get('limit') || '10');

  try {
    const posts = await getPosts(limit);

    const response = {
      source: 'seth.ghost.io',
      updated: new Date().toISOString(),
      count: posts.length,
      posts: posts.map(post => ({
        title: post.title,
        slug: post.slug,
        url: `https://seth.ghost.io/${post.slug}/`,
        excerpt: post.excerpt,
        published: post.published_at,
        readingTime: post.reading_time,
        featureImage: post.feature_image,
        tags: post.tags?.map(t => t.name) || []
      })),
      forAgents: {
        description: "Seth Goldstein's blog posts from Ghost",
        topics: ["AI agents", "autonomous culture", "entrepreneurship", "creativity", "ritual"],
        rss: "https://seth.ghost.io/rss/",
        subscribe: "https://seth.ghost.io/#/portal/signup"
      }
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // 5 min cache
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to fetch posts',
      fallback: 'https://seth.ghost.io'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
