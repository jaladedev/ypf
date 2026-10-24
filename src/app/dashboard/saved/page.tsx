import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { JobRow } from "@/components/domain/job-row";
import { requireApprovedMember } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Saved jobs", robots: { index: false } };

export default async function SavedJobsPage() {
  await requireApprovedMember("/dashboard/saved");
  const db = await createClient();
  const { data: saved } = await db
    .from("saved_jobs")
    .select("job_id")
    .order("created_at", { ascending: false });
  const ids = (saved ?? []).map((s) => s.job_id);
  const { data: jobs } = ids.length
    ? await db
        .from("jobs")
        .select("id,slug,title,organisation,location,job_type,deadline")
        .in("id", ids)
    : { data: [] };
  const order = new Map(ids.map((id, i) => [id, i]));
  const sorted = (jobs ?? []).sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-h1 text-ink">Saved jobs</h1>
      {sorted.length ? (
        <ul className="rounded-card border-line shadow-card overflow-hidden border bg-white">
          {sorted.map((j) => (
            <JobRow key={j.id} job={j} as="h2" />
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No saved jobs"
          description="Use “Save job” on any job to keep it here."
          action={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}
        />
      )}
    </div>
  );
}
