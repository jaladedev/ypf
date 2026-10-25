"use server";

import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function deleteMedia(formData: FormData) {
  await requireEditor();
  const name = String(formData.get("name") ?? "");
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(name) || name.includes("..")) return;
  const db = await createClient();
  const { error } = await db.storage.from("media").remove([`uploads/${name}`]);
  redirect(error ? "/admin/media?saved=failed" : "/admin/media?saved=deleted");
}
