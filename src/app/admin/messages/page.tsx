import type { Metadata } from "next";
import Link from "next/link";
import { ExportLinks } from "@/components/admin/export-links";
import { Flash } from "@/components/admin/flash";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { LinkTabs } from "@/components/ui/tabs";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate, formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { MessageStatus } from "@/types/database";

export const metadata: Metadata = { title: "Messages | Admin", robots: { index: false } };
const PER_PAGE = 25;
const tabs = [
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "replied", label: "Replied" },
  { key: "all", label: "All" },
] as const;

export default async function AdminMessages({ searchParams }: PageProps<"/admin/messages">) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = tabs.find((t) => t.key === sp.status)?.key ?? "new";
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);
  const db = await createClient();
  let q = db.from("contact_messages").select("id,name,email,subject,message,status,created_at", { count: "exact" });
  if (tab !== "all") q = q.eq("status", tab as MessageStatus);
  const { data, count, error } = await q.order("created_at", { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  if (error) throw new Error(error.message);
  return (
    <>
      <PageHeader title="Messages" description="Messages sent through the Contact form." actions={<ExportLinks base="/admin/export/messages" />} />
      <Flash code={sp.saved} />
      <LinkTabs label="Message status" items={tabs.map((t) => ({ href: `/admin/messages?status=${t.key}`, label: t.label, active: tab === t.key }))} />
      {data?.length ? (
        <ul className="rounded-card border-line shadow-card divide-line divide-y overflow-hidden border bg-white">
          {data.map((m) => (
            <li key={m.id} className="hover:bg-brand-50/50 relative flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-4">
              <div className="min-w-0 flex-1 basis-60">
                <p className={`text-ink ${m.status === "new" ? "font-bold" : "font-semibold"}`}>
                  <Link href={`/admin/messages/${m.id}`} className="after:absolute after:inset-0 after:content-['']">{m.name}</Link>
                  <span className="text-ink-muted ml-2 text-sm font-normal">{m.subject || "No subject"}</span>
                </p>
                <p className="text-ink-muted truncate text-sm">{m.message}</p>
              </div>
              <span className="text-ink-muted text-xs">{formatDate(m.created_at)} {formatTime(m.created_at)}</span>
              <StatusBadge value={m.status} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={tab === "new" ? "No new messages" : "No messages here"} />
      )}
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PER_PAGE)} hrefFor={(p) => `/admin/messages?status=${tab}&page=${p}`} />
    </>
  );
}
