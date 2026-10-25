"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { finalizeApplication } from "@/lib/membership";
import { rateLimit, TOO_MANY } from "@/lib/rate-limit";
import { accountSchema, applicationSchema } from "@/lib/validation";

export type JoinState = {
  error?: string;
  /** Guest sign-ups must confirm their email before the application is filed. */
  verifyEmail?: string;
  fieldErrors?: Record<string, string>;
};

async function origin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}

export async function submitApplication(
  rawAnswers: unknown,
  rawAccount?: unknown,
): Promise<JoinState> {
  const answers = applicationSchema.safeParse(rawAnswers);
  if (!answers.success)
    return { error: "Some details are missing or invalid. Please check each step." };

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (user) {
    const result = await finalizeApplication(db, user, answers.data);
    if (result === "already_member") redirect("/dashboard");
    if (result === "invalid")
      return { error: "We couldn't submit your application. Please contact us." };
    redirect("/pending");
  }

  const account = accountSchema.safeParse(rawAccount);
  if (!account.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of account.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { fieldErrors };
  }

  if (!(await rateLimit("signup", 6, 3600))) return { error: TOO_MANY };
  const { data, error } = await db.auth.signUp({
    email: account.data.email,
    password: account.data.password,
    options: {
      // Held in the user's metadata until their email is confirmed, then filed by /join/complete.
      data: { full_name: answers.data.full_name, application: answers.data },
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent("/join/complete")}`,
    },
  });
  if (error) {
    if (error.code === "weak_password")
      return { fieldErrors: { password: "Choose a stronger password." } };
    if (error.status === 429)
      return { error: "Too many attempts. Please wait a few minutes and try again." };
    console.error("signUp", error);
    return { error: "We couldn't create your account. Please try again." };
  }

  // Email confirmation switched off in Supabase: the user is signed in immediately.
  if (data.session && data.user) {
    await finalizeApplication(db, data.user, answers.data);
    redirect("/pending");
  }
  // Same response whether or not the email already had an account.
  return { verifyEmail: account.data.email };
}
