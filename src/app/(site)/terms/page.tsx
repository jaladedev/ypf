import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Markdown } from "@/components/ui/markdown";

export const metadata: Metadata = { title: "Terms of Use" };

// DRAFT text. Have it reviewed by a legal professional before launch (TODO.md, Phase 6).
const body = `## Using this website

This website is run by the Young Planners Forum of the Nigerian Institute of Town Planners. By using it you agree to these terms.

## Membership

Membership is open to young planners and is subject to approval by forum administrators. We may suspend or end membership for conduct that harms the forum or its members.

## Jobs and external links

Job listings and links to other websites are provided for information. YPF is not responsible for the content or hiring decisions of third parties.

## Content

Content on this site belongs to YPF or its contributors. Please do not copy it for commercial use without permission.

## Changes

We may update these terms. Continued use means you accept the updated terms.`;

export default function Page() {
  return (
    <>
      <PageHero
        title="Terms of Use"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms of Use" }]}
      />
      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="bg-warning-50 text-warning-700 rounded-control mb-6 p-3 text-sm">
            Draft: this page is being finalised.
          </p>
          <Markdown>{body}</Markdown>
        </div>
      </Section>
    </>
  );
}
