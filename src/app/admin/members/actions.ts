"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/;

/** Admins can't change their own role or status: it prevents locking everyone out by accident. */
export async function setMemberRole(formData: FormData) {
  const { user } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!UUID.test(id) || !["member", "editor", "admin"].includes(role)) return;
  if (id === user.id) redirect(`/admin/members/${id}?error=self`);
  const db = await createClient();
  const { error } = await db.from("profiles").update({ role: role as "member" | "editor" | "admin" }).eq("id", id);
  if (error) redirect(`/admin/members/${id}?error=failed`);
  redirect(`/admin/members/${id}?saved=role`);
}

export async function setMemberStatus(formData: FormData) {
  const { user } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!UUID.test(id) || !["approved", "suspended", "rejected"].includes(status)) return;
  if (id === user.id) redirect(`/admin/members/${id}?error=self`);
  const db = await createClient();
  const { error } = await db.from("profiles").update({ membership_status: status as "approved" | "suspended" | "rejected" }).eq("id", id);
  if (error) redirect(`/admin/members/${id}?error=failed`);
  redirect(`/admin/members/${id}?saved=status`);
}
