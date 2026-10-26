import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Flash } from "@/components/admin/flash";
import { PageHeader } from "@/components/admin/page-header";
import { Avatar } from "@/components/domain/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireEditor } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { moveLeader } from "./actions";

export const metadata: Metadata = { title: "Leadership | Admin", robots: { index: false } };

const groups = [
  { key: "national_executive", label: "Executive committee" },
  { key: "coordinator", label: "Coordinators" },
] as const;

export default async function AdminLeadership({ searchParams }: PageProps<"/admin/leadership">) {
  await requireEditor();
  const sp = await searchParams;
  const db = await createClient();
  const { data, error } = await db.from("leaders").select("id,name,role_title,group,photo_url,is_active,sort_order").order("sort_order").order("created_at");
  if (error) throw new Error(error.message);
  return (
    <>
      <PageHeader title="Leadership" description="Add leaders and set the order they appear on the public Leadership page." actions={<ButtonLink href="/admin/leadership/new"><Plus className="size-4" aria-hidden /> Add leader</ButtonLink>} />
      <Flash code={sp.saved} />
      {groups.map((g) => {
        const list = (data ?? []).filter((l) => l.group === g.key);
        return (
          <section key={g.key} aria-labelledby={`g-${g.key}`} className="space-y-3">
            <h2 id={`g-${g.key}`} className="text-h3 text-ink">{g.label}</h2>
            {list.length ? (
              <ul className="rounded-card border-line shadow-card divide-line divide-y overflow-hidden border bg-white">
                {list.map((l, i) => (
                  <li key={l.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={l.name} src={l.photo_url} className="size-11 text-sm" sizes="44px" />
                    <div className="min-w-0 flex-1">
                      <p className="text-ink font-semibold">
                        <Link href={`/admin/leadership/${l.id}`} className="hover:text-brand-700">{l.name}</Link>
                      </p>
                      <p className="text-ink-muted truncate text-sm">{l.role_title}</p>
                    </div>
                    {!l.is_active ? <Badge>Hidden</Badge> : null}
                    <form action={moveLeader} className="flex gap-1">
                      <input type="hidden" name="id" value={l.id} />
                      <Button type="submit" name="dir" value="up" variant="ghost" size="sm" disabled={i === 0} aria-label={`Move ${l.name} up`}><ArrowUp className="size-4" aria-hidden /></Button>
                      <Button type="submit" name="dir" value="down" variant="ghost" size="sm" disabled={i === list.length - 1} aria-label={`Move ${l.name} down`}><ArrowDown className="size-4" aria-hidden /></Button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title={`No one in ${g.label} yet`} />
            )}
          </section>
        );
      })}
    </>
  );
}
