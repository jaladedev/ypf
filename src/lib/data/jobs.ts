import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { ExperienceLevel, JobRow, JobType } from "@/types/database";

export const JOBS_PER_PAGE = 10;

export type JobListItem = Pick<
  JobRow,
  | "slug"
  | "title"
  | "organisation"
  | "location"
  | "job_type"
  | "deadline"
  | "specialisation"
  | "experience_level"
>;

const columns =
  "slug,title,organisation,location,job_type,deadline,specialisation,experience_level";

export type JobFilters = {
  q?: string;
  location?: string;
  specialisation?: string;
  type?: JobType;
  experience?: ExperienceLevel;
  page: number;
};

/** Escape characters that have meaning inside a PostgREST `or(...)` ilike filter. */
function likeTerm(input: string) {
  return input
    .replace(/[%_\\]/g, (c) => `\\${c}`)
    .replace(/[,()*]/g, " ")
    .trim();
}

/** Start of today in UTC, so a job whose deadline is today still shows. */
function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function getJobs(f: JobFilters) {
  const db = createPublicClient();
  let query = db
    .from("jobs")
    .select(columns, { count: "exact" })
    .eq("status", "published")
    .or(`deadline.is.null,deadline.gte.${today()}`);

  const term = f.q ? likeTerm(f.q) : "";
  if (term) {
    const p = `*${term}*`;
    query = query.or(
      `title.ilike.${p},organisation.ilike.${p},description.ilike.${p},location.ilike.${p}`,
    );
  }
  if (f.location) query = query.eq("location", f.location);
  if (f.specialisation) query = query.eq("specialisation", f.specialisation);
  if (f.type) query = query.eq("job_type", f.type);
  if (f.experience) query = query.eq("experience_level", f.experience);

  const from = (f.page - 1) * JOBS_PER_PAGE;
  const { data, error, count } = await query
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, from + JOBS_PER_PAGE - 1);
  if (error) throw new Error(`jobs: ${error.message}`);
  return { items: data as JobListItem[], total: count ?? 0 };
}

/** Distinct locations and specialisations of open jobs, for the filter dropdowns. */
export async function getJobFilterOptions() {
  const db = createPublicClient();
  const { data, error } = await db
    .from("jobs")
    .select("location,specialisation")
    .eq("status", "published")
    .or(`deadline.is.null,deadline.gte.${today()}`);
  if (error) throw new Error(`job filters: ${error.message}`);
  const uniq = (xs: (string | null)[]) =>
    [...new Set(xs.filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b));
  return {
    locations: uniq(data.map((j) => j.location)),
    specialisations: uniq(data.map((j) => j.specialisation)),
  };
}

export async function getLatestJobs(limit: number): Promise<JobListItem[]> {
  const { items } = await getJobs({ page: 1 });
  return items.slice(0, limit);
}

/** A closed (expired) job is still viewable by direct link, flagged as closed. */
export async function getJobBySlug(slug: string): Promise<JobRow | null> {
  const db = createPublicClient();
  const { data, error } = await db
    .from("jobs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`job: ${error.message}`);
  return data;
}

export async function getRelatedJobs(job: JobRow, limit = 3): Promise<JobListItem[]> {
  const { items } = await getJobs({
    page: 1,
    specialisation: job.specialisation ?? undefined,
  });
  return items.filter((j) => j.slug !== job.slug).slice(0, limit);
}
