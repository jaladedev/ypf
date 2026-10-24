import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { finalizeApplication } from "@/lib/membership";

export const metadata = { robots: { index: false } };

/**
 * Landing page of the sign-up confirmation email. Files the application the
 * person filled in before confirming their email, then shows the holding page.
 */
export default async function CompletePage() {
  const { user } = await requireUser("/join/complete");
  const stored = (user.user_metadata as Record<string, unknown> | undefined)?.application;
  if (!stored) redirect("/join");

  const db = await createClient();
  const result = await finalizeApplication(db, user, stored);
  if (result === "already_member") redirect("/dashboard");
  if (result === "invalid") redirect("/join");
  redirect("/pending");
}
