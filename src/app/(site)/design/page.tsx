import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationCap, MapPin, Users } from "lucide-react";
import { EventCard, EventRow } from "@/components/domain/event-components";
import { JobRow } from "@/components/domain/job-row";
import { LeaderCard } from "@/components/domain/leader-card";
import { NewsCard } from "@/components/domain/news-card";
import { ShareButtons } from "@/components/domain/share-buttons";
import { StatTile } from "@/components/domain/stat-tile";
import { PageHero } from "@/components/layout/page-hero";
import { Section, SectionHeading } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/form-controls";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { LinkTabs } from "@/components/ui/tabs";
import { FormDemo, TabsDemo, ToastDemo } from "./design-demos";

export const metadata: Metadata = {
  title: "Design system | Young Planners Forum",
  robots: { index: false, follow: false },
};

const day = 86_400_000;
const inDays = (n: number) => new Date(Date.now() + n * day).toISOString();
const dateOnly = (n: number) => inDays(n).slice(0, 10);

const events = [
  {
    slug: "urban-planning-for-climate-resilience",
    title: "Urban Planning for Climate Resilience",
    starts_at: inDays(14),
    ends_at: inDays(14.25),
    city: "Lagos",
    venue: null,
    cover_image: null,
  },
  {
    slug: "ypf-annual-general-meeting",
    title: "YPF Annual General Meeting",
    starts_at: inDays(35),
    ends_at: inDays(35.1),
    city: "Abuja",
    venue: null,
    cover_image: null,
  },
  {
    slug: "planning-career-summit",
    title: "Planning Career Summit",
    starts_at: inDays(60),
    ends_at: null,
    city: "Lagos",
    venue: null,
    cover_image: null,
  },
];

const jobs = [
  {
    slug: "planning-officer-lagos-state",
    title: "Planning Officer - Lagos State",
    organisation: "Sample Agency",
    location: "Lagos, Nigeria",
    job_type: "full_time",
    deadline: dateOnly(21),
  },
  {
    slug: "urban-design-intern",
    title: "Urban Design Intern",
    organisation: "Sample Studio",
    location: "Abuja, FCT",
    job_type: "internship",
    deadline: dateOnly(3),
  },
  {
    slug: "gis-analyst",
    title: "GIS Analyst",
    organisation: "Sample Consultancy",
    location: "Lagos, Nigeria",
    job_type: "contract",
    deadline: null,
  },
] as const;

const posts = [
  {
    slug: "a",
    title: "YPF calls for inclusive urban planning policies",
    excerpt:
      "The Young Planners Forum calls for people-centred urban planning in Nigeria.",
    cover_image: null,
    category: "advocacy",
    published_at: inDays(-5),
  },
  {
    slug: "b",
    title: "Strengthening youth voice in urban planning",
    excerpt: "Why young planners need a seat at the table.",
    cover_image: null,
    category: "events",
    published_at: inDays(-12),
  },
  {
    slug: "c",
    title: "New chapter coordinators for 2026",
    excerpt: null,
    cover_image: null,
    category: "announcements",
    published_at: inDays(-20),
  },
] as const;

const brand = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const brandClass: Record<(typeof brand)[number], string> = {
  50: "bg-brand-50",
  100: "bg-brand-100",
  200: "bg-brand-200",
  300: "bg-brand-300",
  400: "bg-brand-400",
  500: "bg-brand-500",
  600: "bg-brand-600",
  700: "bg-brand-700",
  800: "bg-brand-800",
  900: "bg-brand-900",
  950: "bg-brand-950",
};

function Block({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Section
      tone="white"
      className="border-line border-b py-10 md:py-10"
      aria-labelledby={id}
    >
      <h2 id={id} className="text-h3 text-ink mb-6">
        {title}
      </h2>
      {children}
    </Section>
  );
}

// Development-only component gallery. Returns 404 in production.
export default function DesignPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <PageHero
        title="Design system"
        subtitle="Every building block used across the YPF site, in one place. Visible in development only."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Design system" }]}
      />

      <Block id="colors" title="Colour">
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-11">
          {brand.map((n) => (
            <div key={n} className="space-y-1.5 text-center">
              <div
                className={`${brandClass[n]} rounded-control h-12 ring-1 ring-black/5`}
              />
              <p className="text-ink-muted text-[0.7rem]">{n}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-highlight size-6 rounded" /> highlight
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-surface ring-line size-6 rounded ring-1" /> surface
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-danger-600 size-6 rounded" /> danger
          </div>
        </div>
      </Block>

      <Block id="type" title="Typography">
        <div className="space-y-4">
          <p className="text-display text-ink">Display heading</p>
          <p className="text-h1 text-ink">Heading 1: Urban planning</p>
          <p className="text-h2 text-ink">Heading 2: Climate resilience</p>
          <p className="text-h3 text-ink">Heading 3: Upcoming events</p>
          <p className="text-lead text-ink-muted">
            Lead paragraph for introductions and page summaries.
          </p>
          <p className="text-ink">
            Body text. The Young Planners Forum is a network of young and emerging
            planning professionals.
          </p>
          <p className="text-ink-muted text-sm">Small supporting text and captions.</p>
        </div>
      </Block>

      <Block id="buttons" title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <ButtonLink href="/design" size="sm">
            Small link
          </ButtonLink>
          <ButtonLink href="/design" size="lg">
            Large link
          </ButtonLink>
        </div>
        <div className="on-dark rounded-card bg-brand-950 mt-4 flex flex-wrap gap-3 p-5">
          <Button variant="accent">Accent</Button>
          <Button variant="outline-light">Outline light</Button>
        </div>
      </Block>

      <Block id="badges" title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="brand">Advocacy</Badge>
          <Badge tone="warning">3 days left</Badge>
          <Badge tone="danger">Closed</Badge>
          <Badge tone="info">Draft</Badge>
        </div>
      </Block>

      <Block id="forms" title="Form controls and validation">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Input
              label="Default"
              placeholder="Placeholder text"
              hint="Helper text under the field."
            />
            <Input
              label="With error"
              defaultValue="not-an-email"
              error="Enter a valid email address."
            />
            <Input label="Disabled" disabled defaultValue="Read only" />
          </div>
          <Card>
            <CardBody>
              <p className="text-ink-muted mb-4 text-sm">
                Live react-hook-form + zod demo. Submit it empty to see errors.
              </p>
              <FormDemo />
            </CardBody>
          </Card>
        </div>
      </Block>

      <Block id="nav" title="Stepper, tabs, breadcrumbs">
        <div className="space-y-8">
          <div className="max-w-md">
            <Stepper steps={["Personal", "Education", "Professional"]} current={1} />
          </div>
          <TabsDemo />
          <LinkTabs
            label="Events"
            items={[
              { href: "/design", label: "Upcoming Events", active: true },
              { href: "/design?past=1", label: "Past Events", active: false },
            ]}
          />
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "News", href: "/news" },
              { label: "Article title" },
            ]}
          />
        </div>
      </Block>

      <Block id="domain" title="Content components">
        <div className="space-y-10">
          <Card>
            <CardBody className="grid gap-6 sm:grid-cols-3">
              <StatTile
                icon={<Users className="size-5" aria-hidden />}
                value="Growing"
                label="Network"
              />
              <StatTile
                icon={<MapPin className="size-5" aria-hidden />}
                value="36+"
                label="States & FCT"
              />
              <StatTile
                icon={<GraduationCap className="size-5" aria-hidden />}
                value="Students - Graduates"
                label="MNITP/RTP"
              />
            </CardBody>
          </Card>

          <div>
            <SectionHeading as="h3" title="Event cards" href="/events" />
            <div className="grid gap-4 md:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeading as="h3" title="Event rows" />
            <div className="space-y-3">
              {events.slice(0, 2).map((e) => (
                <EventRow key={e.slug} event={e} />
              ))}
              <EventRow event={{ ...events[2], starts_at: inDays(-40) }} past />
            </div>
          </div>

          <div>
            <SectionHeading as="h3" title="Job rows" href="/jobs" />
            <Card>
              <ul>
                {jobs.map((j) => (
                  <JobRow key={j.slug} job={j} />
                ))}
              </ul>
            </Card>
          </div>

          <div>
            <SectionHeading as="h3" title="News cards" href="/news" />
            <div className="grid gap-4 md:grid-cols-3">
              {posts.map((p) => (
                <NewsCard key={p.slug} post={p} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeading as="h3" title="Leadership" />
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {["Tunde Adejepo", "Chioma Okafor", "Abdul Musa", "Ngozi Eze"].map(
                (n, i) => (
                  <LeaderCard
                    key={n}
                    leader={{
                      name: n,
                      role_title: [
                        "National President",
                        "Vice President",
                        "General Secretary",
                        "Treasurer",
                      ][i],
                      photo_url: null,
                    }}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </Block>

      <Block id="feedback" title="Pagination, empty state, loading, toasts, sharing">
        <div className="space-y-10">
          <Pagination page={4} totalPages={12} hrefFor={(p) => `/design?page=${p}`} />
          <EmptyState
            title="No events found"
            description="There are no upcoming events right now. Check back soon or browse past events."
            action={
              <ButtonLink href="/design" variant="secondary">
                View past events
              </ButtonLink>
            }
          />
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <ToastDemo />
          <ShareButtons
            url="https://example.org/news/sample"
            title="YPF calls for inclusive urban planning policies"
          />
        </div>
      </Block>
    </>
  );
}
