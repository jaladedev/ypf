import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { adminNotifyEmails } from "@/lib/email/resend";
import { sendApplicationReceived, sendNewApplicationNotice } from "@/lib/email/templates";
import { applicationSchema, type ApplicationAnswers } from "@/lib/validation";
import type { Database, Json } from "@/types/database";

export type FinalizeResult =
  "submitted" | "already_pending" | "already_member" | "invalid";

/**
 * Saves the applicant's details to their profile and files a pending
 * application. Runs as the signed-in user, so RLS applies. Safe to call twice.
 * `raw` is re-validated here because it may come from user-editable metadata.
 */
export async function finalizeApplication(
  db: SupabaseClient<Database>,
  user: User,
  raw: unknown,
): Promise<FinalizeResult> {
  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) return "invalid";
  const a: ApplicationAnswers = parsed.data;

  const { data: profile } = await db
    .from("profiles")
    .select("membership_status")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.membership_status === "approved") return "already_member";
  if (profile?.membership_status === "suspended") return "invalid";

  const { data: open } = await db
    .from("membership_applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (open) return "already_pending";

  const { error: pErr } = await db
    .from("profiles")
    .update({
      full_name: a.full_name,
      phone: a.phone,
      institution: a.institution,
      career_stage: a.career_stage,
      specialisation: a.specialisation,
      linkedin_url: a.linkedin_url ?? null,
    })
    .eq("id", user.id);
  if (pErr) throw new Error(`profile update: ${pErr.message}`);

  const { data: app, error } = await db
    .from("membership_applications")
    .insert({ user_id: user.id, answers: JSON.parse(JSON.stringify(a)) as Json })
    .select("id")
    .single();
  if (error) {
    // Lost a race with a parallel submit: the unique index says one is already open.
    if (error.code === "23505") return "already_pending";
    throw new Error(`application insert: ${error.message}`);
  }

  if (user.email) await sendApplicationReceived(user.email, a.full_name);
  const admins = adminNotifyEmails();
  if (admins.length) await sendNewApplicationNotice(admins, a.full_name, app.id);
  return "submitted";
}
