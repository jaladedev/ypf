import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate, formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Audit log | Admin", robots: { index: false } };
const PER_PAGE = 50;

export default async function AuditPage({ searchParams }: PageProps<"/admin/audit">) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);
  const db = await createClient();
  const { data, count, error } = await db.from("audit_log").select("id,actor_id,action,summary,created_at", { count: "exact" }).order("created_at", { ascending: false }).order("id", { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  if (error) throw new Error(error.message);
  const actorIds = [...new Set((data ?? []).map((a) => a.actor_id).filter((x): x is string => !!x))];
  const { data: actors } = actorIds.length ? await db.from("profiles").select("id,full_name").in("id", actorIds) : { data: [] };
  const names = new Map((actors ?? []).map((a) => [a.id, a.full_name || "Unnamed"]));
  return (
    <>
      <PageHeader title="Audit log" description="Role and status changes, deletions, exports and settings edits, with who did them. Entries can't be edited or removed." />
      {data?.length ? (
        <div className="rounded-card border-line shadow-card overflow-x-auto border bg-white">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <caption className="sr-only">Audit log, newest first</caption>
            <thead className="bg-surface text-ink-muted text-xs uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">When</th>
                <th scope="col" className="px-4 py-3 font-semibold">Who</th>
                <th scope="col" className="px-4 py-3 font-semibold">What</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {data.map((a) => (
                <tr key={a.id}>
                  <td className="text-ink-muted px-4 py-3 whitespace-nowrap">{formatDate(a.created_at)} {formatTime(a.created_at)}</td>
                  <td className="text-ink px-4 py-3">{a.actor_id ? (names.get(a.actor_id) ?? "Unknown") : "System"}</td>
                  <td className="text-ink px-4 py-3">{a.summary}<span className="text-ink-muted ml-2 font-mono text-xs">{a.action}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Nothing recorded yet" />
      )}
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PER_PAGE)} hrefFor={(p) => `/admin/audit?page=${p}`} />
    </>
  );
}
