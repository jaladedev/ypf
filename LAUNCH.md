# YPF launch checklist

What the code already does is in TODO.md (Phase 6). This list is what only you can do: it needs your accounts, domain or real devices.

## 0. Domain
- [x] Decision: launch on the free Vercel address for now. Below, `YOUR-DOMAIN` means `your-project.vercel.app` (shown on the Vercel project page after the first deploy). Use that exact URL, with https and no trailing slash, for `NEXT_PUBLIC_SITE_URL`, then redeploy once so sitemap, canonical links and Open Graph use it.
- [ ] Later: buy a custom domain, add it in Vercel, and repeat the "URL" steps in sections 1 and 3 (Supabase Site URL and redirects, Google OAuth redirect if you added the site origin, `NEXT_PUBLIC_SITE_URL`). Nothing in the code is tied to a domain.
- **Email limit on vercel.app:** you can't add DNS records to a vercel.app address, so Resend can't verify it. Until you own a domain, Resend only sends from its test address to your own account email, which means contact, registration and approval emails won't reach other people. Supabase's built-in auth emails work but are heavily rate-limited (a few per hour). Fine for a private preview; get a domain before a public launch.

## 1. Supabase (production project)
- [x] Project `ypf-website` created (ref `onevajmpaezfsgiofbpj`, region eu-west-2, API `https://onevajmpaezfsgiofbpj.supabase.co`). Migrations 1 to 10 applied, buckets `avatars` and `media` exist, default site settings inserted. No sample events/leaders were loaded (`seed.sql` is for development only).
- [ ] Copy keys into Vercel: URL above, the anon/publishable key (Project Settings > API), and the **service_role** key (secret, server-only).
- [ ] Authentication > URL configuration: Site URL = `https://YOUR-DOMAIN`; add redirect URLs `https://YOUR-DOMAIN/auth/callback` and `https://YOUR-DOMAIN/join/complete` (optionally `https://*-YOUR-TEAM.vercel.app/**` for preview deployments).
- [ ] Authentication > Providers > Google: add the OAuth client ID/secret; in Google Cloud add the Supabase callback URL (`https://<project>.supabase.co/auth/v1/callback`) as an authorised redirect.
- [ ] Authentication > SMTP: use Resend SMTP so auth emails come from your domain.
- [ ] Create the first admin (README, "First admin").
- [ ] Turn on daily backups (Pro plan) or schedule `pg_dump`; do one test restore.

## 2. Email (Resend)
- [ ] Add and verify your domain; publish the SPF, DKIM and DMARC DNS records Resend shows (start DMARC at `p=none`).
- [ ] Set `RESEND_API_KEY` and the from address; send test signup, approval, registration and contact emails.

## 3. Vercel
- [ ] Import the repo; set env vars from `.env.example`: Supabase URL, anon key, service-role key (server only, never `NEXT_PUBLIC_`), `NEXT_PUBLIC_SITE_URL=https://YOUR-DOMAIN`, Resend vars, `CRON_SECRET` (long random), `RATE_LIMIT_SALT` (long random).
- [ ] Add the domain; confirm HTTPS (HSTS switches on automatically when the site URL is https).
- [ ] Confirm the cron appears (Settings > Cron Jobs, daily 02:00 UTC) and run it once; it archives jobs closed 14+ days and clears old rate-limit rows.

## 4. Verify in production
- [ ] Sign up, confirm email, apply, approve as admin, sign in as the member.
- [ ] Google sign-in; magic link; password reset.
- [ ] Register for an event signed out and signed in; submit the contact form; check emails arrive (not spam).
- [ ] Change email on a test account (confirmation link arrives); delete a test account.
- [ ] Upload an avatar and a media image; check they display.
- [ ] Run Lighthouse on the live home page (mobile). Sandbox result was performance 88, accessibility 100, best-practices 100, SEO 92 on a throttled local run.
- [ ] Real-device pass: a small Android and an iPhone (join form, menu, event registration, admin on phone), plus a slow-3G check.
- [ ] Submit `https://YOUR-DOMAIN/sitemap.xml` to Google Search Console.

## 5. Content and legal
- [ ] Have a lawyer review Privacy and Terms (NDPA 2023); then remove the "Draft" banner on `/privacy` and `/terms`.
- [ ] Replace placeholder skyline images and add the logo; the Open Graph image is generated (edit `src/app/opengraph-image.tsx` for a branded one).
- [ ] Fill About text and real figures in Admin > Settings.

## 6. Monitoring
- [ ] Error monitoring (e.g. Sentry free tier) on Vercel.
- [ ] Privacy-friendly analytics (Plausible, or Vercel Analytics); if you add one, add its host to the CSP in `next.config.ts`.
- [ ] Uptime check on the home page.
