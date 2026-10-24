import { getEventBySlug } from "@/lib/data/events";

const stamp = (d: string | Date) =>
  new Date(d)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
const esc = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

export async function GET(
  _req: Request,
  { params }: RouteContext<"/events/[slug]/calendar.ics">,
) {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return new Response("Not found", { status: 404 });
  const end = e.ends_at ?? new Date(new Date(e.starts_at).getTime() + 2 * 3600 * 1000);
  const where = [e.venue, e.city].filter(Boolean).join(", ");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YPF//Events//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@ypf`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(e.starts_at)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    e.summary ? `DESCRIPTION:${esc(e.summary)}` : "",
    where ? `LOCATION:${esc(where)}` : "",
    `URL:${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/events/${e.slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.slug}.ics"`,
    },
  });
}
