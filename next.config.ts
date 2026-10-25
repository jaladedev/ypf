import type { NextConfig } from "next";

// Supabase Storage host, e.g. abcdxyz.supabase.co (derived from the project URL).
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";
const isDev = process.env.NODE_ENV !== "production";
// HTTPS-only rules (upgrade requests, HSTS) apply on a real deployment, not a local http stack.
const httpsDeploy = !isDev && (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

/**
 * Content Security Policy. Next.js injects small inline scripts for hydration, so
 * script-src needs 'unsafe-inline' (a nonce-based policy would force every page to be
 * rendered per request and lose caching). Everything else is locked down: no plugins,
 * no framing, no foreign scripts, connections only to this site and Supabase.
 * form-action is left open on purpose: Google sign-in redirects through Supabase.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${isDev ? "ws:" : ""}`.trim(),
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  ...(httpsDeploy ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(httpsDeploy ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Cache Components is intentionally off: every authenticated page reads the
  // session cookie, and we want the conventional request-time rendering model.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: process.env.NEXT_PUBLIC_SUPABASE_URL!.startsWith("http://") ? "http" : "https",
            hostname: supabaseHost,
            port: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).port,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
