import type { Metadata } from "next";
import Link from "next/link";
import { requireEditor } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin | Young Planners Forum",
  robots: { index: false },
};

// Placeholder: the full dashboard is built in Phase 5.
export default async function AdminPage() {
  const { role } = await requireEditor();
  let pending = 0;
  if (role === "admin") {
    const db = await createClient();
    const { count } = await db
      .from("membership_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    pending = count ?? 0;
  }
  return (
    <div className="space-y-4">
      <h1 className="text-h1 text-ink">Admin</h1>
      <p className="text-ink-muted">
        Signed in as <strong>{role}</strong>. The full dashboard arrives in Phase 5.
      </p>
      {role === "admin" ? (
        <p>
          <Link
            href="/admin/applications"
            className="text-brand-700 font-medium underline"
          >
            Membership applications{pending ? ` (${pending} waiting)` : ""}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
