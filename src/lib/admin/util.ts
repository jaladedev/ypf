import type { ZodError } from "zod";

/** Result of an admin server action, shown by the form that called it. */
export type ActionState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export function zodFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0] ?? "form")] ??= issue.message;
  return out;
}

/** "Urban Planning & Climate!" -> "urban-planning-climate" (matches the DB slug check). */
export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** One item per non-empty line. */
export function splitLines(value: string | null | undefined) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

// ------------------------------------------------------------------ dates
// Nigeria is UTC+1 all year (no daylight saving), and every date in the app is
// shown in Africa/Lagos, so <input type="datetime-local"> values are read and
// written in that zone no matter where the server runs.

/** ISO timestamp -> "YYYY-MM-DDTHH:mm" in Lagos time, for datetime-local inputs. */
export function toLagosInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 3_600_000);
  return d.toISOString().slice(0, 16);
}

/** "YYYY-MM-DDTHH:mm" (Lagos time) -> ISO timestamp, or null when empty/invalid. */
export function fromLagosInput(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(`${value}:00+01:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// ------------------------------------------------------------------ images
/** Public URL prefix of our own Supabase Storage. Only these image URLs are accepted. */
export function storagePublicPrefix() {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/`;
}

/**
 * Images must come from our own storage bucket: the public pages use next/image,
 * which only loads hosts listed in next.config.ts (and a stray URL would 500 the page).
 */
export function isOwnStorageUrl(url: string, bucket?: string, folder?: string) {
  const prefix = storagePublicPrefix() + (bucket ? `${bucket}/` : "") + (folder ? `${folder}/` : "");
  return url.startsWith(prefix) && !url.slice(prefix.length).includes("..");
}

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

/** Unique, URL-safe storage file name that keeps the original extension. */
export function uniqueFileName(original: string) {
  const ext = (original.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}
