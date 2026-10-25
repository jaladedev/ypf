"use server";

import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/auth/session";
import { revalidatePublicSite } from "@/lib/admin/revalidate";
import { fromLagosInput, slugify, splitLines, zodFieldErrors, type ActionState } from "@/lib/admin/util";
import { eventSchema, speakerSchema } from "@/lib/admin/validation";
import { createClient } from "@/lib/supabase/server";
import type { PublishStatus } from "@/types/database";

export async function saveEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireEditor();
  const get = (k: string) => (formData.get(k) ?? "").toString();
  const parsed = eventSchema.safeParse(Object.fromEntries(["id", "title", "slug", "summary", "body", "starts_at", "ends_at", "venue", "city", "cover_image", "registration_deadline", "capacity", "features", "intent"].map((k) => [k, get(k)])));
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error), error: "Please fix the highlighted fields." };
  const v = parsed.data;

  const names = formData.getAll("speaker_name").map(String);
  const titles = formData.getAll("speaker_title").map(String);
  const photos = formData.getAll("speaker_photo").map(String);
  const speakers = [];
  for (let i = 0; i < names.length; i++) {
    if (!names[i].trim()) continue;
    const s = speakerSchema.safeParse({ name: names[i], title: titles[i] ?? "", photo_url: photos[i] ?? "" });
    if (!s.success) return { error: `Speaker ${i + 1}: ${s.error.issues[0].message}` };
    speakers.push(s.data);
  }

  const startsAt = fromLagosInput(v.starts_at);
  if (!startsAt) return { fieldErrors: { starts_at: "Pick a date and time" } };
  const row = {
    title: v.title,
    slug: v.slug ?? (slugify(v.title) || `event-${Date.now().toString(36)}`),
    summary: v.summary ?? null,
    body: v.body ?? null,
    starts_at: startsAt,
    ends_at: fromLagosInput(v.ends_at),
    venue: v.venue ?? null,
    city: v.city ?? null,
    cover_image: v.cover_image ?? null,
    registration_deadline: fromLagosInput(v.registration_deadline),
    capacity: v.capacity ? Number(v.capacity) : null,
    features: splitLines(v.features),
  };

  const db = await createClient();
  let id = v.id;
  if (id) {
    const patch = { ...row, ...(v.intent === "publish" ? { status: "published" as const } : {}) };
    const { error } = await db.from("events").update(patch).eq("id", id);
    if (error) return dbError(error);
  } else {
    const { data, error } = await db
      .from("events")
      .insert({ ...row, status: v.intent === "publish" ? "published" : "draft", created_by: user.id })
      .select("id")
      .single();
    if (error) return dbError(error);
    id = data.id;
  }

  // Replace the speaker list.
  const del = await db.from("event_speakers").delete().eq("event_id", id);
  if (del.error) return { error: "The event was saved but its speakers couldn't be updated. Try again." };
  if (speakers.length) {
    const ins = await db.from("event_speakers").insert(
      speakers.map((s, i) => ({ event_id: id!, name: s.name, title: s.title ?? null, photo_url: s.photo_url ?? null, sort_order: i + 1 })),
    );
    if (ins.error) return { error: "The event was saved but its speakers couldn't be updated. Try again." };
  }

  revalidatePublicSite();
  redirect(`/admin/events?saved=${v.intent === "publish" ? "published" : "saved"}`);
}

function dbError(error: { code?: string; message: string }): ActionState {
  if (error.code === "23505") return { fieldErrors: { slug: "Another event already uses this web address. Change it." }, error: "Please fix the highlighted fields." };
  if (error.code === "42501" || /row-level security/.test(error.message)) return { error: "You don't have permission to do that." };
  console.error("event save", error);
  return { error: "Couldn't save. Please try again." };
}

export async function setEventStatus(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as PublishStatus;
  if (!/^[0-9a-f-]{36}$/.test(id) || !["draft", "published", "archived"].includes(status)) return;
  const db = await createClient();
  await db.from("events").update({ status }).eq("id", id);
  revalidatePublicSite();
  redirect(`/admin/events?saved=${status}`);
}

export async function deleteEvent(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  const db = await createClient();
  await db.from("events").delete().eq("id", id);
  revalidatePublicSite();
  redirect("/admin/events?saved=deleted");
}

export async function removeRegistration(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  const eventId = String(formData.get("event_id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id) || !/^[0-9a-f-]{36}$/.test(eventId)) return;
  const db = await createClient();
  await db.from("event_registrations").delete().eq("id", id);
  redirect(`/admin/events/${eventId}/registrations?saved=removed`);
}
