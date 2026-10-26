import "server-only";
import { esc, sendEmail } from "./resend";

const site = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const sign = "\n\nYoung Planners Forum, Oyo State\nNigerian Institute of Town Planners";

export function sendApplicationReceived(to: string, name: string) {
  return sendEmail({
    to,
    subject: "We've received your YPF membership application",
    text: `Hi ${name},\n\nThanks for applying to join the Young Planners Forum. An admin will review your application and we'll email you once there's a decision.${sign}`,
  });
}

export function sendNewApplicationNotice(to: string[], name: string, id: string) {
  const url = `${site()}/admin/applications/${id}`;
  return sendEmail({
    to,
    subject: `New YPF membership application: ${name}`,
    text: `${name} has applied to join YPF.\n\nReview it: ${url}`,
    html: `<p><strong>${esc(name)}</strong> has applied to join YPF.</p><p><a href="${esc(url)}">Review the application</a></p>`,
  });
}

export function sendApplicationDecision(
  to: string,
  name: string,
  decision: "approved" | "rejected",
  note?: string | null,
) {
  if (decision === "approved") {
    return sendEmail({
      to,
      subject: "Welcome to the Young Planners Forum",
      text: `Hi ${name},\n\nYour membership has been approved. Sign in to see your member dashboard:\n${site()}/dashboard${sign}`,
    });
  }
  return sendEmail({
    to,
    subject: "Your YPF membership application",
    text: `Hi ${name},\n\nThank you for your interest in the Young Planners Forum. We weren't able to approve your application this time.${note ? `\n\nNote from the reviewer: ${note}` : ""}\n\nYou can update your details and apply again at ${site()}/join, or contact us if you have questions.${sign}`,
  });
}
