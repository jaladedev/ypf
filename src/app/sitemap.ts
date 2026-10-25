import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const db = createPublicClient();
  const [events, jobs, posts] = await Promise.all([
    db.from("events").select("slug,updated_at").eq("status", "published"),
    db.from("jobs").select("slug,updated_at").eq("status", "published"),
    db.from("posts").select("slug,updated_at").eq("status", "published").lte("published_at", new Date().toISOString()),
  ]);

  const fixed = ["", "/about", "/leadership", "/events", "/jobs", "/news", "/contact", "/join", "/privacy", "/terms"];
  return [
    ...fixed.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...(events.data ?? []).map((e) => ({ url: `${base}/events/${e.slug}`, lastModified: e.updated_at, priority: 0.6 })),
    ...(jobs.data ?? []).map((j) => ({ url: `${base}/jobs/${j.slug}`, lastModified: j.updated_at, priority: 0.6 })),
    ...(posts.data ?? []).map((p) => ({ url: `${base}/news/${p.slug}`, lastModified: p.updated_at, priority: 0.6 })),
  ];
}
