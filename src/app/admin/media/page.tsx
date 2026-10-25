import type { Metadata } from "next";
import { Flash } from "@/components/admin/flash";
import { PageHeader } from "@/components/admin/page-header";
import { FormAlert } from "@/components/ui/form-alert";
import { requireEditor } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MediaLibrary, type MediaItem } from "./library";

export const metadata: Metadata = { title: "Pages & Media | Admin", robots: { index: false } };

export default async function MediaPage({ searchParams }: PageProps<"/admin/media">) {
  await requireEditor();
  const sp = await searchParams;
  const db = await createClient();
  const { data, error } = await db.storage.from("media").list("uploads", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
  const items: MediaItem[] = (data ?? [])
    .filter((o) => o.name && o.id)
    .map((o) => ({
      name: o.name,
      url: db.storage.from("media").getPublicUrl(`uploads/${o.name}`).data.publicUrl,
      size: Number((o.metadata as { size?: number } | null)?.size ?? 0),
    }));
  return (
    <>
      <PageHeader title="Pages & Media" description="The image library used for events, news, leaders and partner logos. Upload here, or directly inside any form." />
      <Flash code={sp.saved} />
      {sp.saved === "failed" ? <FormAlert error="That image couldn't be deleted." /> : null}
      {error ? <FormAlert error="The image library couldn't be loaded. Try again shortly." /> : null}
      <MediaLibrary items={items} />
      <section className="border-line space-y-1 border-t pt-6 text-sm">
        <h2 className="text-h3 text-ink">Page text</h2>
        <p className="text-ink-muted max-w-2xl">
          The About, Privacy Policy and Terms pages are written into the site itself for now, so changing their wording is a code change. Everything else (events, jobs, news, leaders, contact details, partners) is editable from this admin.
        </p>
      </section>
    </>
  );
}
