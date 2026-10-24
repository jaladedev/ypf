import type { Metadata } from "next";
import Link from "next/link";
import { FormAlert } from "@/components/ui/form-alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkTabs } from "@/components/ui/tabs";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { MembershipStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Applications | Admin",
  robots: { index: false },
};

const tabs: { key: MembershipStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default async function ApplicationsPage({
  searchParams,
}: PageProps<"/admin/applications">) {
  await requireAdmin();
  const sp = await searchParams;
  const raw = String(Array.isArray(sp.status) ? sp.status[0] : (sp.status ?? "pending"));
  const status = tabs.find((t) => t.key === raw)?.key ?? "pending";

  const db = await createClient();
  const { data: apps, error } = await db
    .from("membership_applications")
    .select("id,user_id,status,created_at,answers")
    .eq("status", status)
    .order("created_at", { ascending: status === "pending" })
    .limit(100);
  if (error) throw new Error(error.message);

  const ids = [...new Set(apps.map((a) => a.user_id))];
  const { data: profiles } = ids.length
    ? await db
        .from("profiles")
        .select("id,full_name,institution,career_stage")
        .in("id", ids)
    : { data: [] };
  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <h1 className="text-h1 text-ink">Membership applications</h1>
      {sp.decided === "approved" || sp.decided === "rejected" ? (
        <FormAlert
          message={
            sp.decided === "approved"
              ? "Approved. The member has been emailed."
              : "Rejected. The applicant has been emailed."
          }
        />
      ) : null}
      <LinkTabs
        label="Application status"
        items={tabs.map((t) => ({
          href: `/admin/applications?status=${t.key}`,
          label: t.label,
          active: status === t.key,
        }))}
      />
      {apps.length ? (
        <ul className="rounded-card border-line shadow-card divide-line divide-y overflow-hidden border bg-white">
          {apps.map((a) => {
            const p = byId.get(a.user_id);
            return (
              <li
                key={a.id}
                className="hover:bg-brand-50/50 relative flex items-center gap-4 px-4 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-ink font-semibold">
                    <Link
                      href={`/admin/applications/${a.id}`}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {p?.full_name || "Unnamed applicant"}
                    </Link>
                  </p>
                  <p className="text-ink-muted truncate text-sm">
                    {p?.institution ?? "No institution given"}
                  </p>
                </div>
                <span className="text-ink-muted hidden text-sm sm:block">
                  Applied {formatDate(a.created_at)}
                </span>
                <Badge
                  tone={
                    a.status === "approved"
                      ? "brand"
                      : a.status === "rejected"
                        ? "danger"
                        : "warning"
                  }
                >
                  {a.status}
                </Badge>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title={`No ${status} applications`} />
      )}
    </div>
  );
}
