"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SavedState = { signedIn: boolean; saved: boolean };

/** Resolve by slug on the live database: job pages are cached, so an id they carry can be stale. */
async function jobIdFor(db: Awaited<ReturnType<typeof createClient>>, slug: string) {
  const { data } = await db.from("jobs").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

export async function getSavedState(slug: string): Promise<SavedState> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { signedIn: false, saved: false };
  const jobId = await jobIdFor(db, slug);
  if (!jobId) return { signedIn: true, saved: false };
  const { data } = await db
    .from("saved_jobs")
    .select("job_id")
    .eq("job_id", jobId)
    .maybeSingle();
  return { signedIn: true, saved: Boolean(data) };
}

export async function toggleSavedJob(slug: string): Promise<SavedState> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { signedIn: false, saved: false };
  const jobId = await jobIdFor(db, slug);
  if (!jobId) return { signedIn: true, saved: false };
  const { data: existing } = await db
    .from("saved_jobs")
    .select("job_id")
    .eq("job_id", jobId)
    .maybeSingle();
  const { error } = existing
    ? await db.from("saved_jobs").delete().eq("job_id", jobId).eq("user_id", user.id)
    : await db.from("saved_jobs").insert({ job_id: jobId, user_id: user.id });
  if (error) {
    console.error("toggleSavedJob", error);
    return { signedIn: true, saved: Boolean(existing) };
  }
  revalidatePath("/dashboard/saved");
  return { signedIn: true, saved: !existing };
}
