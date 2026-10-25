"use server";

import { requireUser } from "@/lib/auth/session";
import { rateLimit, TOO_MANY } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type SettingsState = { error?: string; message?: string };

export async function changePassword(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireUser("/dashboard/settings");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== confirm) return { error: "The two passwords don't match." };
  const db = await createClient();
  const { error } = await db.auth.updateUser({ password });
  if (error)
    return {
      error:
        error.code === "same_password"
          ? "Choose a password you haven't used before."
          : "We couldn't change your password. Please try again.",
    };
  return { message: "Password updated." };
}

/** Starts an email change. Supabase emails a confirmation link to the new address. */
export async function changeEmail(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { user } = await requireUser("/dashboard/settings");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (email === user.email?.toLowerCase()) return { error: "That is already your email address." };
  if (!(await rateLimit("email-link", 8, 3600))) return { error: TOO_MANY };
  const db = await createClient();
  const { error } = await db.auth.updateUser({ email });
  if (error)
    return {
      error:
        error.code === "email_exists"
          ? "That email address is already in use."
          : "We couldn't start the change. Please try again.",
    };
  return {
    message: `We sent a confirmation link to ${email}. Your email changes once you open it.`,
  };
}

/**
 * Permanently deletes the signed-in member's account and personal data.
 * Requires typing DELETE. The last admin can't remove themselves.
 */
export async function deleteAccount(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { user, profile } = await requireUser("/dashboard/settings");
  if (String(formData.get("confirm") ?? "").trim() !== "DELETE")
    return { error: "Type DELETE (in capitals) to confirm." };
  const admin = createAdminClient();

  if (profile?.role === "admin") {
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("membership_status", "approved");
    if ((count ?? 0) <= 1)
      return { error: "You are the only admin. Make someone else an admin before deleting your account." };
  }

  // Registrations keep the email they were made with, so remove those too.
  if (user.email) await admin.from("event_registrations").delete().eq("email", user.email);
  const { data: files } = await admin.storage.from("avatars").list(user.id);
  if (files?.length)
    await admin.storage.from("avatars").remove(files.map((f) => `${user.id}/${f.name}`));

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: "We couldn't delete your account. Please contact us." };

  const db = await createClient();
  await db.auth.signOut();
  redirect("/login?deleted=1");
}
