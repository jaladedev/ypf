"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { formatDate, formatTimeRange } from "@/lib/format";
import { eventRegistrationSchema } from "@/lib/validation";

export type RegisterState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: { name?: string; email?: string };
};

export async function registerForEvent(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const eventId = String(formData.get("event_id") ?? "");
  const parsed = eventRegistrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { fieldErrors: { name: f.name?.[0], email: f.email?.[0] } };
  }
  if (!/^[0-9a-f-]{36}$/i.test(eventId))
    return { error: "Something went wrong. Please try again." };

  // Cookie client: if the visitor is signed in the registration is linked to their account.
  const db = await createClient();
  const { error } = await db.rpc("register_for_event", {
    p_event_id: eventId,
    p_name: parsed.data.name,
    p_email: parsed.data.email,
  });
  if (error) {
    // P0001 / P0002 messages are written for visitors; anything else is not.
    const friendly = error.code === "P0001" || error.code === "P0002";
    if (!friendly) console.error("register_for_event", error);
    return {
      error: friendly
        ? error.message
        : "We couldn't complete your registration. Please try again.",
    };
  }

  const { data: ev } = await db
    .from("events")
    .select("title,starts_at,ends_at,venue,city")
    .eq("id", eventId)
    .maybeSingle();
  if (ev) {
    const where = [ev.venue, ev.city].filter(Boolean).join(", ");
    await sendEmail({
      to: parsed.data.email,
      subject: `You're registered: ${ev.title}`,
      text: `Hi ${parsed.data.name},\n\nYou're registered for ${ev.title}.\n\nWhen: ${formatDate(ev.starts_at)}, ${formatTimeRange(ev.starts_at, ev.ends_at)}${where ? `\nWhere: ${where}` : ""}\n\nSee you there,\nYoung Planners Forum`,
    });
  }
  return { ok: true };
}
