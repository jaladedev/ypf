import type { Metadata } from "next";
import { Eye, Handshake, Lightbulb, Target } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Section, SectionHeading } from "@/components/layout/section";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About the ${siteConfig.name} of the ${siteConfig.parent}: our story, mission and values.`,
};

// Draft copy: replace with the forum's approved text before launch.
const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    text: "Fresh ideas and new tools applied to planning problems.",
  },
  {
    icon: Handshake,
    title: "Collaboration",
    text: "Working across institutions, professions and communities.",
  },
  {
    icon: Target,
    title: "Integrity",
    text: "Professional ethics and accountability in practice.",
  },
  {
    icon: Eye,
    title: "Inclusion",
    text: "A place for young planners from every part of Nigeria.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About YPF"
        subtitle={`The youth wing of the ${siteConfig.parent}.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />
      <Section>
        <div className="mx-auto max-w-3xl space-y-4">
          <SectionHeading title="Our story" />
          <p className="text-ink-muted">
            The Young Planners Forum was formed to give students, graduates and
            early-career town planners a structured place within the Nigerian Institute of
            Town Planners (NITP). It connects them with experienced professionals, helps
            them prepare for professional registration, and gives them a voice in national
            planning conversations.
          </p>
          <p className="text-ink-muted">
            Today YPF runs training, mentorship, outreach and networking programmes, and
            shares jobs and opportunities with its members.
          </p>
        </div>
      </Section>
      <Section tone="surface">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-card border-line shadow-card border bg-white p-6">
            <h2 className="text-h3 text-ink">Our mission</h2>
            <p className="text-ink-muted mt-2">
              To equip and connect young planners so they can shape sustainable, inclusive
              and well-planned Nigerian towns and cities.
            </p>
          </div>
          <div className="rounded-card border-line shadow-card border bg-white p-6">
            <h2 className="text-h3 text-ink">Our vision</h2>
            <p className="text-ink-muted mt-2">
              A generation of skilled, ethical planners leading the future of
              Nigeria&apos;s built environment.
            </p>
          </div>
        </div>
      </Section>
      <Section>
        <SectionHeading title="What we value" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-card border-line border p-5">
              <span className="bg-brand-50 text-brand-700 grid size-10 place-items-center rounded-full">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-ink mt-3 font-semibold">{title}</h3>
              <p className="text-ink-muted mt-1 text-sm">{text}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section tone="dark">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="text-h2">Be part of the next generation of planners.</h2>
          <ButtonLink href="/join" variant="accent" size="lg">
            Join YPF
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
