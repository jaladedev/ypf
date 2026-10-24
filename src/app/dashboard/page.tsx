import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireApprovedMember } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Member dashboard | Young Planners Forum" };

// Placeholder: the real member dashboard is built in Phase 4. This page exists
// now so route protection (signed in + approved) can be exercised.
export default async function DashboardPage() {
  const { user, profile, role } = await requireApprovedMember("/dashboard");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-12">
      <h1 className="text-2xl font-semibold">
        Welcome back, {profile?.full_name || user.email}
      </h1>
      <p className="text-ink-muted">Member dashboard coming in Phase 4.</p>
      {role === "editor" || role === "admin" ? (
        <Link href="/admin" className="text-brand-700 underline">
          Go to admin
        </Link>
      ) : null}
      <SignOutButton />
    </main>
  );
}
