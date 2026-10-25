import { FormAlert } from "@/components/ui/form-alert";

const messages: Record<string, string> = {
  saved: "Saved.",
  published: "Published. It's live on the site.",
  draft: "Moved back to drafts. It is no longer public.",
  archived: "Archived. It is no longer public.",
  deleted: "Deleted.",
  removed: "Removed.",
  duplicated: "Duplicated as a draft. Review it and publish when ready.",
  read: "Marked as read.",
  replied: "Marked as replied.",
  role: "Role updated.",
  status: "Membership status updated.",
  moved: "Order updated.",
};

/** Success banner driven by ?saved=<code> after a redirect from a server action. */
export function Flash({ code }: { code?: string | string[] }) {
  const c = Array.isArray(code) ? code[0] : code;
  return c && messages[c] ? <FormAlert message={messages[c]} /> : null;
}
