/**
 * Dispatch Publishing Tool
 *
 * GRACE writes dispatches (blog posts) and stores them in Supabase.
 * The site reads from this table to render the /blog page dynamically.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Dispatch {
  title: string;
  content: string;
  author: string;
  tags: string[];
  publishedAt: string;
  slug?: string;
}

function getClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function publishDispatch(dispatch: Dispatch): Promise<string | null> {
  const sb = getClient();
  if (!sb) {
    console.warn("[dispatches] Supabase not configured — writing to local file");
    const fs = await import("node:fs");
    const path = await import("node:path");
    const slug = dispatch.slug || slugify(dispatch.title);
    const outDir = path.resolve(import.meta.dirname, "../../dispatches");
    fs.mkdirSync(outDir, { recursive: true });
    const filePath = path.join(outDir, `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(dispatch, null, 2));
    console.log(`[dispatches] Written to ${filePath}`);
    return slug;
  }

  const slug = dispatch.slug || slugify(dispatch.title);

  const { error } = await sb.from("dispatches").insert({
    slug,
    title: dispatch.title,
    content: dispatch.content,
    author: dispatch.author,
    tags: dispatch.tags,
    published_at: dispatch.publishedAt,
  });

  if (error) {
    console.error("[dispatches] Publish error:", error.message);
    // Fallback to local file
    const fs = await import("node:fs");
    const path = await import("node:path");
    const outDir = path.resolve(import.meta.dirname, "../../dispatches");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, `${slug}.json`),
      JSON.stringify(dispatch, null, 2),
    );
    return slug;
  }

  return slug;
}

export async function getDispatches(limit = 20): Promise<Dispatch[]> {
  const sb = getClient();
  if (!sb) return [];

  const { data, error } = await sb
    .from("dispatches")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as Dispatch[];
}

export async function getDispatchBySlug(slug: string): Promise<Dispatch | null> {
  const sb = getClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from("dispatches")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as Dispatch;
}
