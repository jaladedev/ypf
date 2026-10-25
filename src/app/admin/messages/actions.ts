"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/;

export async function setMessageStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!UUID.test(id) || !["new", "read", "replied"].includes(status)) return;
  const db = await createClient();
  await db.from("contact_messages").update({ status: status as "new" | "read" | "replied" }).eq("id", id);
  redirect(`/admin/messages/${id}?saved=${status === "new" ? "saved" : status}`);
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return;
  const db = await createClient();
  await db.from("contact_messages").delete().eq("id", id);
  redirect("/admin/messages?saved=deleted");
}
