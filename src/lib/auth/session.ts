import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, ProfileRow } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export type Session =
  | { user: null; profile: null; role: null }
  | {
      user: User;
      profile: ProfileRow | null;
      /** Effective role: only set once the member is approved, else null. */
      role: AppRole | null;
    };

/**
 * The current user, their profile and effective role. Cached per request.
 * Uses getUser() (validated with Supabase) rather than trusting the cookie.
 */
export const getSession = cache(async (): Promise<Session> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null, role: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile && profile.membership_status === "approved" ? profile.role : null;
  return { user, profile, role };
});

/** Any signed-in user (approved or not). */
export async function requireUser(next?: string) {
  const session = await getSession();
  if (!session.user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return session as Extract<Session, { user: User }>;
}

/** Signed in AND approved by an admin. Others go to the holding page. */
export async function requireApprovedMember(next?: string) {
  const session = await requireUser(next);
  if (session.profile?.membership_status !== "approved") redirect("/pending");
  return session;
}

/** Editors and admins (content management). */
export async function requireEditor() {
  const session = await requireApprovedMember("/admin");
  if (session.role !== "editor" && session.role !== "admin") redirect("/dashboard");
  return session;
}

/** Admins only (members, roles, settings, messages). */
export async function requireAdmin() {
  const session = await requireApprovedMember("/admin");
  if (session.role !== "admin") redirect("/dashboard");
  return session;
}
