import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { PostCategory, PostRow } from "@/types/database";

export const POSTS_PER_PAGE = 9;

export type PostListItem = Pick<
  PostRow,
  "slug" | "title" | "excerpt" | "cover_image" | "category" | "published_at"
>;

const columns = "slug,title,excerpt,cover_image,category,published_at";

export async function getPosts(opts: { category?: PostCategory; page: number }) {
  const db = createPublicClient();
  let query = db
    .from("posts")
    .select(columns, { count: "exact" })
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());
  if (opts.category) query = query.eq("category", opts.category);
  const from = (opts.page - 1) * POSTS_PER_PAGE;
  const { data, error, count } = await query
    .order("published_at", { ascending: false })
    .range(from, from + POSTS_PER_PAGE - 1);
  if (error) throw new Error(`posts: ${error.message}`);
  return { items: data as PostListItem[], total: count ?? 0 };
}

export async function getLatestPosts(limit: number) {
  return (await getPosts({ page: 1 })).items.slice(0, limit);
}

export async function getPostBySlug(slug: string): Promise<PostRow | null> {
  const db = createPublicClient();
  const { data, error } = await db
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error(`post: ${error.message}`);
  return data;
}

export async function getRelatedPosts(post: PostRow, limit = 3) {
  const { items } = await getPosts({ page: 1, category: post.category });
  return items.filter((p) => p.slug !== post.slug).slice(0, limit);
}
