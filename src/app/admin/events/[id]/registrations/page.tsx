import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { ExportLinks } from "@/components/admin/export-links";
import { Flash } from "@/components/admin/flash";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { requireEditor } from "@/lib/auth/session";
import { formatDate, formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { removeRegistration } from "../../actions";

export const metadata: Metadata = { title: "Registrations | Admin", robots: { index: false } };
const PER_PAGE = 50;

export default async function Registrations({ params, searchParams }: PageProps<"/admin/events/[id]/registrations">) {
  await requireEditor();
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);
  const db = await createClient();
  const { data: ev } = await db.from("events").select("title,capacity").eq("id", id).maybeSingle();
  if (!ev) notFound();
  const [{ data, count }, { count: active }] = await Promise.all([
    db.from("event_registrations").select("id,name,email,status,user_id,created_at", { count: "exact" }).eq("event_id", id).order("created_at", { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1),
    db.from("event_registrations").select("id", { count: "exact", head: true }).eq("event_id", id).eq("status", "registered"),
  ]);

  return (
    <>
      <PageHeader
        title="Registrations"
        description={`${ev.title}: ${active ?? 0} registered${ev.capacity ? ` of ${ev.capacity} places` : ""}.`}
        back={{ href: `/admin/events/${id}`, label: "Back to event" }}
        actions={count ? <ExportLinks base={`/admin/export/registrations?event=${id}`} /> : null}
      />
      <Flash code={sp.saved} />
      {data?.length ? (
        <div className="rounded-card border-line shadow-card overflow-x-auto border bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">People registered for {ev.title}</caption>
            <thead className="bg-surface text-ink-muted text-xs uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                <th scope="col" className="px-4 py-3 font-semibold">Email</th>
                <th scope="col" className="px-4 py-3 font-semibold">Registered</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {data.map((r) => (
                <tr key={r.id}>
                  <th scope="row" className="text-ink px-4 py-3 font-medium">
                    {r.name}
                    {r.user_id ? <span className="text-ink-muted ml-2 text-xs font-normal">member</span> : null}
                  </th>
                  <td className="px-4 py-3"><a className="text-brand-700 underline" href={`mailto:${r.email}`}>{r.email}</a></td>
                  <td className="text-ink-muted px-4 py-3">{formatDate(r.created_at)} {formatTime(r.created_at)}</td>
                  <td className="px-4 py-3"><StatusBadge value={r.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmForm action={removeRegistration} fields={{ id: r.id, event_id: id }} trigger={<>Remove<span className="sr-only"> {r.name}</span></>} triggerVariant="ghost" title="Remove this registration?" description={<>{r.name} ({r.email}) will be removed from the list and can register again.</>} confirmLabel="Remove" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No registrations yet" description="They appear here as people sign up on the event page." />
      )}
      <Pagination page={page} totalPages={Math.ceil((count ?? 0) / PER_PAGE)} hrefFor={(p) => `/admin/events/${id}/registrations?page=${p}`} />
    </>
  );
}
