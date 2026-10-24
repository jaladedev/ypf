import type { ExperienceLevel, JobType, PostCategory } from "@/types/database";

/** All dates are shown in Nigerian time regardless of where the server runs. */
const TZ = "Africa/Lagos";

function parts(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-NG", { timeZone: TZ, ...options }).format(date);
}

const toDate = (value: string | Date) =>
  value instanceof Date ? value : new Date(value);

/** "24 Apr 2026" */
export function formatDate(value: string | Date) {
  return parts(toDate(value), { day: "numeric", month: "short", year: "numeric" });
}

/** "9:00 AM" */
export function formatTime(value: string | Date) {
  return parts(toDate(value), {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase();
}

/** "9:00 AM - 4:00 PM" (end optional) */
export function formatTimeRange(start: string | Date, end?: string | Date | null) {
  return end ? `${formatTime(start)} - ${formatTime(end)}` : formatTime(start);
}

/** { day: "24", month: "APR" } for the date block in event lists. */
export function dateBlock(value: string | Date) {
  const d = toDate(value);
  return {
    day: parts(d, { day: "numeric" }),
    month: parts(d, { month: "short" }).slice(0, 3).toUpperCase(),
  };
}

/** "2 weeks ago", "today", "in 3 days" for a date relative to now. */
export function relativeDays(value: string | Date, now = new Date()) {
  const days = Math.round((toDate(value).getTime() - now.getTime()) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(days) >= 14 && Math.abs(days) < 60)
    return rtf.format(Math.round(days / 7), "week");
  if (Math.abs(days) >= 60) return rtf.format(Math.round(days / 30), "month");
  return rtf.format(days, "day");
}

/** Days from today until a deadline (a plain date or timestamp). Negative = past. */
export function daysUntil(value: string | Date, now = new Date()) {
  const target = toDate(value);
  const startOfDay = (d: Date) =>
    new Date(
      parts(d, { year: "numeric", month: "2-digit", day: "2-digit" })
        .split("/")
        .reverse()
        .join("-"),
    ).getTime();
  return Math.round((startOfDay(target) - startOfDay(now)) / 86_400_000);
}

export const jobTypeLabels: Record<JobType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  internship: "Internship",
  nysc: "NYSC placement",
  volunteer: "Volunteer",
  contract: "Contract",
};

export const experienceLabels: Record<ExperienceLevel, string> = {
  entry: "Entry level",
  entry_mid: "Entry - Mid level",
  mid: "Mid level",
  senior: "Senior",
};

export const postCategoryLabels: Record<PostCategory, string> = {
  advocacy: "Advocacy",
  events: "Events",
  careers: "Careers",
  announcements: "Announcements",
};

/** "Ada Obi" -> "AO" for avatar fallbacks. */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
