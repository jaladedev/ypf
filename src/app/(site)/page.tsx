import Image from "next/image";
import type { Metadata } from "next";
import { Globe2, GraduationCap, Users } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Section, SectionHeading } from "@/components/layout/section";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EventCard } from "@/components/domain/event-components";
import { JobRow } from "@/components/domain/job-row";
import { NewsCard } from "@/components/domain/news-card";
import { StatTile } from "@/components/domain/stat-tile";
import { getUpcomingEvents } from "@/lib/data/events";
import { getLatestJobs } from "@/lib/data/jobs";
import { getLatestPosts } from "@/lib/data/posts";
import { getSiteSettings } from "@/lib/data/site";
import { siteConfig } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} | ${siteConfig.parent}` },
  description: siteConfig.description,
};


export default async function Home() {
  const [settings, events, posts, jobs] = await Promise.all([
    getSiteSettings(),
    getUpcomingEvents(3),
    getLatestPosts(3),
    getLatestJobs(4),
  ]);
  const { stats, partners } = settings;

  return (
    <>
      <PageHero
        size="lg"
        title={
          <>
            Empowering Young Planners for a{" "}
            <span className="text-highlight">Sustainable Nigeria</span>
          </>
        }
        subtitle="The Young Planners Forum (YPF) is a network of young and emerging planning professionals committed to building sustainable cities."
        actions={
          <>
            <ButtonLink href="/join" variant="accent" size="lg">
              Join YPF
            </ButtonLink>
            <ButtonLink href="/about" variant="outline-light" size="lg">
              Learn more
            </ButtonLink>
          </>
        }
      />

      <section
        aria-label="YPF at a glance"
        className="border-line border-b bg-white py-6"
      >
        <div className="max-w-page mx-auto grid grid-cols-1 gap-5 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          <StatTile
            icon={<Users className="size-5" aria-hidden />}
            value={stats.members_label}
            label="Young planners nationwide"
          />
          <StatTile
            icon={<Globe2 className="size-5" aria-hidden />}
            value={stats.reach_value}
            label={stats.reach_label}
          />
          <StatTile
            icon={<GraduationCap className="size-5" aria-hidden />}
            value="Open to"
            label={stats.audience_label}
          />
        </div>
      </section>

      <Section tone="surface">
        <SectionHeading
          title="Upcoming events"
          href="/events"
          linkLabel="View all events"
        />
        {events.length ? (
          <ul className="grid gap-4 md:grid-cols-3">
            {events.map((e) => (
              <li key={e.slug}>
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No upcoming events right now"
            description="New events are announced here first. Check back soon."
          />
        )}
      </Section>

      <Section>
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-h2 text-ink">Who we are</h2>
            <p className="text-ink-muted">
              YPF brings together students, graduates and early-career planners under the
              Nigerian Institute of Town Planners. We create room to learn, network and
              lead, and we put young voices into the conversation about how Nigeria&apos;s
              towns and cities grow.
            </p>
            <ButtonLink href="/about" variant="secondary">
              Our story
            </ButtonLink>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              ["Learn", "Workshops, mentorship and professional development."],
              ["Connect", "A national network of planners across every region."],
              ["Advocate", "Youth perspectives on planning policy and practice."],
              ["Grow", "Jobs, internships and pathways to registration."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-card border-line bg-surface border p-4">
                <p className="text-brand-800 font-semibold">{t}</p>
                <p className="text-ink-muted mt-1 text-sm">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading title="Latest news" href="/news" linkLabel="All news" />
        {posts.length ? (
          <ul className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <NewsCard post={p} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No news yet"
            description="Updates from YPF will appear here."
          />
        )}
      </Section>

      <Section>
        <SectionHeading title="Jobs & opportunities" href="/jobs" linkLabel="All jobs" />
        {jobs.length ? (
          <ul className="rounded-card border-line shadow-card overflow-hidden border bg-white">
            {jobs.map((j) => (
              <JobRow key={j.slug} job={j} />
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No open jobs right now"
            description="New opportunities are posted regularly."
          />
        )}
      </Section>

      <Section tone="surface" className="py-10 md:py-10">
        <h2 className="text-ink-muted text-center text-sm font-semibold tracking-wide uppercase">
          Our partners & affiliations
        </h2>
        <ul className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {partners.map((p) => (
            <li key={p.name} className="text-ink flex items-center gap-2 text-sm font-medium">
              {p.logo_url ? <Image src={p.logo_url} alt="" width={28} height={28} className="size-7 object-contain" /> : null}
              {p.name}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="dark">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-h2">Ready to be part of YPF?</h2>
            <p className="mt-2 max-w-xl text-white/80">
              Membership is open to any young planner. Apply in a few minutes.
            </p>
          </div>
          <ButtonLink href="/join" variant="accent" size="lg">
            Join YPF
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
