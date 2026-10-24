import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { LinkTabs } from "@/components/ui/tabs";
import { EventRow } from "@/components/domain/event-components";
import { EVENTS_PER_PAGE, getPastEvents, getUpcomingEvents } from "@/lib/data/events";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Events",
  description: "Workshops, conferences and meetups for young planners.",
};

export default async function EventsPage({ searchParams }: PageProps<"/events">) {
  const sp = await searchParams;
  const past = sp.tab === "past";
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);

  const upcoming = past ? [] : await getUpcomingEvents();
  const pastData = past ? await getPastEvents(page) : null;
  const totalPages = pastData ? Math.ceil(pastData.total / EVENTS_PER_PAGE) : 1;
  const items = pastData ? pastData.items : upcoming;

  return (
    <>
      <PageHero
        title="Events"
        subtitle="Learn, connect and grow with fellow young planners."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Events" }]}
      />
      <Section>
        <LinkTabs
          label="Event timing"
          items={[
            { href: "/events", label: "Upcoming", active: !past },
            { href: "/events?tab=past", label: "Past events", active: past },
          ]}
        />
        <div className="mt-6 space-y-4">
          {items.length ? (
            items.map((e) => <EventRow key={e.slug} event={e} past={past} as="h2" />)
          ) : (
            <EmptyState
              title={past ? "No past events yet" : "No upcoming events right now"}
              description={past ? undefined : "Check back soon, or look at past events."}
            />
          )}
        </div>
        {past && totalPages > 1 ? (
          <div className="mt-8">
            <Pagination
              page={page}
              totalPages={totalPages}
              hrefFor={(p) => `/events?tab=past&page=${p}`}
            />
          </div>
        ) : null}
      </Section>
    </>
  );
}
