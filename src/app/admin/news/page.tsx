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
import { formatDate, postCategoryLabels } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { PublishStatus } from "@/types/database";

export const metadata: Metadata = { title: "News | Admin", robots: { index: false } };
const PER_PAGE = 20;
const tabs = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "archived", label: "Archived" },
] as const;

const isFuture = (iso: string) => new Date(iso).getTime() > Date.now();

export default async function AdminNews({ searchParams }: PageProps<"/admin/news">) {
  await requireEditor();
  const sp = await searchParams;
  const tab = tabs.find((t) => t.key === sp.status)?.key ?? "all";
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);
  const db = await createClient();
  let q = db.from("posts").select("id,title,category,published_at,status,updated_at", { count: "exact" });
  if (tab !== "all") q = q.eq("status", tab as PublishStatus);
  const { data, count, error } = await q.order("updated_at", { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  if (error) throw new Error(error.message);
  return (
    <>
      <PageHeader title="News" description="Write and publish articles and announcements." actions={<ButtonLink href="/admin/news/new"><Plus className="size-4" aria-hidden /> New article</ButtonLink>} />
      <Flash code={sp.saved} />
      <LinkTabs label="Article status" items={tabs.map((t) => ({ href: `/admin/news?status=${t.key}`, label: t.label, active: tab === t.key }))} />
      {data?.length ? (
        <ul className="rounded-card border-line shadow-card divide-line divide-y overflow-hidden border bg-white">
          {data.map((p) => (
            <li key={p.id} className="hover:bg-brand-50/50 relative flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-4">
              <div className="min-w-0 flex-1 basis-60">
                <p className="text-ink font-semibold">
                  <Link href={`/admin/news/${p.id}`} className="after:absolute after:inset-0 after:content-['']">{p.title}</Link>
                </p>
                <p className="text-ink-muted text-sm">{postCategoryLabels[p.category]}{p.published_at ? ` · ${formatDate(p.published_at)}` : ""}</p>
              </div>
              {p.status === "published" && p.published_at && isFuture(p.published_at) ? <Badge tone="info">Scheduled</Badge> : null}
              <StatusBadge value={p.status} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No articles here yet" action={<ButtonLink href="/admin/news/new" size="sm">New article</ButtonLink>} />
      )}
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PER_PAGE)} hrefFor={(p) => `/admin/news?status=${tab}&page=${p}`} />
    </>
  );
}
