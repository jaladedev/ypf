"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/** Reads the session cookie in the browser so public pages can stay cached. */
function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    let live = true;
    try {
      const db = createClient();
      db.auth.getSession().then(({ data }) => live && setSignedIn(!!data.session));
      const { data } = db.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
      return () => {
        live = false;
        data.subscription.unsubscribe();
      };
    } catch {
      /* stay on the signed-out buttons */
    }
  }, []);
  return signedIn;
}

export function HeaderAuth() {
  const signedIn = useSignedIn();
  if (signedIn)
    return (
      <ButtonLink href="/dashboard" size="sm" className="hidden lg:inline-flex">
        My dashboard
      </ButtonLink>
    );
  return (
    <>
      <Link
        href="/login"
        className="rounded-control text-ink-muted hover:text-ink hidden px-3 py-2 text-sm font-medium lg:block"
      >
        Sign in
      </Link>
      <ButtonLink href="/join" size="sm" className="hidden lg:inline-flex">
        Join YPF
      </ButtonLink>
    </>
  );
}

export function MobileAuth({ onNavigate }: { onNavigate: () => void }) {
  const signedIn = useSignedIn();
  if (signedIn)
    return (
      <div className="mt-4">
        <ButtonLink href="/dashboard" onClick={onNavigate} className="w-full">
          My dashboard
        </ButtonLink>
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
