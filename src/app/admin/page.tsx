import type { Metadata } from "next";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireEditor } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin | Young Planners Forum",
  robots: { index: false },
};

// Placeholder: the admin dashboard is built in Phase 5. Reaching this page
// requires an approved account with the editor or admin role.
export default async function AdminPage() {
  const { role } = await requireEditor();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-12">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-ink-muted">
        Signed in as <strong>{role}</strong>. Dashboard coming in Phase 5.
      </p>
      <SignOutButton />
    </main>
  );
}
