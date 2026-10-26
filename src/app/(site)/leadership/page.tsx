import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { LeaderCard } from "@/components/domain/leader-card";
import { getLeaders, type Leader } from "@/lib/data/site";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Leadership",
  description:
    "Meet the executives and coordinators of the Young Planners Forum, Oyo State.",
};

function Grid({ leaders }: { leaders: Leader[] }) {
  if (!leaders.length)
    return (
      <EmptyState
        title="Nothing to show yet"
        description="Leaders will be listed here."
      />
    );
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {leaders.map((l) => (
        <li key={`${l.name}-${l.role_title}`}>
          <LeaderCard leader={l} />
        </li>
      ))}
    </ul>
  );
}

export default async function LeadershipPage() {
  const leaders = await getLeaders();
  return (
    <>
      <PageHero
        title="Our leadership"
        subtitle="The volunteers who run YPF."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Leadership" }]}
      />
      <Section>
        <Tabs
          label="Leadership groups"
          tabs={[
            {
              id: "executives",
              label: "Executive committee",
              content: (
                <Grid leaders={leaders.filter((l) => l.group === "national_executive")} />
              ),
            },
            {
              id: "coordinators",
              label: "Coordinators",
              content: (
                <Grid leaders={leaders.filter((l) => l.group === "coordinator")} />
              ),
            },
          ]}
        />
      </Section>
    </>
  );
}
