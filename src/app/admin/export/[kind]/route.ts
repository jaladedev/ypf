import { NextResponse, type NextRequest } from "next/server";
import { exportResponse, type ExportColumn, type ExportFormat } from "@/lib/admin/export";
import { slugify } from "@/lib/admin/util";
import { getSession } from "@/lib/auth/session";
import { formatDate, formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, MembershipStatus } from "@/types/database";

const stamp = () => new Date().toISOString().slice(0, 10);
const stamped = (iso: string) => `${formatDate(iso)} ${formatTime(iso)}`;

/**
 * CSV / Excel downloads. GET is safe here (read-only) but authorisation is checked
 * every time, and the database's own RLS applies on top (an editor asking for
 * members would get nothing even if this check were removed).
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/admin/export/[kind]">) {
  const { kind } = await ctx.params;
  const sp = request.nextUrl.searchParams;
  const format: ExportFormat = sp.get("format") === "xlsx" ? "xlsx" : "csv";

  const { user, role } = await getSession();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const editor = role === "editor" || role === "admin";
  const admin = role === "admin";
  const db = await createClient();

  if (kind === "members") {
    if (!admin) return NextResponse.json({ error: "Admins only" }, { status: 403 });
    const status = sp.get("status");
    const r = sp.get("role");
    const { data, error } = await db.rpc("admin_list_members", {
      p_search: sp.get("q") || null,
      p_status: (["pending", "approved", "rejected", "suspended"].includes(status ?? "") ? status : null) as MembershipStatus | null,
      p_role: (["member", "editor", "admin"].includes(r ?? "") ? r : null) as AppRole | null,
      p_limit: 10000,
    });
    if (error) return NextResponse.json({ error: "Export failed" }, { status: 500 });
    const rows = data ?? [];
    await db.rpc("log_admin_action", { p_action: "export.members", p_summary: `Exported ${rows.length} members (${format})` });
    const columns: ExportColumn<(typeof rows)[number]>[] = [
      { header: "Name", value: (m) => m.full_name, width: 26 },
      { header: "Email", value: (m) => m.email, width: 30 },
      { header: "Phone", value: (m) => m.phone },
      { header: "Institution", value: (m) => m.institution, width: 30 },
      { header: "Career stage", value: (m) => m.career_stage?.replace(/_/g, " ") },
      { header: "Specialisation", value: (m) => m.specialisation, width: 24 },
      { header: "Role", value: (m) => m.role },
      { header: "Status", value: (m) => m.membership_status },
      { header: "Joined", value: (m) => formatDate(m.created_at) },
    ];
    return exportResponse({ format, filename: `ypf-members-${stamp()}`, sheetName: "Members", columns, rows });
  }

  if (kind === "registrations") {
    if (!editor) return NextResponse.json({ error: "Editors only" }, { status: 403 });
    const eventId = sp.get("event") ?? "";
    if (!/^[0-9a-f-]{36}$/.test(eventId)) return NextResponse.json({ error: "Missing event" }, { status: 400 });
    const [{ data: ev }, { data, error }] = await Promise.all([
      db.from("events").select("title,starts_at").eq("id", eventId).maybeSingle(),
      db.from("event_registrations").select("name,email,status,user_id,created_at").eq("event_id", eventId).order("created_at").limit(10000),
    ]);
    if (!ev || error) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const rows = data ?? [];
    await db.rpc("log_admin_action", { p_action: "export.registrations", p_summary: `Exported ${rows.length} registrations for "${ev.title}" (${format})` });
    const columns: ExportColumn<(typeof rows)[number]>[] = [
      { header: "Name", value: (r) => r.name, width: 26 },
      { header: "Email", value: (r) => r.email, width: 32 },
      { header: "Status", value: (r) => r.status },
      { header: "Has account", value: (r) => Boolean(r.user_id) },
      { header: "Registered", value: (r) => stamped(r.created_at), width: 22 },
    ];
    return exportResponse({ format, filename: `registrations-${slugify(ev.title) || "event"}-${stamp()}`, sheetName: "Registrations", columns, rows });
  }

  if (kind === "messages") {
    if (!admin) return NextResponse.json({ error: "Admins only" }, { status: 403 });
    const { data, error } = await db.from("contact_messages").select("name,email,subject,message,status,created_at").order("created_at", { ascending: false }).limit(10000);
    if (error) return NextResponse.json({ error: "Export failed" }, { status: 500 });
    const rows = data ?? [];
    await db.rpc("log_admin_action", { p_action: "export.messages", p_summary: `Exported ${rows.length} messages (${format})` });
    const columns: ExportColumn<(typeof rows)[number]>[] = [
      { header: "Received", value: (m) => stamped(m.created_at), width: 22 },
      { header: "Name", value: (m) => m.name, width: 24 },
      { header: "Email", value: (m) => m.email, width: 30 },
      { header: "Subject", value: (m) => m.subject, width: 30 },
      { header: "Message", value: (m) => m.message, width: 60 },
      { header: "Status", value: (m) => m.status },
    ];
    return exportResponse({ format, filename: `ypf-messages-${stamp()}`, sheetName: "Messages", columns, rows });
  }

  return NextResponse.json({ error: "Unknown export" }, { status: 404 });
}
