import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Daily housekeeping, triggered by Vercel Cron (see vercel.json). Vercel sends
 * `Authorization: Bearer $CRON_SECRET`; without that exact secret the route refuses,
 * so it can't be used to hammer the database.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const ok =
    !!secret &&
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await createAdminClient().rpc("run_maintenance");
  if (error) {
    console.error("maintenance", error.message);
    return NextResponse.json({ error: "Maintenance failed" }, { status: 500 });
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, ...data });
}
