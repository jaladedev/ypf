"use server";

import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/auth/session";
import { revalidatePublicSite } from "@/lib/admin/revalidate";
import { zodFieldErrors, type ActionState } from "@/lib/admin/util";
import { leaderSchema } from "@/lib/admin/validation";
import { createClient } from "@/lib/supabase/server";

const FIELDS = ["id", "name", "role_title", "group", "photo_url", "bio", "is_active"];

export async function saveLeader(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireEditor();
  const raw = Object.fromEntries(FIELDS.map((k) => [k, formData.get(k) ?? ""]));
  const parsed = leaderSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error), error: "Please fix the highlighted fields." };
  const v = parsed.data;
  const db = await createClient();
  const row = { name: v.name, role_title: v.role_title, group: v.group, photo_url: v.photo_url ?? null, bio: v.bio ?? null, is_active: v.is_active };
  let error;
  if (v.id) {
    ({ error } = await db.from("leaders").update(row).eq("id", v.id));
  } else {
    const { data: last } = await db.from("leaders").select("sort_order").eq("group", v.group).order("sort_order", { ascending: false }).limit(1);
    ({ error } = await db.from("leaders").insert({ ...row, sort_order: (last?.[0]?.sort_order ?? 0) + 1 }));
  }
  if (error) {
    if (error.code === "42501" || /row-level security/.test(error.message)) return { error: "You don't have permission to do that." };
    console.error("leader save", error);
    return { error: "Couldn't save. Please try again." };
  }
  revalidatePublicSite();
  redirect("/admin/leadership?saved=saved");
}

export async function moveLeader(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  const dir = formData.get("dir") === "up" ? -1 : 1;
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  const db = await createClient();
  const { data: me } = await db.from("leaders").select("id,group").eq("id", id).maybeSingle();
  if (!me) return;
  const { data: peers } = await db.from("leaders").select("id").eq("group", me.group).order("sort_order").order("created_at");
  const order = (peers ?? []).map((p) => p.id);
  const i = order.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= order.length) return;
  [order[i], order[j]] = [order[j], order[i]];
  // Rewrite 1..n so ties from older data can never leave the order ambiguous.
  await Promise.all(order.map((lid, k) => db.from("leaders").update({ sort_order: k + 1 }).eq("id", lid)));
  revalidatePublicSite();
  redirect("/admin/leadership?saved=moved");
}

export async function deleteLeader(formData: FormData) {
  await requireEditor();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  const db = await createClient();
  await db.from("leaders").delete().eq("id", id);
  revalidatePublicSite();
  redirect("/admin/leadership?saved=deleted");
}
