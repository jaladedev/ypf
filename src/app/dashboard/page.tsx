import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, CalendarDays, Newspaper, Shield } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardBody } from "@/components/ui/card";
import { DateBlock } from "@/components/domain/event-components";
import { requireApprovedMember } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Member dashboard", robots: { index: false } };

export default async function DashboardPage() {
  const { user, profile, role } = await requireApprovedMember("/dashboard");
  const db = await createClient();

  // Registrations made while signed out were saved by email only; match on the
  // verified account email as well as the user id.
  const admin = createAdminClient();
  const [byUser, byEmail] = await Promise.all([
    admin
      .from("event_registrations")
      .select("event_id")
      .eq("status", "registered")
      .eq("user_id", user.id),
    user.email
      ? admin
          .from("event_registrations")
          .select("event_id")
          .eq("status", "registered")
          .eq("email", user.email.toLowerCase())
      : Promise.resolve({ data: [] as { event_id: string }[] }),
  ]);
  const regs = [...(byUser.data ?? []), ...(byEmail.data ?? [])];
  const eventIds = [...new Set(regs.map((r) => r.event_id))];
  const { data: events } = eventIds.length
    ? await db
        .from("events")
        .select("slug,title,starts_at,city,venue")
        .in("id", eventIds)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at")
    : { data: [] };

  const { count: savedCount } = await db
    .from("saved_jobs")
    .select("job_id", { count: "exact", head: true });

  const links = [
    { href: "/events", label: "Browse events", icon: CalendarDays },
    { href: "/jobs", label: "Find jobs", icon: Briefcase },
    { href: "/news", label: "Read the news", icon: Newspaper },
    ...(role === "admin" || role === "editor"
      ? [{ href: "/admin", label: "Go to admin", icon: Shield }]
      : []),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 text-ink">
          Welcome back, {profile?.full_name?.split(" ")[0] || "member"}
        </h1>
        <p className="text-ink-muted mt-1">Your YPF member area.</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="rounded-card border-line shadow-card hover:shadow-pop flex items-center gap-3 border bg-white p-4 font-medium transition-shadow"
            >
              <span className="bg-brand-50 text-brand-700 grid size-10 place-items-center rounded-full">
                <Icon className="size-5" aria-hidden />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="my-events">
          <h2 id="my-events" className="text-h2 text-ink mb-4">
            My upcoming events
          </h2>
          {events?.length ? (
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.slug}>
                  <Card className="relative">
                    <CardBody className="flex items-center gap-4 p-4 sm:p-4">
                      <DateBlock date={e.starts_at} />
                      <div className="min-w-0">
                        <p className="text-ink font-semibold">
                          <Link
                            href={`/events/${e.slug}`}
                            className="after:absolute after:inset-0 after:content-['']"
                          >
                            {e.title}
                          </Link>
                        </p>
                        <p className="text-ink-muted text-sm">{e.city ?? e.venue}</p>
                      </div>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No events yet"
              description="Register for an event and it will show up here."
            />
          )}
        </section>
        <aside>
          <h2 className="text-h2 text-ink mb-4">Saved jobs</h2>
          <Card>
            <CardBody className="space-y-2 text-sm">
              <p className="text-ink text-3xl font-bold">{savedCount ?? 0}</p>
              <Link
                href="/dashboard/saved"
                className="text-brand-700 font-medium hover:underline"
              >
                View saved jobs
              </Link>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
