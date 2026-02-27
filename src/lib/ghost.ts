// Ghost API integration for seth.ghost.io

const GHOST_URL = 'https://seth.ghost.io';
const GHOST_CONTENT_API_KEY = '5691af90039cf48be2b8a9e3cd';

export interface GhostPost {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string;
  excerpt: string;
  feature_image: string | null;
  published_at: string;
  reading_time: number;
  url: string;
  tags?: { name: string; slug: string }[];
}

export interface GhostPostsResponse {
  posts: GhostPost[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      pages: number;
      total: number;
    };
  };
}

export async function getPosts(limit = 10): Promise<GhostPost[]> {
  try {
    const response = await fetch(
      `${GHOST_URL}/ghost/api/content/posts/?key=${GHOST_CONTENT_API_KEY}&limit=${limit}&include=tags&fields=id,uuid,title,slug,html,excerpt,feature_image,published_at,reading_time,url`
    );

    if (!response.ok) {
      throw new Error(`Ghost API error: ${response.status}`);
    }

    const data: GhostPostsResponse = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Failed to fetch Ghost posts:', error);
    return [];
  }
}

export async function getPost(slug: string): Promise<GhostPost | null> {
  try {
    const response = await fetch(
      `${GHOST_URL}/ghost/api/content/posts/slug/${slug}/?key=${GHOST_CONTENT_API_KEY}&include=tags`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.posts?.[0] || null;
  } catch (error) {
    console.error('Failed to fetch Ghost post:', error);
    return null;
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
