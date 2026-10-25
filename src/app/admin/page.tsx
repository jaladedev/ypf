import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Briefcase, Newspaper, Plus, Users } from "lucide-react";
import { GrowthChart } from "@/components/admin/growth-chart";
import { PageHeader } from "@/components/admin/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { requireEditor } from "@/lib/auth/session";
import { formatDate, relativeDays } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard | Admin", robots: { index: false } };

type Activity = { at: string; text: string; href: string };

/** Last n calendar months in Lagos time, oldest first. */
function lastMonths(n: number) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit" });
  const key = (d: Date) => fmt.format(d).slice(0, 7);
  const out: { key: string; label: string; count: number }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 15));
    out.push({
      key: key(d),
      label: new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(d),
      count: 0,
    });
  }
  return { out, key };
}

export default async function AdminDashboard() {
  const { role } = await requireEditor();
  const admin = role === "admin";
  const db = await createClient();
  const count = async (table: "events" | "jobs" | "posts" | "profiles", status?: string) => {
    let q = db.from(table).select("id", { count: "exact", head: true });
    if (status) q = (q as unknown as { eq: (c: string, v: string) => typeof q }).eq(table === "profiles" ? "membership_status" : "status", status);
    const { count: c } = await q;
    return c ?? 0;
  };

  const [events, eventsLive, jobs, jobsLive, posts, postsLive, members, pendingMembers] = await Promise.all([
    count("events"),
    count("events", "published"),
    count("jobs"),
    count("jobs", "published"),
    count("posts"),
    count("posts", "published"),
    admin ? count("profiles", "approved") : 0,
    admin ? count("profiles", "pending") : 0,
  ]);

  // Growth: approved members by sign-up month (admins only; profiles are private).
  const { out: months, key } = lastMonths(12);
  if (admin) {
    const since = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 12, 1)).toISOString();
    const { data } = await db
      .from("profiles")
      .select("created_at")
      .eq("membership_status", "approved")
      .gte("created_at", since)
      .limit(10000);
    for (const p of data ?? []) {
      const m = months.find((x) => x.key === key(new Date(p.created_at)));
      if (m) m.count++;
    }
  }

  // Recent activity from the newest rows of each source.
  const activity: Activity[] = [];
  const [regs, apps, msgs, audit] = await Promise.all([
    db.from("event_registrations").select("event_id,name,created_at").order("created_at", { ascending: false }).limit(5),
    admin
      ? db.from("membership_applications").select("id,user_id,created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5)
      : null,
    admin ? db.from("contact_messages").select("id,name,subject,created_at").eq("status", "new").order("created_at", { ascending: false }).limit(5) : null,
    admin ? db.from("audit_log").select("summary,created_at").order("created_at", { ascending: false }).limit(5) : null,
  ]);
  const eventIds = [...new Set((regs.data ?? []).map((r) => r.event_id))];
  const { data: evs } = eventIds.length ? await db.from("events").select("id,title").in("id", eventIds) : { data: [] };
  const evTitle = new Map((evs ?? []).map((e) => [e.id, e.title]));
  for (const r of regs.data ?? [])
    activity.push({ at: r.created_at, text: `${r.name} registered for ${evTitle.get(r.event_id) ?? "an event"}`, href: `/admin/events/${r.event_id}/registrations` });
  const appUsers = [...new Set((apps?.data ?? []).map((a) => a.user_id))];
  const { data: profs } = appUsers.length ? await db.from("profiles").select("id,full_name").in("id", appUsers) : { data: [] };
  const pname = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
  for (const a of apps?.data ?? [])
    activity.push({ at: a.created_at, text: `New membership application from ${pname.get(a.user_id) || "an applicant"}`, href: `/admin/applications/${a.id}` });
  for (const m of msgs?.data ?? [])
    activity.push({ at: m.created_at, text: `Message from ${m.name}${m.subject ? `: ${m.subject}` : ""}`, href: `/admin/messages/${m.id}` });
  for (const l of audit?.data ?? []) activity.push({ at: l.created_at, text: l.summary, href: "/admin/audit" });
  activity.sort((a, b) => b.at.localeCompare(a.at));

  const tiles = [
    ...(admin
      ? [{ label: "Members", value: members, note: pendingMembers ? `${pendingMembers} awaiting approval` : "All up to date", href: "/admin/members", icon: Users }]
      : []),
    { label: "Events", value: events, note: `${eventsLive} published`, href: "/admin/events", icon: CalendarDays },
    { label: "Jobs", value: jobs, note: `${jobsLive} published`, href: "/admin/jobs", icon: Briefcase },
    { label: "News articles", value: posts, note: `${postsLive} published`, href: "/admin/news", icon: Newspaper },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Signed in as ${role}. Here's what's happening on the site.`}
        actions={
          <>
            <ButtonLink href="/admin/events/new" size="sm" variant="secondary"><Plus className="size-4" aria-hidden /> Event</ButtonLink>
            <ButtonLink href="/admin/jobs/new" size="sm" variant="secondary"><Plus className="size-4" aria-hidden /> Job</ButtonLink>
            <ButtonLink href="/admin/news/new" size="sm"><Plus className="size-4" aria-hidden /> Article</ButtonLink>
          </>
        }
      />
      <section aria-label="Totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="group">
            <Card interactive className="h-full">
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-ink-muted text-sm font-medium">{t.label}</p>
                  <t.icon className="text-brand-600 size-5" aria-hidden />
                </div>
                <p className="text-ink text-3xl font-bold tracking-tight">{t.value}</p>
                <p className="text-ink-muted text-xs">{t.note}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>
      <div className={admin ? "grid gap-6 lg:grid-cols-5" : ""}>
        {admin ? (
          <Card className="lg:col-span-3">
            <CardBody className="space-y-4">
              <h2 className="text-h3 text-ink">Membership growth</h2>
              <GrowthChart data={months} />
            </CardBody>
          </Card>
        ) : null}
        <Card className="lg:col-span-2">
          <CardBody className="space-y-4">
            <h2 className="text-h3 text-ink">Recent activity</h2>
            {activity.length ? (
              <ul className="divide-line divide-y">
                {activity.slice(0, 8).map((a, i) => (
                  <li key={i} className="py-2.5 first:pt-0 last:pb-0">
                    <Link href={a.href} className="text-ink hover:text-brand-700 block text-sm">
                      {a.text}
                    </Link>
                    <span className="text-ink-muted text-xs">
                      {formatDate(a.at)} · {relativeDays(a.at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-muted text-sm">Nothing yet. Activity shows up here as it happens.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
