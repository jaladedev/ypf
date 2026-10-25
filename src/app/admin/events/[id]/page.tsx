import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { requireEditor } from "@/lib/auth/session";
import { toLagosInput } from "@/lib/admin/util";
import { createClient } from "@/lib/supabase/server";
import { deleteEvent, setEventStatus } from "../actions";
import { EventForm } from "../event-form";

export const metadata: Metadata = { title: "Edit event | Admin", robots: { index: false } };

export default async function EditEvent({ params }: PageProps<"/admin/events/[id]">) {
  await requireEditor();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = await createClient();
  const { data: e } = await db.from("events").select("*").eq("id", id).maybeSingle();
  if (!e) notFound();
  const [{ data: speakers }, { count }] = await Promise.all([
    db.from("event_speakers").select("name,title,photo_url").eq("event_id", id).order("sort_order"),
    db.from("event_registrations").select("id", { count: "exact", head: true }).eq("event_id", id),
  ]);

  return (
    <>
      <PageHeader
        title={e.title}
        back={{ href: "/admin/events", label: "All events" }}
        actions={
          <>
            {e.status === "published" ? <ButtonLink href={`/events/${e.slug}`} size="sm" variant="ghost">View on site</ButtonLink> : null}
            <ButtonLink href={`/admin/events/${id}/registrations`} size="sm" variant="secondary">Registrations ({count ?? 0})</ButtonLink>
          </>
        }
      />
      <EventForm
        initial={{
          id: e.id,
          title: e.title,
          slug: e.slug,
          summary: e.summary ?? "",
          body: e.body ?? "",
          starts_at: toLagosInput(e.starts_at),
          ends_at: toLagosInput(e.ends_at),
          venue: e.venue ?? "",
          city: e.city ?? "",
          cover_image: e.cover_image ?? "",
          registration_deadline: toLagosInput(e.registration_deadline),
          capacity: e.capacity ? String(e.capacity) : "",
          features: e.features.join("\n"),
          status: e.status,
          speakers: (speakers ?? []).map((s) => ({ name: s.name, title: s.title ?? "", photo: s.photo_url ?? "" })),
        }}
      />
      <section aria-labelledby="danger" className="border-line space-y-3 border-t pt-6">
        <h2 id="danger" className="text-h3 text-ink">Visibility and removal</h2>
        <div className="flex flex-wrap gap-3">
          {e.status === "published" ? (
            <ConfirmForm action={setEventStatus} fields={{ id, status: "draft" }} trigger="Unpublish" title="Unpublish this event?" description="It will disappear from the public site until you publish it again." confirmLabel="Unpublish" variant="primary" />
          ) : null}
          {e.status !== "archived" ? (
            <ConfirmForm action={setEventStatus} fields={{ id, status: "archived" }} trigger="Archive" title="Archive this event?" description="Archived events are hidden from the public site but kept here, with their registrations." confirmLabel="Archive" variant="primary" />
          ) : (
            <form action={setEventStatus}>
              <input type="hidden" name="id" value={id} />
              <Button type="submit" name="status" value="draft" size="sm" variant="secondary">Restore to drafts</Button>
            </form>
          )}
          <ConfirmForm
            action={deleteEvent}
            fields={{ id }}
            trigger="Delete event"
            title="Delete this event permanently?"
            description={<>This also deletes its speakers and <strong>{count ?? 0} registration{count === 1 ? "" : "s"}</strong>. It can&apos;t be undone. Archive it instead to keep the records.</>}
            confirmLabel="Delete permanently"
          />
        </div>
        <p className="text-ink-muted text-sm">
          Need the attendee list? <Link className="text-brand-700 underline" href={`/admin/events/${id}/registrations`}>Open registrations</Link>.
        </p>
      </section>
    </>
  );
}
