"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/redirect";
import { rateLimit, TOO_MANY } from "@/lib/rate-limit";

export type ActionState = { error?: string; message?: string };

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

async function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}

function callbackUrl(origin: string, next: string) {
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function signInWithPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  if (!email.success) return { error: email.error.issues[0].message };
  if (!password) return { error: "Enter your password." };

  if (!(await rateLimit("login", 20, 900))) return { error: TOO_MANY };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.data,
    password,
  });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Please confirm your email first. Check your inbox for the link." };
    }
    // Same message for wrong email and wrong password.
    return { error: "Incorrect email or password." };
  }

  redirect(safeNext(String(formData.get("next") ?? "")));
}

export async function signInWithMagicLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { error: email.error.issues[0].message };

  if (!(await rateLimit("email-link", 8, 3600))) return { error: TOO_MANY };
  const next = safeNext(String(formData.get("next") ?? ""));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: callbackUrl(await siteOrigin(), next) },
  });

  if (error) return { error: "We couldn't send the link. Please try again shortly." };
  return { message: "Check your email for a sign-in link." };
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeNext(String(formData.get("next") ?? ""));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(await siteOrigin(), next) },
  });

  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { error: email.error.issues[0].message };

  if (!(await rateLimit("email-link", 8, 3600))) return { error: TOO_MANY };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: callbackUrl(await siteOrigin(), "/reset-password"),
  });

  // Same response whether or not the account exists.
  return { message: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== confirm) return { error: "The two passwords don't match." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "This reset link has expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}
