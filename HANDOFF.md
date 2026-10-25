# YPF website: handoff for a new chat

Paste this (or attach it with ypf-website.zip and TODO.md) at the start of the new chat.

## Project
Website for the Young Planners Forum (YPF) of the Nigerian Institute of Town Planners. Next.js 16 (App Router, `proxy.ts` not middleware) + TypeScript + Tailwind v4 + Supabase, deployed on Vercel. Single chapter. Owner: Dev (jaladedev). Design reference: 14-screen mockup (home, about, leadership, events, event detail, jobs, job detail, news, article, contact, join, login, member dashboard, admin dashboard).

## Status
- Phases 1-6 code done. Remaining launch work needs the owner (domain, Vercel, Supabase, Resend, devices, legal): `LAUNCH.md`.
- Phase 6 added: migration 9 (`check_rate_limit`, `run_maintenance`), `src/lib/rate-limit.ts`, `/api/cron/maintenance` + `vercel.json`, security headers in `next.config.ts`, SEO files (`robots.ts`, `sitemap.ts`, JSON-LD), Join consent checkbox, error boundaries. Env: `CRON_SECRET`, `RATE_LIMIT_SALT`.
- Carry-over: change-email and self-service deletion, signed-in header state, real photos/logo, OG image.

## Decisions made
Google sign-in at launch; event registration open to anyone (name + email, linked to account if signed in); any young planner can apply, admin approves; hosting Vercel; email via Resend (plain fetch, skips quietly with no key); jobs are admin-posted with external apply link/email; single chapter; admin exports in **CSV and Excel (.xlsx)**. Open: production domain name.

## Standing preferences
Always send changed files to the user (SendUserFile: TODO.md + rebuilt zip + screenshots) after each piece of work. Always update TODO.md. User gives go-aheads as "phase N". Update progress without long recaps.

## Roles and access
Roles member/editor/admin; membership_status pending/approved/rejected/suspended; editor/admin powers need approved status. Three layers: `src/proxy.ts` redirect, `requireApprovedMember/requireEditor/requireAdmin` (src/lib/auth/session.ts), and Postgres RLS (the real boundary). Service-role client (`src/lib/supabase/admin.ts`) only after a permission check.

## Code map (project at /home/claude/ypf-website)
- `supabase/migrations/` 1-7 (schema, RLS, `register_for_event` RPC, saved_jobs), `seed.sql`, `tests/rls.test.mjs` (20 tests, `npm run test:db`).
- `src/lib/data/*` cached public queries (cookie-less client, 5 min revalidate); `src/lib/email/{resend,templates}.ts`; `src/lib/membership.ts` (finalizeApplication); `src/lib/validation.ts` (zod schemas); `src/lib/saved-jobs.ts`.
- Public pages in `src/app/(site)/`; member area `src/app/dashboard/`; admin `src/app/admin/` (temporary layout + `/admin/applications` review; Phase 5 replaces the chrome).
- Design system in `src/components/{ui,layout,domain}`; tokens in `src/app/globals.css`; `/design` showcase (dev only).
- Gotchas: page ids can be stale (pages cached) so actions resolve rows by slug; keep `onMouseDown` focus guard on step buttons; use `PageProps<"/route">` after `npx next typegen`; AGENTS.md says check node_modules/next/dist/docs.

## Phase 5 (done): what exists
- Admin at `src/app/admin/*`: layout/sidebar, dashboard, `members`, `events` (+registrations), `jobs`, `news`, `leadership`, `messages`, `settings`, `media`, `audit`, `applications` (Phase 4), `export/[kind]` (CSV/xlsx route). Each module has `actions.ts` (server actions, `requireEditor`/`requireAdmin` first) plus a client form using `useAdminForm` (`src/components/admin/use-admin-form.ts`: no React form reset on failure, local draft autosave).
- Shared: `src/lib/admin/{util,validation,export,nav,revalidate}.ts`; `revalidatePublicSite()` after every content change; images only accepted from our own storage URLs.
- Migration 8: `audit_log` (trigger-fed), `log_admin_action()`, `admin_list_members()` (emails from auth.users, admin-only), buckets `avatars` + `media` with policies.
- Editors: events, jobs, news, leaders, media, registrations (+export). Admins: also members, roles, messages, settings, audit. Settings are admin-only by design.
- Test stack: `/tmp` stand-in is gone in a new session. Rebuild with local Postgres 16 + PostgREST binary + a small node gateway that fakes Supabase Auth and Storage (storage writes run through the real RLS policies). Background processes get reaped, so start everything in the same command as the tests. Browser suite: 85 checks.

## Known gaps
Storage uploads untested on a hosted project; change-email and self-service deletion still open; Real Supabase Auth round trip (confirmation emails, Google) untested; no live Resend test; About/Privacy/Terms text is draft (legal review in Phase 6); no real photos/logo; header shows Sign in / Join YPF even when signed in; OG image absent.

## Verification setup (lives outside the project, may be gone in a new session)
Real Postgres + PostgREST + a small stand-in for Supabase Auth in /tmp/ypfstack (start.mjs), Playwright + axe scripts in the scratchpad (`p3.mjs` public pages, `p4.mjs` membership flow). If missing, rebuild or test against a real Supabase project. Reset the DB => also delete `.next/cache/fetch-cache` and restart `next start`.
