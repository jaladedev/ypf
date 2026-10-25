import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Markdown } from "@/components/ui/markdown";

export const metadata: Metadata = { title: "Privacy Policy" };

// DRAFT text. Have it reviewed by a legal professional before launch (TODO.md, Phase 6).
const body = `## Who we are

The Young Planners Forum (YPF) is the young professionals' network of the Nigerian Institute of Town Planners (NITP). We run this website and decide how the personal data on it is used (the "data controller").

## What we collect and why

- **Membership applications and profiles:** name, phone number, state, institution, course, career stage, specialisation, organisation, LinkedIn link, NITP number (if any), your reasons for joining, and your account email. We use these to review your application, run your membership and contact you about it.
- **Event registrations:** name and email, to confirm your place and share event updates.
- **Contact messages:** name, email, subject and message, to reply to you.
- **Technical data:** a sign-in cookie, and a one-way scrambled form of your network address used only to limit abuse of our forms. We don't use advertising or tracking cookies.

Our legal basis is your consent (given when you apply or submit a form) and, for running your membership, our legitimate interest in managing the forum.

## Who can see it

Only forum administrators can see members' details and messages. Editors can see event registrations for the events they manage. Member details are never published on this website. We use service providers to run the site (hosting, database and email delivery), who process data on our behalf. We do not sell your personal data.

## How long we keep it

We keep membership records while you are a member and for a reasonable period afterwards. Contact messages and event registrations are kept for as long as needed to deal with them and for our records, and are deleted on request.

## Your rights

Under the Nigeria Data Protection Act 2023 you can ask to see the data we hold about you, have it corrected or deleted, object to or restrict how we use it, and withdraw your consent at any time. Use the contact page to make a request. You can also complain to the Nigeria Data Protection Commission.

## Cookies

We use cookies only to keep you signed in.

## Changes

We will update this page if we change how we handle personal data.`;

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
