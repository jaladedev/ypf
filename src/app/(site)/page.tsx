import { PageHero } from "@/components/layout/page-hero";
import { ButtonLink } from "@/components/ui/button";

// Temporary home page: just the hero. The full home page is built in Phase 3.
export default function Home() {
  return (
    <PageHero
      size="lg"
      title={
        <>
          Empowering Young Planners for a{" "}
          <span className="text-highlight">Sustainable Nigeria</span>
        </>
      }
      subtitle="The Young Planners Forum (YPF) is a network of young and emerging planning professionals committed to building sustainable cities."
      actions={
        <>
          <ButtonLink href="/join" variant="accent" size="lg">
            Join YPF
          </ButtonLink>
          <ButtonLink href="/about" variant="outline-light" size="lg">
            Learn more
          </ButtonLink>
        </>
      }
    />
  );
}
