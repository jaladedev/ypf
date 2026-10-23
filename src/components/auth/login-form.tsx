"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  signInWithGoogle,
  signInWithMagicLink,
  signInWithPassword,
  type ActionState,
} from "@/app/login/actions";

const initial: ActionState = {};

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/30";
const primaryButton =
  "w-full rounded-md bg-green-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-900 disabled:opacity-60";

function Feedback({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <p role="alert" className="text-sm text-red-700">
        {state.error}
      </p>
    );
  if (state.message)
    return (
      <p role="status" className="text-sm text-green-800">
        {state.message}
      </p>
    );
  return null;
}

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
        <button
          type="submit"
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
        >
          Continue with Google
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-gray-200" />
        or
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      {mode === "password" ? (
        <form action={passwordAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-green-800 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </div>
          <Feedback state={passwordState} />
          <button type="submit" disabled={passwordPending} className={primaryButton}>
            {passwordPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <form action={magicAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-1.5">
            <label htmlFor="magic-email" className="text-sm font-medium">
              Email address
            </label>
            <input
              id="magic-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>
          <Feedback state={magicState} />
          <button type="submit" disabled={magicPending} className={primaryButton}>
            {magicPending ? "Sending…" : "Email me a sign-in link"}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => setMode(mode === "password" ? "magic" : "password")}
        className="w-full text-center text-sm text-green-800 hover:underline"
      >
        {mode === "password" ? "Use a magic link instead" : "Use a password instead"}
      </button>
    </div>
  );
}
