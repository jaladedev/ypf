import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, CalendarPlus, Check, Clock, MapPin, Users } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Avatar } from "@/components/domain/avatar";
import { ShareButtons } from "@/components/domain/share-buttons";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { getEventBySlug } from "@/lib/data/events";
import { formatDate, formatTimeRange } from "@/lib/format";
import { getSession } from "@/lib/auth/session";
import { RegisterForm } from "./register-form";

// Registration state depends on the current time and the visitor's session.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return { title: "Event not found" };
  return {
    title: e.title,
    description: e.summary ?? undefined,
    openGraph: {
      title: e.title,
      description: e.summary ?? undefined,
      images: e.cover_image ? [e.cover_image] : undefined,
    },
  };
}

function registrationState(e: {
  registration_deadline: string | null;
  starts_at: string;
  ends_at: string | null;
}) {
  const now = Date.now();
  return {
    closed: new Date(e.registration_deadline ?? e.starts_at).getTime() < now,
    over: new Date(e.ends_at ?? e.starts_at).getTime() < now,
  };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const session = await getSession();
  const { closed, over } = registrationState(event);
  const where = [event.venue, event.city].filter(Boolean).join(", ");
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <>
      <PageHero
        image={event.cover_image}
        title={event.title}
        subtitle={event.summary ?? undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Events", href: "/events" },
          { label: event.title },
        ]}
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-10">
            {event.body ? <Markdown>{event.body}</Markdown> : null}

            {event.features.length ? (
              <div>
                <h2 className="text-h3 text-ink mb-3">What to expect</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {event.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check
                        className="text-brand-700 mt-0.5 size-4 shrink-0"
                        aria-hidden
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {event.speakers.length ? (
              <div>
                <h2 className="text-h3 text-ink mb-4">Speakers</h2>
                <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  {event.speakers.map((s) => (
                    <li key={s.id} className="flex flex-col items-center text-center">
                      <Avatar
                        name={s.name}
                        src={s.photo_url}
                        className="size-20 text-lg"
                        sizes="80px"
                      />
                      <p className="text-ink mt-2 text-sm font-semibold">{s.name}</p>
                      {s.title ? (
                        <p className="text-ink-muted text-xs">{s.title}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <h2 className="text-h3 text-ink mb-3">Share this event</h2>
              <ShareButtons url={`${base}/events/${event.slug}`} title={event.title} />
            </div>
          </div>

          <aside className="order-first space-y-4 lg:sticky lg:top-24 lg:order-none lg:self-start">
            <Card>
              <CardBody className="space-y-3 text-sm">
                <h2 className="text-h3 text-ink">Event details</h2>
                <p className="flex gap-2">
                  <CalendarDays
                    className="text-brand-700 mt-0.5 size-4 shrink-0"
                    aria-hidden
                  />
                  {formatDate(event.starts_at)}
                </p>
                <p className="flex gap-2">
                  <Clock className="text-brand-700 mt-0.5 size-4 shrink-0" aria-hidden />
                  {formatTimeRange(event.starts_at, event.ends_at)}
                </p>
                {where ? (
                  <p className="flex gap-2">
                    <MapPin
                      className="text-brand-700 mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />
                    {where}
                  </p>
                ) : null}
                {event.capacity ? (
                  <p className="flex gap-2">
                    <Users
                      className="text-brand-700 mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />
                    Limited to {event.capacity} places
                  </p>
                ) : null}
                <ButtonLink
                  href={`/events/${event.slug}/calendar.ics`}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <CalendarPlus className="size-4" aria-hidden /> Add to calendar
                </ButtonLink>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-4">
                <h2 className="text-h3 text-ink">Register</h2>
                {over ? (
                  <Badge>This event has ended</Badge>
                ) : closed ? (
                  <p className="text-ink-muted text-sm">
                    Registration for this event has closed.
                  </p>
                ) : (
                  <>
                    {event.registration_deadline ? (
                      <p className="text-ink-muted text-sm">
                        Register by {formatDate(event.registration_deadline)}. No account
                        needed.
                      </p>
                    ) : null}
                    <RegisterForm
                      eventId={event.id}
                      defaultName={session.profile?.full_name}
                      defaultEmail={session.user?.email}
                    />
                  </>
                )}
              </CardBody>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  );
}
