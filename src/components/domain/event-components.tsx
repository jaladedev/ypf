import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { dateBlock, formatTimeRange } from "@/lib/format";
import { CoverImage } from "@/components/layout/cover-image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { EventRow as EventData } from "@/types/database";

export type EventSummary = Pick<
  EventData,
  "slug" | "title" | "starts_at" | "ends_at" | "city" | "venue" | "cover_image"
>;

/** The "24 APR" tile used in event lists. */
export function DateBlock({
  date,
  className,
}: {
  date: string | Date;
  className?: string;
}) {
  const { day, month } = dateBlock(date);
  return (
    <div
      className={cn(
        "rounded-control bg-brand-50 text-brand-800 flex size-16 shrink-0 flex-col items-center justify-center",
        className,
      )}
      aria-hidden
    >
      <span className="text-2xl leading-none font-bold">{day}</span>
      <span className="mt-0.5 text-[0.7rem] font-semibold tracking-wider">{month}</span>
    </div>
  );
}

/** Compact event tile (home page "Upcoming events"). The whole card is one link. */
export function EventCard({ event }: { event: EventSummary }) {
  const where = event.city ?? event.venue;
  return (
    <Card interactive className="relative">
      <div className="flex items-center gap-4 p-4">
        <DateBlock date={event.starts_at} />
        <div className="min-w-0">
          <h3 className="text-ink line-clamp-2 text-base font-semibold">
            <Link
              href={`/events/${event.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {event.title}
            </Link>
          </h3>
          {where ? (
            <p className="text-ink-muted mt-1 flex items-center gap-1 text-sm">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{where}</span>
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

/** Event list row: date block, photo, title, meta and a Register button. */
export function EventRow({ event, past }: { event: EventSummary; past?: boolean }) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4 sm:contents">
          <DateBlock date={event.starts_at} />
          <div className="rounded-control relative hidden h-16 w-28 shrink-0 overflow-hidden sm:block">
            <CoverImage src={event.cover_image} sizes="112px" />
          </div>
          <div className="min-w-0 flex-1 sm:hidden">
            <EventRowText event={event} />
          </div>
        </div>
        <div className="hidden min-w-0 flex-1 sm:block">
          <EventRowText event={event} />
        </div>
        {past ? (
          <Badge className="self-start sm:self-center">Past event</Badge>
        ) : (
          <ButtonLink
            href={`/events/${event.slug}`}
            size="sm"
            className="self-start sm:self-center"
          >
            Register
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}

function EventRowText({ event }: { event: EventSummary }) {
  return (
    <>
      <h3 className="text-ink text-base font-semibold">
        <Link
          href={`/events/${event.slug}`}
          className="hover:text-brand-700 hover:underline"
        >
          {event.title}
        </Link>
      </h3>
      <p className="text-ink-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {(event.city ?? event.venue) ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {event.city ?? event.venue}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {formatTimeRange(event.starts_at, event.ends_at)}
        </span>
      </p>
    </>
  );
}
