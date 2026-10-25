import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Flash } from "@/components/admin/flash";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { LinkTabs } from "@/components/ui/tabs";
import { requireEditor } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { PublishStatus } from "@/types/database";

export const metadata: Metadata = { title: "Events | Admin", robots: { index: false } };
const PER_PAGE = 20;
const tabs = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "archived", label: "Archived" },
] as const;

export default async function AdminEvents({ searchParams }: PageProps<"/admin/events">) {
  await requireEditor();
  const sp = await searchParams;
  const tab = tabs.find((t) => t.key === sp.status)?.key ?? "all";
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);

  const db = await createClient();
  let q = db.from("events").select("id,title,slug,starts_at,city,status", { count: "exact" });
  if (tab !== "all") q = q.eq("status", tab as PublishStatus);
  const { data, count, error } = await q.order("starts_at", { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  if (error) throw new Error(error.message);

  const ids = (data ?? []).map((e) => e.id);
  const { data: regs } = ids.length ? await db.from("event_registrations").select("event_id").in("event_id", ids).eq("status", "registered").limit(10000) : { data: [] };
  const counts = new Map<string, number>();
  for (const r of regs ?? []) counts.set(r.event_id, (counts.get(r.event_id) ?? 0) + 1);

  const href = (p: number) => `/admin/events?status=${tab}&page=${p}`;
  return (
    <>
      <PageHeader title="Events" description="Create, publish and archive events, and see who registered." actions={<ButtonLink href="/admin/events/new"><Plus className="size-4" aria-hidden /> New event</ButtonLink>} />
      <Flash code={sp.saved} />
      <LinkTabs label="Event status" items={tabs.map((t) => ({ href: `/admin/events?status=${t.key}`, label: t.label, active: tab === t.key }))} />
      {data?.length ? (
        <ul className="rounded-card border-line shadow-card divide-line divide-y overflow-hidden border bg-white">
          {data.map((e) => (
            <li key={e.id} className="hover:bg-brand-50/50 relative flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-4">
              <div className="min-w-0 flex-1 basis-60">
                <p className="text-ink font-semibold">
                  <Link href={`/admin/events/${e.id}`} className="after:absolute after:inset-0 after:content-['']">{e.title}</Link>
                </p>
                <p className="text-ink-muted text-sm">
                  {formatDate(e.starts_at)}{e.city ? ` · ${e.city}` : ""}
                </p>
              </div>
              <span className="text-ink-muted text-sm">{counts.get(e.id) ?? 0} registered</span>
              <StatusBadge value={e.status} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No events here yet" description="Create an event to see it listed." action={<ButtonLink href="/admin/events/new" size="sm">New event</ButtonLink>} />
      )}
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PER_PAGE)} hrefFor={href} />
    </>
  );
}
