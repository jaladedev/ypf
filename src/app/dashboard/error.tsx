"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

/** Shown inside the admin shell when a page fails to load or a request is refused. */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return (
    <div role="alert" className="rounded-card border-line mx-auto max-w-lg space-y-3 border bg-white p-8 text-center">
      <h1 className="text-h2 text-ink">{offline ? "You appear to be offline" : "This page couldn't load"}</h1>
      <p className="text-ink-muted text-sm">
        {offline
          ? "Check your connection, then try again. Your changes weren't lost on the server; try again once you are back online."
          : "Something went wrong on our side. Try again; if it keeps happening, tell the site maintainer."}
        {error.digest ? <span className="mt-2 block font-mono text-xs">Reference: {error.digest}</span> : null}
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/dashboard" variant="secondary">Member area</ButtonLink>
      </div>
    </div>
  );
}
