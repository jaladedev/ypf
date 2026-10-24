import { ButtonLink } from "@/components/ui/button";
import { SiteShell } from "@/components/layout/site-shell";
import { Section } from "@/components/layout/section";

export default function NotFound() {
  return (
    <SiteShell>
      <Section>
        <div className="mx-auto max-w-lg py-10 text-center">
          <p className="text-brand-700 font-semibold">404</p>
          <h1 className="text-h1 text-ink mt-2">Page not found</h1>
          <p className="text-ink-muted mt-3">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <ButtonLink href="/">Go home</ButtonLink>
            <ButtonLink href="/events" variant="secondary">
              See events
            </ButtonLink>
          </div>
        </div>
      </Section>
    </SiteShell>
  );
}
