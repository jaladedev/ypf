"use server";

import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/auth/session";
import { revalidatePublicSite } from "@/lib/admin/revalidate";
import { fromLagosInput, slugify, zodFieldErrors, type ActionState } from "@/lib/admin/util";
import { postSchema } from "@/lib/admin/validation";
import { createClient } from "@/lib/supabase/server";
import type { PublishStatus } from "@/types/database";

const FIELDS = ["id", "title", "slug", "excerpt", "body", "category", "cover_image", "published_at", "intent"];

export async function savePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireEditor();
  const parsed = postSchema.safeParse(Object.fromEntries(FIELDS.map((k) => [k, (formData.get(k) ?? "").toString()])));
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error), error: "Please fix the highlighted fields." };
  const v = parsed.data;
  const db = await createClient();

  let existingPublishedAt: string | null = null;
  if (v.id) {
    const { data } = await db.from("posts").select("published_at").eq("id", v.id).maybeSingle();
    existingPublishedAt = data?.published_at ?? null;
  }
  const chosen = fromLagosInput(v.published_at);
  const publishing = v.intent === "publish";
  // Publishing without a chosen date means "now" (or keep the date it already had).
  const published_at = chosen ?? (publishing ? (existingPublishedAt ?? new Date().toISOString()) : existingPublishedAt);

  const row = {
    title: v.title,
    slug: v.slug ?? (slugify(v.title) || `post-${Date.now().toString(36)}`),
    excerpt: v.excerpt ?? null,
    body: v.body,
    category: v.category,
    cover_image: v.cover_image ?? null,
    published_at,
  };
  const { error } = v.id
    ? await db.from("posts").update({ ...row, ...(publishing ? { status: "published" as const } : {}) }).eq("id", v.id)
    : await db.from("posts").insert({ ...row, status: publishing ? "published" : "draft", author_id: user.id });
  if (error) {
    if (error.code === "23505") return { fieldErrors: { slug: "Another article already uses this web address. Change it." }, error: "Please fix the highlighted fields." };
    if (error.code === "42501" || /row-level security/.test(error.message)) return { error: "You don't have permission to do that." };
    console.error("post save", error);
    return { error: "Couldn't save. Please try again." };
  }
  revalidatePublicSite();
  redirect(`/admin/news?saved=${publishing ? "published" : "saved"}`);
}

export async function setPostStatus(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as PublishStatus;
  if (!/^[0-9a-f-]{36}$/.test(id) || !["draft", "published", "archived"].includes(status)) return;
  const db = await createClient();
  await db.from("posts").update({ status }).eq("id", id);
  revalidatePublicSite();
  redirect(`/admin/news?saved=${status}`);
}

export async function deletePost(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  const db = await createClient();
  await db.from("posts").delete().eq("id", id);
  revalidatePublicSite();
  redirect("/admin/news?saved=deleted");
}
