import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { requireEditor } from "@/lib/auth/session";
import { toLagosInput } from "@/lib/admin/util";
import { createClient } from "@/lib/supabase/server";
import { deletePost, setPostStatus } from "../actions";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "Edit article | Admin", robots: { index: false } };

export default async function EditPost({ params }: PageProps<"/admin/news/[id]">) {
  await requireEditor();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = await createClient();
  const { data: p } = await db.from("posts").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  return (
    <>
      <PageHeader title={p.title} back={{ href: "/admin/news", label: "All articles" }} actions={p.status === "published" ? <ButtonLink href={`/news/${p.slug}`} size="sm" variant="ghost">View on site</ButtonLink> : null} />
      <PostForm
        initial={{
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt ?? "",
          body: p.body,
          category: p.category,
          cover_image: p.cover_image ?? "",
          published_at: toLagosInput(p.published_at),
          status: p.status,
        }}
      />
      <section aria-labelledby="danger" className="border-line space-y-3 border-t pt-6">
        <h2 id="danger" className="text-h3 text-ink">Visibility and removal</h2>
        <div className="flex flex-wrap gap-3">
          {p.status === "published" ? (
            <ConfirmForm action={setPostStatus} fields={{ id, status: "draft" }} trigger="Unpublish" title="Unpublish this article?" description="It will disappear from the public site until you publish it again." confirmLabel="Unpublish" variant="primary" />
          ) : null}
          {p.status !== "archived" ? (
            <ConfirmForm action={setPostStatus} fields={{ id, status: "archived" }} trigger="Archive" title="Archive this article?" description="Archived articles are hidden from the public site but kept here." confirmLabel="Archive" variant="primary" />
          ) : (
            <form action={setPostStatus}>
              <input type="hidden" name="id" value={id} />
              <Button type="submit" name="status" value="draft" size="sm" variant="secondary">Restore to drafts</Button>
            </form>
          )}
          <ConfirmForm action={deletePost} fields={{ id }} trigger="Delete article" title="Delete this article permanently?" description="This can't be undone. Archive it instead to keep the text." confirmLabel="Delete permanently" />
        </div>
      </section>
    </>
  );
}
