import Link from "next/link";
import { Briefcase, ChevronRight } from "lucide-react";
import { daysUntil, formatDate, jobTypeLabels } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { JobRow as JobData } from "@/types/database";

export type JobSummary = Pick<
  JobData,
  "slug" | "title" | "organisation" | "location" | "job_type" | "deadline"
>;

/** Deadline text plus an urgency badge when it closes within a week. */
export function DeadlineLabel({ deadline }: { deadline: string | null }) {
  if (!deadline) return <span className="text-ink-muted text-sm">Open until filled</span>;
  const days = daysUntil(deadline);
  if (days < 0) return <Badge tone="danger">Closed</Badge>;
  return (
    <span className="flex flex-wrap items-center justify-end gap-2 text-sm">
      {days <= 7 ? (
        <Badge tone="warning">
          {days === 0 ? "Closes today" : `${days} day${days === 1 ? "" : "s"} left`}
        </Badge>
      ) : null}
      <span className="text-danger-700 font-medium">{formatDate(deadline)}</span>
    </span>
  );
}

/** One line in the jobs list. The whole row is a single link to the job. */
export function JobRow({
  job,
  as: Heading = "h3",
}: {
  job: JobSummary;
  /** Use "h2" on pages where the list sits directly under the page title. */
  as?: "h2" | "h3";
}) {
  return (
    <li className="border-line hover:bg-brand-50/50 relative flex items-center gap-4 border-b px-4 py-4 transition-colors last:border-b-0 sm:px-5">
      <span className="bg-brand-50 text-brand-700 grid size-11 shrink-0 place-items-center rounded-full">
        <Briefcase className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <Heading className="text-ink line-clamp-2 text-base font-semibold">
          <Link
            href={`/jobs/${job.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {job.title}
          </Link>
        </Heading>
        <p className="text-ink-muted mt-0.5 truncate text-sm">
          {job.organisation}
          {job.location ? ` · ${job.location}` : ""} · {jobTypeLabels[job.job_type]}
        </p>
      </div>
      <div className="hidden shrink-0 sm:block">
        <DeadlineLabel deadline={job.deadline} />
      </div>
      <ChevronRight className="text-ink-muted size-5 shrink-0" aria-hidden />
    </li>
  );
}
