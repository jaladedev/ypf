import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { DeletionForm, EmailForm, PasswordForm } from "./settings-forms";

export const metadata: Metadata = { title: "Account settings", robots: { index: false } };

export default async function SettingsPage() {
  const { user } = await requireUser("/dashboard/settings");
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-h1 text-ink">Account settings</h1>
        <p className="text-ink-muted mt-1">Signed in as {user.email}</p>
      </div>
      <section className="space-y-4" aria-labelledby="em">
        <h2 id="em" className="text-h3 text-ink">
          Email address
        </h2>
        <EmailForm current={user.email ?? ""} />
      </section>
      <section className="space-y-4" aria-labelledby="pw">
        <h2 id="pw" className="text-h3 text-ink">
          Password
        </h2>
        <PasswordForm />
      </section>
      <section className="space-y-4" aria-labelledby="del">
        <h2 id="del" className="text-h3 text-ink">
          Delete my account
        </h2>
        <p className="text-ink-muted max-w-xl text-sm">
          Permanently removes your account and personal data. This can\u2019t be undone.
        </p>
        <DeletionForm />
      </section>
    </div>
  );
}
