"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { sendApplicationDecision } from "@/lib/email/templates";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validation";

export type ReviewState = { error?: string };

export async function reviewApplication(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  await requireAdmin(); // never trust that the page was the only way here
  const parsed = reviewSchema.safeParse({
    id: formData.get("id"),
    decision: formData.get("decision"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: "Invalid request." };
  const { id, decision, note } = parsed.data;
  if (decision === "rejected" && (!note || note.length < 5)) {
    return {
      error: "Add a short note explaining why, so the applicant knows what to change.",
    };
  }

  const db = await createClient();
  // Only pending applications can be decided; the database trigger syncs the profile status.
  const { data, error } = await db
    .from("membership_applications")
    .update({ status: decision, review_note: note ?? null })
    .eq("id", id)
    .eq("status", "pending")
    .select("user_id")
    .maybeSingle();
  if (error) {
    console.error("review", error);
    return { error: "Couldn't save the decision. Please try again." };
  }
  if (!data) return { error: "This application has already been decided." };

  // Email the applicant. Their address lives in auth.users, so this needs the service role
  // (safe: requireAdmin passed above and the id comes from the row we just updated).
  const [{ data: prof }, { data: auth }] = await Promise.all([
    db.from("profiles").select("full_name").eq("id", data.user_id).maybeSingle(),
    createAdminClient().auth.admin.getUserById(data.user_id),
  ]);
  if (auth.user?.email) {
    await sendApplicationDecision(
      auth.user.email,
      prof?.full_name || "there",
      decision,
      note,
    );
  }

  redirect(`/admin/applications?decided=${decision}`);
}
