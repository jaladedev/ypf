"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/form-controls";
import { changePassword, requestDeletion, type SettingsState } from "./actions";

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

export function DeletionForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    () => requestDeletion(),
    {},
  );
  return (
    <form action={action} className="max-w-md space-y-4">
      <FormAlert error={state.error} message={state.message} />
      <Button type="submit" variant="danger" loading={pending}>
        Request account deletion
      </Button>
    </form>
  );
}
