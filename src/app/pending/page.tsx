import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Membership status | Young Planners Forum" };

const copy = {
  pending: {
    title: "Your membership is awaiting approval",
    body: "Thanks for signing up. An admin will review your details shortly and you'll get an email once you're approved.",
  },
  rejected: {
    title: "Your application wasn't approved",
    body: "If you think this is a mistake, please contact us and we'll take another look.",
  },
  suspended: {
    title: "Your membership is suspended",
    body: "Please contact the YPF team if you'd like to find out more.",
  },
} as const;

export default async function PendingPage() {
  const { profile } = await requireUser("/pending");
  const status = profile?.membership_status ?? "pending";
  if (status === "approved") redirect("/dashboard");

  const { title, body } = copy[status];
  return (
    <AuthCard title={title} description={body}>
      <SignOutButton />
    </AuthCard>
  );
}
