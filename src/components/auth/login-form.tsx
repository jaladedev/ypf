"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  signInWithGoogle,
  signInWithMagicLink,
  signInWithPassword,
  type ActionState,
} from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/form-controls";

const initial: ActionState = {};

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [passwordState, passwordAction, passwordPending] = useActionState(
    signInWithPassword,
    initial,
  );
  const [magicState, magicAction, magicPending] = useActionState(
    signInWithMagicLink,
    initial,
  );

  return (
    <div className="space-y-5">
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <Button
          type="submit"
          variant="secondary"
          className="border-line text-ink hover:bg-surface w-full"
        >
          Continue with Google
        </Button>
      </form>

      <div className="text-ink-muted flex items-center gap-3 text-xs">
        <span className="bg-line h-px flex-1" />
        or
        <span className="bg-line h-px flex-1" />
      </div>

      {mode === "password" ? (
        <form action={passwordAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <div className="space-y-1.5">
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-brand-700 text-xs font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <FormAlert error={passwordState.error} message={passwordState.message} />
          <Button type="submit" loading={passwordPending} className="w-full">
            {passwordPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      ) : (
        <form action={magicAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <FormAlert error={magicState.error} message={magicState.message} />
          <Button type="submit" loading={magicPending} className="w-full">
            {magicPending ? "Sending…" : "Email me a sign-in link"}
          </Button>
        </form>
      )}

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setMode(mode === "password" ? "magic" : "password")}
      >
        {mode === "password" ? "Use a magic link instead" : "Use a password instead"}
      </Button>
    </div>
  );
}
