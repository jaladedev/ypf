import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { EventRow, EventSpeakerRow } from "@/types/database";

export const EVENTS_PER_PAGE = 10;

const summaryColumns = "slug,title,starts_at,ends_at,city,venue,cover_image,summary";

export type EventListItem = Pick<
  EventRow,
  | "slug"
  | "title"
  | "starts_at"
  | "ends_at"
  | "city"
  | "venue"
  | "cover_image"
  | "summary"
>;

/** An event is "upcoming" until it ends (or, with no end time, until it starts). */
function endOf(e: Pick<EventRow, "starts_at" | "ends_at">) {
  return new Date(e.ends_at ?? e.starts_at).getTime();
}

export async function getUpcomingEvents(limit?: number): Promise<EventListItem[]> {
  const db = createPublicClient();
  // Fetch from a day ago so multi-hour events that started today still appear,
  // then filter precisely on end time.
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data, error } = await db
    .from("events")
    .select(summaryColumns)
    .eq("status", "published")
    .gte("starts_at", since)
    .order("starts_at", { ascending: true });
  if (error) throw new Error(`events: ${error.message}`);
  const now = Date.now();
  const rows = (data as EventListItem[]).filter((e) => endOf(e) >= now);
  return limit ? rows.slice(0, limit) : rows;
}

export async function getPastEvents(page: number) {
  const db = createPublicClient();
  const cutoff = new Date().toISOString();
  const from = (page - 1) * EVENTS_PER_PAGE;
  const { data, error, count } = await db
    .from("events")
    .select(summaryColumns, { count: "exact" })
    .eq("status", "published")
    .lt("starts_at", cutoff)
    .order("starts_at", { ascending: false })
    .range(from, from + EVENTS_PER_PAGE - 1);
  if (error) throw new Error(`past events: ${error.message}`);
  const now = Date.now();
  return {
    // An event that started earlier today but has not ended is still "upcoming".
    items: (data as EventListItem[]).filter((e) => endOf(e) < now),
    total: count ?? 0,
  };
}

export type EventDetail = EventRow & { speakers: EventSpeakerRow[] };

export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  const db = createPublicClient();
  const { data, error } = await db
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`event: ${error.message}`);
  if (!data) return null;
  const { data: speakers, error: sErr } = await db
    .from("event_speakers")
    .select("*")
    .eq("event_id", data.id)
    .order("sort_order", { ascending: true });
  if (sErr) throw new Error(`speakers: ${sErr.message}`);
  return { ...data, speakers: speakers ?? [] };
}

export async function getEventSlugs(): Promise<string[]> {
  const db = createPublicClient();
  const { data } = await db.from("events").select("slug").eq("status", "published");
  return (data ?? []).map((e) => e.slug);
}
