"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/form-controls";
import { changeEmail, changePassword, deleteAccount, type SettingsState } from "./actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    changePassword,
    {},
  );
  return (
    <form action={action} className="max-w-md space-y-4">
      <Input
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        hint="At least 8 characters."
      />
      <Input
        label="Confirm new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <FormAlert error={state.error} message={state.message} />
      <Button type="submit" loading={pending}>
        Change password
      </Button>
    </form>
  );
}

export function EmailForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(changeEmail, {});
  return (
    <form action={action} className="max-w-md space-y-4">
      <Input
        label="New email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        hint={`Currently ${current}`}
      />
      <FormAlert error={state.error} message={state.message} />
      <Button type="submit" loading={pending}>
        Change email
      </Button>
    </form>
  );
}

export function DeletionForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(deleteAccount, {});
  return (
    <form action={action} className="max-w-md space-y-4">
      <Input
        label="Type DELETE to confirm"
        name="confirm"
        autoComplete="off"
        required
        hint="This removes your account, profile, saved jobs and event registrations permanently."
      />
      <FormAlert error={state.error} message={state.message} />
      <Button type="submit" variant="danger" loading={pending}>
        Delete my account
      </Button>
    </form>
  );
}
