import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Card, CardBody } from "@/components/ui/card";
import { getSiteSettings } from "@/lib/data/site";
import { ContactForm } from "./contact-form";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Young Planners Forum.",
};

export default async function ContactPage() {
  const { contact, social } = await getSiteSettings();
  const rows = [
    { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    {
      icon: Phone,
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
    },
    { icon: MapPin, label: "Address", value: contact.address },
    { icon: Clock, label: "Office hours", value: contact.hours },
  ].filter((r) => r.value);

  return (
    <>
      <PageHero
        title="Contact us"
        subtitle="Questions, partnerships or feedback? We'd love to hear from you."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <Card>
            <CardBody>
              <h2 className="text-h3 text-ink mb-4">Send us a message</h2>
              <ContactForm />
            </CardBody>
          </Card>
          <aside className="space-y-4">
            <Card>
              <CardBody className="space-y-4 text-sm">
                <h2 className="text-h3 text-ink">Contact details</h2>
                {rows.length ? (
                  <ul className="space-y-3">
                    {rows.map(({ icon: Icon, label, value, href }) => (
                      <li key={label} className="flex gap-3">
                        <Icon
                          className="text-brand-700 mt-0.5 size-4 shrink-0"
                          aria-hidden
                        />
                        <div>
                          <p className="text-ink-muted text-xs">{label}</p>
                          {href ? (
                            <a
                              href={href}
                              className="text-brand-700 font-medium hover:underline"
                            >
                              {value}
                            </a>
                          ) : (
                            <p className="text-ink">{value}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ink-muted">Use the form to reach us.</p>
                )}
                {Object.keys(social).length ? (
                  <div className="border-line border-t pt-3">
                    <p className="text-ink-muted mb-2 text-xs">Follow us</p>
                    <ul className="flex flex-wrap gap-3">
                      {Object.entries(social).map(([k, v]) => (
                        <li key={k}>
                          <a
                            href={v}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-700 font-medium capitalize hover:underline"
                          >
                            {k}
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardBody>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  );
}
