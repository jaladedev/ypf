import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { requireEditor } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { deleteLeader } from "../actions";
import { LeaderForm } from "../leader-form";

export const metadata: Metadata = { title: "Edit leader | Admin", robots: { index: false } };

export default async function EditLeader({ params }: PageProps<"/admin/leadership/[id]">) {
  await requireEditor();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = await createClient();
  const { data: l } = await db.from("leaders").select("*").eq("id", id).maybeSingle();
  if (!l) notFound();
  return (
    <>
      <PageHeader title={l.name} back={{ href: "/admin/leadership", label: "Leadership" }} />
      <LeaderForm initial={{ id: l.id, name: l.name, role_title: l.role_title, group: l.group, photo_url: l.photo_url ?? "", bio: l.bio ?? "", is_active: l.is_active }} />
      <section className="border-line space-y-3 border-t pt-6">
        <h2 className="text-h3 text-ink">Remove</h2>
        <ConfirmForm action={deleteLeader} fields={{ id }} trigger="Delete leader" title={`Delete ${l.name}?`} description="They will be removed from the Leadership page. To keep their record, untick “Show on the Leadership page” instead." confirmLabel="Delete" />
      </section>
    </>
  );
}
