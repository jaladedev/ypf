"use server";

import { requireUser } from "@/lib/auth/session";
import { adminNotifyEmails, sendEmail } from "@/lib/email/resend";
import { createClient } from "@/lib/supabase/server";

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

/** Deleting a member's data is done by an admin, so this files a request they can see. */
export async function requestDeletion(): Promise<SettingsState> {
  const { user, profile } = await requireUser("/dashboard/settings");
  const db = await createClient();
  const name = profile?.full_name || "Member";
  const { error } = await db.from("contact_messages").insert({
    name,
    email: user.email ?? "unknown",
    subject: "Account deletion request",
    message: `${name} (${user.email}) asked for their account and data to be deleted.`,
  });
  if (error) return { error: "We couldn't send the request. Please contact us instead." };
  const admins = adminNotifyEmails();
  if (admins.length) {
    await sendEmail({
      to: admins,
      subject: "YPF account deletion request",
      text: `${name} (${user.email}) asked for their account and data to be deleted.`,
    });
  }
  return { message: "Request sent. An admin will confirm by email." };
}
