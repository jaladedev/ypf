"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/layout/section";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => console.error(error), [error]);
  return (
    <Section>
      <div role="alert" className="mx-auto max-w-lg py-10 text-center">
        <h1 className="text-h1 text-ink">Something went wrong</h1>
        <p className="text-ink-muted mt-3">
          We couldn&apos;t load this page. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/" variant="secondary">
            Go home
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
