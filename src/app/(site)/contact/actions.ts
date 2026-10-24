"use server";

import { createClient } from "@/lib/supabase/server";
import { adminNotifyEmails, esc, sendEmail } from "@/lib/email/resend";
import { contactSchema } from "@/lib/validation";

export type ContactState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "subject" | "message", string>>;
};

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") || undefined,
    message: formData.get("message"),
    website: formData.get("website") || undefined,
  });
  if (!parsed.success) {
    // A filled honeypot looks like success to the bot.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { ok: true };
    const f = parsed.error.flatten().fieldErrors;
    return {
      fieldErrors: {
        name: f.name?.[0],
        email: f.email?.[0],
        subject: f.subject?.[0],
        message: f.message?.[0],
      },
    };
  }
  const { name, email, subject, message } = parsed.data;

  const db = await createClient();
  const { error } = await db
    .from("contact_messages")
    .insert({ name, email, subject: subject ?? null, message });
  if (error) {
    console.error("contact_messages insert", error);
    return { error: "We couldn't send your message. Please try again in a moment." };
  }

  const admins = adminNotifyEmails();
  if (admins.length) {
    await sendEmail({
      to: admins,
      replyTo: email,
      subject: `YPF website message: ${subject ?? "No subject"}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p><p>${esc(message).replace(/\n/g, "<br>")}</p>`,
    });
  }
  return { ok: true };
}
