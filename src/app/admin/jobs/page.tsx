import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Flash } from "@/components/admin/flash";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { LinkTabs } from "@/components/ui/tabs";
import { requireEditor } from "@/lib/auth/session";
import { daysUntil, formatDate, jobTypeLabels } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { PublishStatus } from "@/types/database";

export const metadata: Metadata = { title: "Jobs | Admin", robots: { index: false } };
const PER_PAGE = 20;
const tabs = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "archived", label: "Archived" },
] as const;

export default async function AdminJobs({ searchParams }: PageProps<"/admin/jobs">) {
  await requireEditor();
  const sp = await searchParams;
  const tab = tabs.find((t) => t.key === sp.status)?.key ?? "all";
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);
  const db = await createClient();
  let q = db.from("jobs").select("id,title,organisation,job_type,deadline,status", { count: "exact" });
  if (tab !== "all") q = q.eq("status", tab as PublishStatus);
  const { data, count, error } = await q.order("created_at", { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  if (error) throw new Error(error.message);

  return (
    <>
      <PageHeader title="Jobs" description="Post opportunities. Applicants apply through the link or email you add." actions={<ButtonLink href="/admin/jobs/new"><Plus className="size-4" aria-hidden /> New job</ButtonLink>} />
      <Flash code={sp.saved} />
      <LinkTabs label="Job status" items={tabs.map((t) => ({ href: `/admin/jobs?status=${t.key}`, label: t.label, active: tab === t.key }))} />
      {data?.length ? (
        <ul className="rounded-card border-line shadow-card divide-line divide-y overflow-hidden border bg-white">
          {data.map((j) => {
            const expired = j.deadline ? daysUntil(j.deadline) < 0 : false;
            return (
              <li key={j.id} className="hover:bg-brand-50/50 relative flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-4">
                <div className="min-w-0 flex-1 basis-60">
                  <p className="text-ink font-semibold">
                    <Link href={`/admin/jobs/${j.id}`} className="after:absolute after:inset-0 after:content-['']">{j.title}</Link>
                  </p>
                  <p className="text-ink-muted text-sm">{j.organisation} · {jobTypeLabels[j.job_type]}{j.deadline ? ` · closes ${formatDate(j.deadline)}` : ""}</p>
                </div>
                {expired && j.status === "published" ? <Badge tone="danger">Closed (hidden)</Badge> : null}
                <StatusBadge value={j.status} />
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No jobs here yet" action={<ButtonLink href="/admin/jobs/new" size="sm">New job</ButtonLink>} />
      )}
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PER_PAGE)} hrefFor={(p) => `/admin/jobs?status=${tab}&page=${p}`} />
    </>
  );
}
