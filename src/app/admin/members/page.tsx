import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { ExportLinks } from "@/components/admin/export-links";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Avatar } from "@/components/domain/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/form-controls";
import { Pagination } from "@/components/ui/pagination";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, MembershipStatus } from "@/types/database";

export const metadata: Metadata = { title: "Members | Admin", robots: { index: false } };
const PER_PAGE = 25;
const statuses = ["pending", "approved", "rejected", "suspended"] as const;
const roles = ["member", "editor", "admin"] as const;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function AdminMembers({ searchParams }: PageProps<"/admin/members">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q).trim().slice(0, 100);
  const status = statuses.find((s) => s === one(sp.status));
  const role = roles.find((r) => r === one(sp.role));
  const page = Math.max(1, Number.parseInt(one(sp.page) || "1", 10) || 1);

  const db = await createClient();
  const { data, error } = await db.rpc("admin_list_members", {
    p_search: q || null,
    p_status: (status ?? null) as MembershipStatus | null,
    p_role: (role ?? null) as AppRole | null,
    p_limit: PER_PAGE,
    p_offset: (page - 1) * PER_PAGE,
  });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const total = Number(rows[0]?.total_count ?? 0);

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (role) params.set("role", role);
  const qs = params.toString();

  return (
    <>
      <PageHeader
        title="Members"
        description="Everyone who has signed up. Review new applications, suspend accounts and assign roles."
        actions={
          <>
            <ButtonLink href="/admin/applications" size="sm" variant="secondary">Review applications</ButtonLink>
            <ExportLinks base={`/admin/export/members${qs ? `?${qs}` : ""}`} />
          </>
        }
      />
      <form method="get" className="rounded-card border-line shadow-card grid gap-4 border bg-white p-4 sm:grid-cols-[1fr_10rem_10rem_auto] sm:items-end">
        <Input label="Search" name="q" type="search" defaultValue={q} placeholder="Name or email" />
        <Select label="Status" name="status" defaultValue={status ?? ""}>
          <option value="">Any</option>
          {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </Select>
        <Select label="Role" name="role" defaultValue={role ?? ""}>
          <option value="">Any</option>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </Select>
        <Button type="submit"><Search className="size-4" aria-hidden /> Search</Button>
      </form>
      <p className="text-ink-muted text-sm" role="status">{total} {total === 1 ? "member" : "members"}{qs ? " match" : ""}</p>
      {rows.length ? (
        <ul className="rounded-card border-line shadow-card divide-line divide-y overflow-hidden border bg-white">
          {rows.map((m) => (
            <li key={m.id} className="hover:bg-brand-50/50 relative flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <Avatar name={m.full_name || m.email || "?"} src={m.avatar_url} className="size-11 text-sm" sizes="44px" />
              <div className="min-w-0 flex-1 basis-52">
                <p className="text-ink font-semibold">
                  <Link href={`/admin/members/${m.id}`} className="after:absolute after:inset-0 after:content-['']">{m.full_name || "Unnamed"}</Link>
                </p>
                <p className="text-ink-muted truncate text-sm">{m.email}</p>
              </div>
              <span className="text-ink-muted hidden text-sm md:block">Joined {formatDate(m.created_at)}</span>
              {m.role !== "member" ? <StatusBadge value={m.role} /> : null}
              <StatusBadge value={m.membership_status} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No members found" description={qs ? "Try a different search or clear the filters." : "People appear here after they sign up."} action={qs ? <ButtonLink href="/admin/members" size="sm" variant="secondary">Clear filters</ButtonLink> : undefined} />
      )}
      <Pagination page={page} totalPages={Math.ceil(total / PER_PAGE)} hrefFor={(p) => `/admin/members?${new URLSearchParams({ ...Object.fromEntries(params), page: String(p) })}`} />
    </>
  );
}
