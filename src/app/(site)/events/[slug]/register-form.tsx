"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";
import { FormAlert } from "@/components/ui/form-alert";
import { registerForEvent, type RegisterState } from "./actions";

export function RegisterForm({
  eventId,
  defaultName,
  defaultEmail,
}: {
  eventId: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(
    registerForEvent,
    {},
  );

  if (state.ok) {
    return (
      <div
        role="status"
        className="bg-brand-50 text-brand-900 rounded-control flex gap-3 p-4"
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">You&apos;re registered!</p>
          <p className="mt-1 text-sm">We&apos;ve sent a confirmation to your email.</p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="event_id" value={eventId} />
      <Input
        label="Full name"
        name="name"
        autoComplete="name"
        required
        requiredMark
        defaultValue={defaultName}
        error={state.fieldErrors?.name}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        requiredMark
        defaultValue={defaultEmail}
        error={state.fieldErrors?.email}
      />
      <FormAlert error={state.error} />
      <Button type="submit" className="w-full" loading={pending}>
        Register now
      </Button>
    </form>
  );
}
