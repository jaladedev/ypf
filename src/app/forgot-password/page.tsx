import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/simple-forms";

export const metadata: Metadata = { title: "Reset password | Young Planners Forum" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="We'll email you a link to choose a new one."
    >
      <ForgotPasswordForm />
      <Link
        href="/login"
        className="block text-center text-sm text-green-800 hover:underline"
      >
        Back to sign in
      </Link>
    </AuthCard>
  );
}
