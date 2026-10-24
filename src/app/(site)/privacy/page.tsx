import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Markdown } from "@/components/ui/markdown";

export const metadata: Metadata = { title: "Privacy Policy" };

// DRAFT text. Have it reviewed by a legal professional before launch (TODO.md, Phase 6).
const body = `## What we collect

When you join YPF, register for an event, apply for a job link or contact us, we collect the details you give us: name, email address and, for members, profile and professional details such as institution and specialisation.

## How we use it

We use your details to run the forum: to review membership applications, confirm event registrations, reply to messages and send updates you have asked for. We do not sell your personal data.

## Who can see it

Only forum administrators can see members' details and messages. Members' details are not published on this website.

## Your choices

You can ask us to correct or delete your information at any time through the contact page.

## Cookies

We use cookies only to keep you signed in.`;

export default function Page() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
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
