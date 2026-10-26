import Link from "next/link";
import { AuthSwitch } from "./header-auth";
import { Container } from "./container";
import { Logo } from "./logo";
import { footerNav, siteConfig } from "@/lib/site";

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => {
          const item = (href: string, label: string) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm text-white/75 hover:text-white hover:underline"
              >
                {label}
              </Link>
            </li>
          );
          if (l.href === "/join") return <AuthSwitch key={l.href} guest={item(l.href, l.label)} />;
          if (l.href === "/login")
            return (
              <AuthSwitch
                key={l.href}
                guest={item(l.href, l.label)}
                member={item("/dashboard", "My dashboard")}
              />
            );
          return item(l.href, l.label);
        })}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="on-dark bg-brand-950 text-white">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <Logo tone="light" />
          <p className="text-sm text-white/75">
            {siteConfig.tagline}. A forum of the {siteConfig.parent} (NITP).
          </p>
        </div>
        <LinkColumn title="Explore" links={footerNav.explore} />
        <LinkColumn title="Get involved" links={footerNav.getInvolved} />
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-5 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex gap-5">
            {footerNav.legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
