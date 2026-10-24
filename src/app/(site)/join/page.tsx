import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signInWithGoogle } from "@/app/login/actions";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { JoinForm } from "./join-form";

export const metadata: Metadata = {
  title: "Join YPF",
  description: "Apply to become a member of the Young Planners Forum.",
};

export default async function JoinPage() {
  const session = await getSession();
  if (session.user) {
    if (session.profile?.membership_status === "approved") redirect("/dashboard");
    const db = await createClient();
    const { data: open } = await db
      .from("membership_applications")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("status", "pending")
      .maybeSingle();
    if (open || session.profile?.membership_status === "suspended") redirect("/pending");
  }

  return (
    <>
      <PageHero
        title="Join the Young Planners Forum"
        subtitle="Membership is open to any young planner. Tell us about yourself and an admin will review your application."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Join" }]}
      />
      <Section tone="surface">
        <div className="mx-auto max-w-2xl space-y-6">
          {session.user ? (
            <p className="text-ink-muted text-sm">
              Applying as <strong className="text-ink">{session.user.email}</strong>.
            </p>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-ink-muted text-sm">
                Already have an account?{" "}
                <Link
                  href="/login?next=/join"
                  className="text-brand-700 font-medium underline"
                >
                  Sign in
                </Link>
              </p>
              <form action={signInWithGoogle}>
                <input type="hidden" name="next" value="/join" />
                <Button type="submit" variant="secondary" size="sm">
                  Sign up with Google instead
                </Button>
              </form>
            </div>
          )}
          <JoinForm
            signedIn={Boolean(session.user)}
            defaultName={session.profile?.full_name || undefined}
          />
        </div>
      </Section>
    </>
  );
}
