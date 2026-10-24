import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Briefcase, Building2, Check, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Section, SectionHeading } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { DeadlineLabel, JobRow } from "@/components/domain/job-row";
import { SaveJobButton } from "@/components/domain/save-job-button";
import { ShareButtons } from "@/components/domain/share-buttons";
import { getJobBySlug, getRelatedJobs } from "@/lib/data/jobs";
import { daysUntil, experienceLabels, jobTypeLabels } from "@/lib/format";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/jobs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const j = await getJobBySlug(slug);
  if (!j) return { title: "Job not found" };
  return {
    title: `${j.title} at ${j.organisation}`,
    description: j.description.slice(0, 160),
  };
}

export default async function JobPage({ params }: PageProps<"/jobs/[slug]">) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();
  const related = await getRelatedJobs(job);
  const closed = job.deadline ? daysUntil(job.deadline) < 0 : false;
  const applyHref =
    job.apply_url ??
    (job.apply_email
      ? `mailto:${job.apply_email}?subject=${encodeURIComponent(`Application: ${job.title}`)}`
      : null);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <>
      <PageHero
        title={job.title}
        subtitle={job.organisation}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Jobs", href: "/jobs" },
          { label: job.title },
        ]}
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-8">
            <div>
              <h2 className="text-h3 text-ink mb-3">About the role</h2>
              <Markdown>{job.description}</Markdown>
            </div>
            {job.requirements.length ? (
              <div>
                <h2 className="text-h3 text-ink mb-3">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm">
                      <Check
                        className="text-brand-700 mt-0.5 size-4 shrink-0"
                        aria-hidden
                      />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div>
              <h2 className="text-h3 text-ink mb-3">Share this job</h2>
              <ShareButtons
                url={`${base}/jobs/${job.slug}`}
                title={`${job.title} at ${job.organisation}`}
              />
            </div>
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardBody className="space-y-3 text-sm">
                <h2 className="text-h3 text-ink">Job summary</h2>
                <p className="flex gap-2">
                  <Building2
                    className="text-brand-700 mt-0.5 size-4 shrink-0"
                    aria-hidden
                  />
                  {job.organisation}
                </p>
                {job.location ? (
                  <p className="flex gap-2">
                    <MapPin
                      className="text-brand-700 mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />
                    {job.location}
                  </p>
                ) : null}
                <p className="flex gap-2">
                  <Briefcase
                    className="text-brand-700 mt-0.5 size-4 shrink-0"
                    aria-hidden
                  />
                  {jobTypeLabels[job.job_type]}
                  {job.experience_level
                    ? ` · ${experienceLabels[job.experience_level]}`
                    : ""}
                </p>
                {job.specialisation ? (
                  <p>
                    <Badge>{job.specialisation}</Badge>
                  </p>
                ) : null}
                <p className="flex items-center gap-2">
                  <Clock className="text-brand-700 size-4 shrink-0" aria-hidden />
                  <DeadlineLabel deadline={job.deadline} />
                </p>
                {closed ? (
                  <p className="text-ink-muted">
                    Applications for this role have closed.
                  </p>
                ) : applyHref ? (
                  <ButtonLink
                    href={applyHref}
                    className="w-full"
                    {...(job.apply_url
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    Apply now
                    {job.apply_url ? (
                      <span className="sr-only"> (opens in a new tab)</span>
                    ) : null}
                  </ButtonLink>
                ) : null}
                <SaveJobButton slug={job.slug} />
              </CardBody>
            </Card>
          </aside>
        </div>
      </Section>
      {related.length ? (
        <Section tone="surface">
          <SectionHeading title="Similar opportunities" href="/jobs" />
          <ul className="rounded-card border-line shadow-card overflow-hidden border bg-white">
            {related.map((j) => (
              <JobRow key={j.slug} job={j} />
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
