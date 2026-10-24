import type { Metadata } from "next";
import { Search } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/form-controls";
import { Pagination } from "@/components/ui/pagination";
import { JobRow } from "@/components/domain/job-row";
import { JOBS_PER_PAGE, getJobFilterOptions, getJobs } from "@/lib/data/jobs";
import { experienceLabels, jobTypeLabels } from "@/lib/format";
import type { ExperienceLevel, JobType } from "@/types/database";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Jobs & opportunities",
  description: "Jobs, internships and volunteer roles for young planners.",
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function JobsPage({ searchParams }: PageProps<"/jobs">) {
  const sp = await searchParams;
  const q = one(sp.q).slice(0, 100);
  const location = one(sp.location);
  const specialisation = one(sp.specialisation);
  const type = one(sp.type);
  const experience = one(sp.experience);
  const page = Math.max(1, Number.parseInt(one(sp.page), 10) || 1);

  const [{ items, total }, options] = await Promise.all([
    getJobs({
      q,
      location: location || undefined,
      specialisation: specialisation || undefined,
      type: type in jobTypeLabels ? (type as JobType) : undefined,
      experience:
        experience in experienceLabels ? (experience as ExperienceLevel) : undefined,
      page,
    }),
    getJobFilterOptions(),
  ]);
  const totalPages = Math.ceil(total / JOBS_PER_PAGE);
  const filtered = Boolean(q || location || specialisation || type || experience);

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({
      q,
      location,
      specialisation,
      type,
      experience,
    }))
      if (v) params.set(k, v);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/jobs?${s}` : "/jobs";
  };

  return (
    <>
      <PageHero
        title="Jobs & opportunities"
        subtitle="Find your next role in town planning and the built environment."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Jobs" }]}
      />
      <Section>
        <form
          action="/jobs"
          method="get"
          role="search"
          aria-label="Search jobs"
          className="rounded-card border-line bg-surface mb-8 grid gap-4 border p-4 sm:grid-cols-2 lg:grid-cols-6"
        >
          <div className="sm:col-span-2 lg:col-span-6">
            <Input
              label="Search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Job title, organisation or keyword"
            />
          </div>
          <Select label="Location" name="location" defaultValue={location}>
            <option value="">All locations</option>
            {options.locations.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </Select>
          <Select
            label="Specialisation"
            name="specialisation"
            defaultValue={specialisation}
          >
            <option value="">All specialisations</option>
            {options.specialisations.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </Select>
          <Select label="Job type" name="type" defaultValue={type}>
            <option value="">All types</option>
            {Object.entries(jobTypeLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
          <Select label="Experience" name="experience" defaultValue={experience}>
            <option value="">Any level</option>
            {Object.entries(experienceLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
          <div className="flex items-end gap-2 sm:col-span-2">
            <Button type="submit" className="flex-1">
              <Search className="size-4" aria-hidden /> Search jobs
            </Button>
            {filtered ? (
              <ButtonLink href="/jobs" variant="ghost">
                Clear
              </ButtonLink>
            ) : null}
          </div>
        </form>

        <p className="text-ink-muted mb-3 text-sm" aria-live="polite">
          {total} {total === 1 ? "opportunity" : "opportunities"}
          {filtered ? " match your search" : " open"}
        </p>
        {items.length ? (
          <ul className="rounded-card border-line shadow-card overflow-hidden border bg-white">
            {items.map((j) => (
              <JobRow key={j.slug} job={j} as="h2" />
            ))}
          </ul>
        ) : (
          <EmptyState
            title={filtered ? "No jobs match your search" : "No open jobs right now"}
            description={
              filtered
                ? "Try different keywords or clear the filters."
                : "New opportunities are posted regularly."
            }
            action={
              filtered ? (
                <ButtonLink href="/jobs" variant="secondary">
                  Clear filters
                </ButtonLink>
              ) : undefined
            }
          />
        )}
        {totalPages > 1 ? (
          <div className="mt-8">
            <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
          </div>
        ) : null}
      </Section>
    </>
  );
}
