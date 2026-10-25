"use server";

import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/auth/session";
import { revalidatePublicSite } from "@/lib/admin/revalidate";
import { slugify, splitLines, zodFieldErrors, type ActionState } from "@/lib/admin/util";
import { jobSchema } from "@/lib/admin/validation";
import { createClient } from "@/lib/supabase/server";
import type { PublishStatus } from "@/types/database";

const FIELDS = ["id", "title", "slug", "organisation", "description", "requirements", "location", "job_type", "experience_level", "specialisation", "apply_url", "apply_email", "deadline", "intent"];

export async function saveJob(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireEditor();
  const parsed = jobSchema.safeParse(Object.fromEntries(FIELDS.map((k) => [k, (formData.get(k) ?? "").toString()])));
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error), error: "Please fix the highlighted fields." };
  const v = parsed.data;
  const row = {
    title: v.title,
    slug: v.slug ?? (slugify(`${v.title} ${v.organisation}`) || `job-${Date.now().toString(36)}`),
    organisation: v.organisation,
    description: v.description,
    requirements: splitLines(v.requirements),
    location: v.location ?? null,
    job_type: v.job_type,
    experience_level: v.experience_level ?? null,
    specialisation: v.specialisation ?? null,
    apply_url: v.apply_url ?? null,
    apply_email: v.apply_email ?? null,
    deadline: v.deadline ?? null,
  };
  const db = await createClient();
  const { error } = v.id
    ? await db.from("jobs").update({ ...row, ...(v.intent === "publish" ? { status: "published" as const } : {}) }).eq("id", v.id)
    : await db.from("jobs").insert({ ...row, status: v.intent === "publish" ? "published" : "draft", created_by: user.id });
  if (error) {
    if (error.code === "23505") return { fieldErrors: { slug: "Another job already uses this web address. Change it." }, error: "Please fix the highlighted fields." };
    if (error.code === "42501" || /row-level security/.test(error.message)) return { error: "You don't have permission to do that." };
    console.error("job save", error);
    return { error: "Couldn't save. Please try again." };
  }
  revalidatePublicSite();
  redirect(`/admin/jobs?saved=${v.intent === "publish" ? "published" : "saved"}`);
}

export async function setJobStatus(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as PublishStatus;
  if (!/^[0-9a-f-]{36}$/.test(id) || !["draft", "published", "archived"].includes(status)) return;
  const db = await createClient();
  await db.from("jobs").update({ status }).eq("id", id);
  revalidatePublicSite();
  redirect(`/admin/jobs?saved=${status}`);
}

export async function deleteJob(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  const db = await createClient();
  await db.from("jobs").delete().eq("id", id);
  revalidatePublicSite();
  redirect("/admin/jobs?saved=deleted");
}

/** Copies a listing as a new draft (no deadline, so the old one isn't carried over). */
export async function duplicateJob(formData: FormData) {
  const { user } = await requireEditor();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  const db = await createClient();
  const { data: j } = await db.from("jobs").select("*").eq("id", id).maybeSingle();
  if (!j) redirect("/admin/jobs");
  let created: string | undefined;
  for (let n = 1; n <= 20 && !created; n++) {
    const slug = `${j.slug}-copy${n > 1 ? `-${n}` : ""}`.slice(0, 80).replace(/-+$/, "");
    const { data, error } = await db
      .from("jobs")
      .insert({
        title: `${j.title} (copy)`,
        slug,
        organisation: j.organisation,
        description: j.description,
        requirements: j.requirements,
        location: j.location,
        job_type: j.job_type,
        experience_level: j.experience_level,
        specialisation: j.specialisation,
        apply_url: j.apply_url,
        apply_email: j.apply_email,
        deadline: null,
        status: "draft",
        created_by: user.id,
      })
      .select("id")
      .single();
    if (!error) created = data.id;
    else if (error.code !== "23505") break;
  }
  if (!created) redirect("/admin/jobs");
  redirect(`/admin/jobs/${created}?saved=duplicated`);
}
