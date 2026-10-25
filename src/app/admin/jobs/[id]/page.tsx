import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Flash } from "@/components/admin/flash";
import { PageHeader } from "@/components/admin/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { requireEditor } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { deleteJob, duplicateJob, setJobStatus } from "../actions";
import { JobForm } from "../job-form";

export const metadata: Metadata = { title: "Edit job | Admin", robots: { index: false } };

export default async function EditJob({ params, searchParams }: PageProps<"/admin/jobs/[id]">) {
  await requireEditor();
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = await createClient();
  const { data: j } = await db.from("jobs").select("*").eq("id", id).maybeSingle();
  if (!j) notFound();
  return (
    <>
      <PageHeader
        title={j.title}
        back={{ href: "/admin/jobs", label: "All jobs" }}
        actions={
          <>
            {j.status === "published" ? <ButtonLink href={`/jobs/${j.slug}`} size="sm" variant="ghost">View on site</ButtonLink> : null}
            <form action={duplicateJob}>
              <input type="hidden" name="id" value={id} />
              <Button type="submit" size="sm" variant="secondary">Duplicate</Button>
            </form>
          </>
        }
      />
      <Flash code={sp.saved} />
      <JobForm
        initial={{
          id: j.id,
          title: j.title,
          slug: j.slug,
          organisation: j.organisation,
          description: j.description,
          requirements: j.requirements.join("\n"),
          location: j.location ?? "",
          job_type: j.job_type,
          experience_level: j.experience_level ?? "",
          specialisation: j.specialisation ?? "",
          apply_url: j.apply_url ?? "",
          apply_email: j.apply_email ?? "",
          deadline: j.deadline ?? "",
          status: j.status,
        }}
      />
      <section aria-labelledby="danger" className="border-line space-y-3 border-t pt-6">
        <h2 id="danger" className="text-h3 text-ink">Visibility and removal</h2>
        <div className="flex flex-wrap gap-3">
          {j.status === "published" ? (
            <ConfirmForm action={setJobStatus} fields={{ id, status: "draft" }} trigger="Unpublish" title="Unpublish this job?" description="It will disappear from the public site until you publish it again." confirmLabel="Unpublish" variant="primary" />
          ) : null}
          {j.status !== "archived" ? (
            <ConfirmForm action={setJobStatus} fields={{ id, status: "archived" }} trigger="Archive" title="Archive this job?" description="Archived jobs are hidden from the public site but kept here." confirmLabel="Archive" variant="primary" />
          ) : (
            <form action={setJobStatus}>
              <input type="hidden" name="id" value={id} />
              <Button type="submit" name="status" value="draft" size="sm" variant="secondary">Restore to drafts</Button>
            </form>
          )}
          <ConfirmForm action={deleteJob} fields={{ id }} trigger="Delete job" title="Delete this job permanently?" description="Members who saved it will lose it from their saved list. This can't be undone. Archive it instead to keep the record." confirmLabel="Delete permanently" />
        </div>
      </section>
    </>
  );
}
