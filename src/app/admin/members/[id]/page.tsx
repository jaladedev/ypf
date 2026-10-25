import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Flash } from "@/components/admin/flash";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Avatar } from "@/components/domain/avatar";
import { FormAlert } from "@/components/ui/form-alert";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { setMemberRole, setMemberStatus } from "../actions";

export const metadata: Metadata = { title: "Member | Admin", robots: { index: false } };

export default async function MemberPage({ params, searchParams }: PageProps<"/admin/members/[id]">) {
  const { user } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = await createClient();
  const { data } = await db.rpc("admin_list_members", { p_id: id, p_limit: 1 });
  const m = data?.[0];
  if (!m) notFound();
  const [{ data: p }, { data: apps }] = await Promise.all([
    db.from("profiles").select("bio,linkedin_url").eq("id", id).maybeSingle(),
    db.from("membership_applications").select("id,status,created_at").eq("user_id", id).order("created_at", { ascending: false }),
  ]);
  const self = id === user.id;
  const detail: [string, string | null][] = [
    ["Email", m.email],
    ["Phone", m.phone],
    ["Institution", m.institution],
    ["Career stage", m.career_stage?.replace(/_/g, " ") ?? null],
    ["Specialisation", m.specialisation],
    ["LinkedIn", p?.linkedin_url ?? null],
    ["Joined", formatDate(m.created_at)],
  ];

  return (
    <>
      <PageHeader title={m.full_name || "Unnamed member"} back={{ href: "/admin/members", label: "All members" }} />
      <Flash code={sp.saved} />
      {sp.error === "self" ? <FormAlert error="You can't change your own role or status. Ask another admin." /> : null}
      {sp.error === "failed" ? <FormAlert error="That change couldn't be saved. Try again." /> : null}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardBody className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={m.full_name || m.email || "?"} src={m.avatar_url} className="size-16" />
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={m.membership_status} />
                <StatusBadge value={m.role} />
              </div>
            </div>
            <dl className="divide-line divide-y text-sm">
              {detail.map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-3 py-2.5">
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="text-ink col-span-2 break-words">{v || "Not given"}</dd>
                </div>
              ))}
            </dl>
            {p?.bio ? <p className="text-ink-muted text-sm">{p.bio}</p> : null}
            {apps?.length ? (
              <div>
                <h2 className="text-ink mb-1 text-sm font-semibold">Applications</h2>
                <ul className="text-sm">
                  {apps.map((a) => (
                    <li key={a.id}>
                      <Link className="text-brand-700 underline" href={`/admin/applications/${a.id}`}>Applied {formatDate(a.created_at)}</Link> · {a.status}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardBody>
        </Card>
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-h3 text-ink">Role</h2>
              <p className="text-ink-muted text-sm">Editors manage site content. Admins also manage members, messages and settings. A role only works while the member is approved.</p>
              {self ? (
                <p className="text-ink-muted text-sm">This is you. Another admin has to change your role.</p>
              ) : (
                <form action={setMemberRole} className="space-y-3">
                  <input type="hidden" name="id" value={id} />
                  <Select label="Role" name="role" defaultValue={m.role}>
                    <option value="member">Member</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </Select>
                  <Button type="submit" size="sm">Update role</Button>
                </form>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-h3 text-ink">Membership</h2>
              {self ? (
                <p className="text-ink-muted text-sm">You can&apos;t change your own status.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {m.membership_status !== "approved" ? (
                    <form action={setMemberStatus}>
                      <input type="hidden" name="id" value={id} />
                      <Button type="submit" name="status" value="approved" size="sm">{m.membership_status === "suspended" ? "Reinstate" : "Approve"}</Button>
                    </form>
                  ) : (
                    <ConfirmForm action={setMemberStatus} fields={{ id, status: "suspended" }} trigger="Suspend" title={`Suspend ${m.full_name || "this member"}?`} description="They keep their account but lose access to member features (and any editor or admin powers) until reinstated." confirmLabel="Suspend" />
                  )}
                  {m.membership_status === "pending" ? (
                    <ConfirmForm action={setMemberStatus} fields={{ id, status: "rejected" }} trigger="Reject" title="Reject without a note?" description="To tell the applicant why, reject through the application review page instead." confirmLabel="Reject" />
                  ) : null}
                </div>
              )}
              <p className="text-ink-muted text-xs">Changes to roles and status are recorded in the audit log.</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
