import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Flash } from "@/components/admin/flash";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate, formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { deleteMessage, setMessageStatus } from "../actions";

export const metadata: Metadata = { title: "Message | Admin", robots: { index: false } };

export default async function MessagePage({ params, searchParams }: PageProps<"/admin/messages/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = await createClient();
  const { data: m } = await db.from("contact_messages").select("*").eq("id", id).maybeSingle();
  if (!m) notFound();
  const subject = encodeURIComponent(`Re: ${m.subject || "Your message to YPF"}`);
  return (
    <>
      <PageHeader title={m.subject || "No subject"} back={{ href: "/admin/messages", label: "All messages" }} />
      <Flash code={sp.saved} />
      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-ink font-semibold">{m.name}</p>
              <a className="text-brand-700 text-sm underline" href={`mailto:${m.email}`}>{m.email}</a>
              <p className="text-ink-muted text-xs">{formatDate(m.created_at)} at {formatTime(m.created_at)}</p>
            </div>
            <StatusBadge value={m.status} />
          </div>
          <p className="text-ink border-line border-t pt-4 text-sm leading-7 whitespace-pre-wrap break-words">{m.message}</p>
        </CardBody>
      </Card>
      <div className="flex flex-wrap gap-3">
        <a href={`mailto:${m.email}?subject=${subject}`} className={buttonStyles({ size: "md" })}><Mail className="size-4" aria-hidden /> Reply by email</a>
        <form action={setMessageStatus} className="flex flex-wrap gap-3">
          <input type="hidden" name="id" value={id} />
          {m.status !== "read" ? <Button type="submit" name="status" value="read" variant="secondary">Mark as read</Button> : null}
          {m.status !== "replied" ? <Button type="submit" name="status" value="replied" variant="secondary">Mark as replied</Button> : null}
          {m.status !== "new" ? <Button type="submit" name="status" value="new" variant="ghost">Mark as new</Button> : null}
        </form>
        <ConfirmForm action={deleteMessage} fields={{ id }} size="md" trigger="Delete" title="Delete this message?" description="This can't be undone." confirmLabel="Delete" />
      </div>
      <p className="text-ink-muted text-xs">Replies are sent from your own email app; the site doesn&apos;t send them. Mark the message as replied when done.</p>
    </>
  );
}
