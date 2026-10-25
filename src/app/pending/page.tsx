import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Membership status | Young Planners Forum", robots: { index: false } };

export default async function PendingPage() {
  const { user, profile } = await requireUser("/pending");
  const status = profile?.membership_status ?? "pending";
  if (status === "approved") redirect("/dashboard");

  const db = await createClient();
  const { data: latest } = await db
    .from("membership_applications")
    .select("status,review_note,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Signed up (e.g. with Google) but never applied.
  if (status === "pending" && !latest) redirect("/join");

  const rejected = status === "rejected";
  const suspended = status === "suspended";
  const title = suspended
    ? "Your membership is suspended"
    : rejected
      ? "Your application wasn't approved"
      : "Your application is under review";
  const body = suspended
    ? "Please contact the YPF team if you'd like to find out more."
    : rejected
      ? "You can update your details and apply again, or contact us if you think this is a mistake."
      : `Thanks for applying${latest ? ` on ${formatDate(latest.created_at)}` : ""}. An admin will review your details and you'll get an email as soon as there's a decision.`;

  return (
    <AuthCard title={title} description={body}>
      {rejected && latest?.review_note ? (
        <p className="bg-surface border-line rounded-control border p-3 text-sm">
          <span className="text-ink-muted block text-xs">Note from the reviewer</span>
          {latest.review_note}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {rejected ? <ButtonLink href="/join">Apply again</ButtonLink> : null}
        <ButtonLink href="/contact" variant="secondary">
          Contact us
        </ButtonLink>
        <SignOutButton />
      </div>
    </AuthCard>
  );
}
