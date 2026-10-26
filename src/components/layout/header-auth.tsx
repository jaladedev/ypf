"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Button, ButtonLink, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * Reads the session cookie in the browser so public pages can stay cached.
 * null = not known yet (first paint), then true/false.
 */
export function useSignedIn() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    try {
      const db = createClient();
      db.auth
        .getSession()
        .then(({ data }) => live && setSignedIn(!!data.session))
        .catch(() => live && setSignedIn(false));
      const { data } = db.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
      return () => {
        live = false;
        data.subscription.unsubscribe();
      };
    } catch {
      /* keep the neutral state */
    }
  }, []);
  return signedIn;
}

function SignOutButton({ size = "sm", className }: { size?: ButtonSize; className?: string }) {
  return (
    <form action="/auth/signout" method="post" className={className}>
      <Button type="submit" variant="secondary" size={size} className="w-full">
        Sign out
      </Button>
    </form>
  );
}

export function HeaderAuth() {
  const signedIn = useSignedIn();
  // Hidden (but laid out) until we know, so there is no flash of the wrong buttons.
  const hidden = signedIn === null ? "invisible" : "";
  if (signedIn)
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <ButtonLink href="/dashboard" size="sm">
          My dashboard
        </ButtonLink>
        <SignOutButton />
      </div>
    );
  return (
    <div className={`hidden items-center gap-2 lg:flex ${hidden}`}>
      <Link
        href="/login"
        className="rounded-control text-ink-muted hover:text-ink px-3 py-2 text-sm font-medium"
      >
        Sign in
      </Link>
      <ButtonLink href="/join" size="sm">
        Join YPF
      </ButtonLink>
    </div>
  );
}

export function MobileAuth({ onNavigate }: { onNavigate: () => void }) {
  const signedIn = useSignedIn();
  if (signedIn)
    return (
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ButtonLink href="/dashboard" onClick={onNavigate}>
          My dashboard
        </ButtonLink>
        <SignOutButton size="md" />
      </div>
    );
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <ButtonLink href="/login" variant="secondary" onClick={onNavigate}>
        Sign in
      </ButtonLink>
      <ButtonLink href="/join" onClick={onNavigate}>
        Join YPF
      </ButtonLink>
    </div>
  );
}

/** "Join YPF" call-to-action that disappears once you're signed in. */
export function JoinButton({
  variant = "primary",
  size = "md",
  children = "Join YPF",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}) {
  const signedIn = useSignedIn();
  if (signedIn) return null;
  return (
    <ButtonLink href="/join" variant={variant} size={size}>
      {children}
    </ButtonLink>
  );
}

/** Shows `member` to signed-in visitors and `guest` to everyone else. */
export function AuthSwitch({ guest, member }: { guest: ReactNode; member?: ReactNode }) {
  const signedIn = useSignedIn();
  return <>{signedIn ? (member ?? null) : guest}</>;
}
