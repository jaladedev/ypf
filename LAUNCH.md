# YPF launch checklist

What the code already does is in TODO.md (Phase 6). This list is what only you can do: it needs your accounts, domain or real devices.

## 0. Decide
- [ ] Production domain name (open question). Everything below uses `https://YOUR-DOMAIN`.

## 1. Supabase (production project)
- [ ] Create the project; run every file in `supabase/migrations/` in order (1 to 9).
- [ ] Authentication > URL configuration: Site URL = `https://YOUR-DOMAIN`; add redirect URLs `https://YOUR-DOMAIN/auth/callback` and `https://YOUR-DOMAIN/join/complete` (and your Vercel preview pattern if wanted).
- [ ] Authentication > Providers > Google: add the OAuth client ID/secret; in Google Cloud add the Supabase callback URL (`https://<project>.supabase.co/auth/v1/callback`) as an authorised redirect.
- [ ] Authentication > SMTP: use Resend SMTP so auth emails come from your domain.
- [ ] Storage: confirm buckets `avatars` and `media` exist (migration 8) and are public-read.
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
