export const siteConfig = {
  name: "Young Planners Forum",
  shortName: "YPF",
  parent: "Nigerian Institute of Town Planners",
  tagline: "Empowering young planners for a sustainable Nigeria",
  description:
    "The Young Planners Forum (YPF) of the Nigerian Institute of Town Planners: a network of young and emerging planning professionals building sustainable cities.",
} as const;

/** Primary navigation (header). */
export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/leadership", label: "Leadership" },
  { href: "/events", label: "Events" },
  { href: "/jobs", label: "Jobs" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
] as const;

export const footerNav = {
  explore: [
    { href: "/about", label: "About YPF" },
    { href: "/leadership", label: "Leadership" },
    { href: "/events", label: "Events" },
    { href: "/news", label: "News & updates" },
  ],
  getInvolved: [
    { href: "/join", label: "Join YPF" },
    { href: "/jobs", label: "Jobs & opportunities" },
    { href: "/contact", label: "Contact us" },
    { href: "/login", label: "Member sign in" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Use" },
  ],
} as const;
