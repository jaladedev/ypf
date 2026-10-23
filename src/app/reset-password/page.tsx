import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/simple-forms";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Choose a new password | Young Planners Forum",
};

export default async function ResetPasswordPage() {
  // The recovery link signs the user in via /auth/callback first.
  const { user } = await getSession();
  if (!user) redirect("/login?error=link");

  return (
    <AuthCard title="Choose a new password">
      <ResetPasswordForm />
    </AuthCard>
  );
}
