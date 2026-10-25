# YPF Website: Build Plan

Young Planners Forum (NITP). Single-chapter site, built as a new project.
Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase.
Design reference: the 14 mockup screens (Home, About, Leadership, Events, Event Detail, Jobs, Job Detail, News, News Article, Contact, Join, Login, Member Dashboard, Admin Dashboard).

Legend: `[ ]` to do, `[~]` partly done (see note), `[x]` done. Each phase ends with a short acceptance check.

## Decisions already made
- [x] Single chapter (no chapter column or chapter-scoped admins). Mockup elements that imply chapters ("State & FCT Coordinators" tab, "Chapter enquiries" link, "36+ States & FCT" stat) become plain content: a "Coordinators" group on Leadership, a normal contact link, and an editable stat.
- [x] New project built in the workspace and delivered as files.
- [x] Jobs: admin-posted, applications via external link or email (no CV uploads in v1).
- [x] Membership: sign-up, then admin approval before member features unlock.
- [x] Google sign-in is included at launch.
- [x] Event registration is open to anyone (name + email, no account needed). If the visitor is signed in, the registration is linked to their account.
- [x] Membership is open to any young planner (no MNITP/RTP requirement). An admin still approves each member.
- [x] Hosting: Vercel.
- [x] Email: Resend (see open-questions list). Needs a verified sending domain (SPF/DKIM DNS records) before launch.

## Open questions (answer before or during the phase noted)
- [x] (Phase 1) Email provider: Resend. App emails (contact notifications, event confirmations, approval decisions) go through the Resend API; Supabase auth emails (confirmation, magic link, reset) use Resend over SMTP in production.
- [x] (Phase 1) Google sign-in: yes, at launch.
- [x] (Phase 3) Event registration: open to anyone.
- [x] (Phase 4) Who can be a member: any young planner.
- [x] (Phase 5) Exports: CSV and Excel (.xlsx).
- [x] (Phase 6) Hosting target: Vercel.
- [~] (Phase 6) Production domain: launching on the free `*.vercel.app` address for now; custom domain later (also needed for Resend email, see LAUNCH.md)

---

## Phase 1: Foundation
Goal: a running app wired to Supabase with auth, schema and RLS in place.

### 1.1 Project setup
- [x] Initialise Next.js (App Router, TypeScript, Tailwind, ESLint, `src/` dir)
- [x] Configure absolute imports, Prettier, strict TS
- [x] `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`
- [x] README with local setup steps

### 1.2 Supabase
- [x] `supabase/` folder with `config.toml` and `migrations/`
- [x] Supabase client helpers: browser, server (cookies), middleware
- [~] Database types (`src/types/database.ts`): hand-written to match the migrations. Regenerate with `npx supabase gen types typescript --local` once a Supabase project is running
- [x] Seed file with sample events, jobs, news and leaders for development

### 1.3 Database schema (migrations, one concern per file)
- [x] `profiles`: id (FK auth.users), full_name, phone, institution, career_stage, specialisation, bio, linkedin_url, avatar_url, role (`member | editor | admin`), membership_status (`pending | approved | rejected | suspended`), created_at
- [x] `membership_applications`: user_id, answers (jsonb or columns), status, reviewed_by, reviewed_at, review_note
- [x] `events`: title, slug, summary, body, starts_at, ends_at, venue, city, cover_image, registration_deadline, capacity, status (`draft | published | archived`)
- [x] `event_speakers`: event_id, name, title, photo_url, sort_order
- [x] `event_registrations`: event_id, user_id (nullable), name, email, status, created_at; unique (event_id, email)
- [x] `jobs`: title, slug, organisation, description, requirements, location, job_type, experience_level, specialisation, apply_url, apply_email, deadline, status (`draft | published | archived`), created_by
- [x] `posts`: title, slug, excerpt, body, category (`advocacy | events | careers | announcements`), cover_image, author_id, published_at, status
- [x] `leaders`: name, role_title, group (`national_executive | coordinator`), photo_url, bio, sort_order, is_active
- [x] `contact_messages`: name, email, subject, message, status (`new | read | replied`), created_at
- [x] `site_settings`: key/value for editable stats, contact details, social links
- [x] Triggers: auto-create `profiles` row on signup; `updated_at` maintenance; slug uniqueness

### 1.4 Authentication
- [x] Email + password sign-in, magic link and Google (Google needs OAuth credentials set in Supabase; see README). Email/password *sign-up* is built with the Join form in Phase 4
- [x] Auth callback route, sign-out, password reset
- [x] Route protection: `src/proxy.ts` (Next 16 renamed middleware to proxy) redirects signed-out visitors; `requireApprovedMember` / `requireEditor` / `requireAdmin` enforce role and status next to the data
- [x] Session helper returning `{ user, profile, role }` for server components

### 1.5 Row-level security
- [x] Public read: published events, jobs (not past deadline), posts, leaders, settings
- [x] Members: read/update own profile (cannot change own role or status), manage own registrations
- [x] Editors: write events, jobs, posts, leaders
- [x] Admins: everything above plus member approvals, role changes, contact messages
- [x] Contact form insert allowed for anon, read restricted to admins
- [x] SQL tests proving each rule: `npm run test:db` (28 tests as of Phase 5, in-process Postgres via PGlite, runs the real migrations and seed)

**Acceptance:** `npm run dev` works; a test user can sign up and sign in; RLS tests pass; an anonymous request cannot read drafts or other users' data.
**Status:** build, typecheck, lint and all 19 RLS tests pass; route protection smoke-tested against a production build. NOT yet verified: a real sign-up/sign-in/Google round trip, because that needs a running Supabase project (no Docker or Supabase account in the build sandbox). Do this first when you connect a project (README, "First run").

---

## Phase 2: Design system
Goal: reusable building blocks matching the mockups (deep green, clean cards, mobile-first).

- [x] Design tokens in Tailwind config: green palette, neutral greys, accent, radii, shadows
- [x] Typography scale and font loading (`next/font`)
- [x] Layout: container, section wrapper, page hero (image + gradient overlay + title/subtitle)
- [x] Header: logo, nav, "Sign in" link, "Join YPF" CTA, mobile menu (keyboard and Escape support). The search icon from the mockups is deferred: there is no search page in the plan yet; add it if/when one is
- [x] Footer: logo, link columns, privacy/terms, copyright
- [x] Components: Button (primary/secondary/ghost), Card, Badge, Tabs, Input, Textarea, Select, Checkbox, Stepper, Pagination, EmptyState, Skeleton, Toast, Breadcrumbs
- [x] Domain components: EventCard, EventRow (date block), JobRow, NewsCard, LeaderCard, StatTile, ShareButtons
- [x] Form system with validation (react-hook-form + zod) and consistent error display
- [x] Image handling: `next/image` via `CoverImage` / `Avatar`, skyline and initials placeholders when no photo, remote pattern for Supabase Storage public bucket (derived from `NEXT_PUBLIC_SUPABASE_URL`)
- [x] Dark mode decision: light only for v1 (`color-scheme: light`)
- [x] Demo route `/design` to review all components: available in development, returns 404 in production

**Acceptance:** every component renders correctly at 360px, 768px and 1280px; keyboard focus is visible on all interactive elements.
**Status:** checked in a real browser (Chromium via Playwright): no horizontal overflow at 360/768/1280 on `/design`, home and login; all 70 keyboard tab stops on `/design` show a focus ring; skip link and mobile menu (open, `aria-expanded`, Escape) work; axe-core (WCAG 2.0/2.1 A and AA) reports 0 violations on the production build of home, login and forgot-password at all three widths (and on `/design` in dev apart from one logo-label finding, since fixed in the shared logo component).
**Known gaps:** no real photography yet (mockup photos weren't supplied), so heroes and cards show the skyline placeholder; the logo is a simple placeholder mark; header/footer links to pages from later phases (About, Events, Join, ...) lead to 404 until those phases are built. Contrast was checked by axe on the pages above only; re-check when real photos sit under hero text.


---

## Phase 3: Public content
Goal: all public pages, backed by real data.

- [x] **Home**: hero, stats strip, upcoming events, history teaser, latest news, featured jobs, partners (text, no logos yet)
- [x] **About**: mission, vision, history, objectives, NITP relationship
- [x] **Leadership**: tabs for National Executives and Coordinators, grid of LeaderCards
- [x] **Events**: Upcoming/Past tabs, filter, list with date blocks, Register button
- [x] **Event detail**: overview, details panel (date, time, venue, deadline), features list, speakers, registration form (name + email, open to anyone, calls the `register_for_event` database function), add-to-calendar (.ics)
- [x] **Jobs**: search box, filters (location, specialisation, type, experience), list, pagination, deadline badges
- [x] **Job detail**: description, requirements, key details panel, Apply button (link or email), share buttons
- [x] **News**: category tabs, grid, pagination
- [x] **News article**: hero, body (markdown rendering), share, related articles
- [x] **Contact**: form (saved to `contact_messages` + email to admins), contact details, social links, spam protection (honeypot done; rate limit deferred to Phase 6)
- [x] Static pages: Privacy Policy, Terms
- [x] 404 and error pages
- [x] Jobs auto-hide after deadline (query-level filter now; scheduled archive job in Phase 6)

**Acceptance:** each page loads from the database, handles empty and error states, and is usable on a phone.

---

Status: built and checked against a real Postgres + PostgREST running the project's migrations and seed.
- Verified: all routes at 360/768/1280px (no overflow), axe 0 violations at 1280, event registration (incl. duplicate email), contact form (validation, honeypot), job search/filters, real 404s for unknown slugs, `.ics` download, production build.
- Known gaps: About, Privacy and Terms text is draft (legal review in Phase 6); no real photos/logo yet (skyline placeholders); contact and registration emails untested against live Resend (needs API key); `/join` link 404s until Phase 4; public pages cache for 5 minutes; per-IP rate limiting on contact form not yet added.

## Phase 4: Membership
Goal: sign-up through approval to member dashboard.

- [x] **Join YPF**: 3-step form (Personal, Education, Professional); new visitors create their account on the last step, signed-in users (e.g. Google) skip it
- [x] Email verification before the application is filed (details are held in the account until the email link is opened, then filed by `/join/complete`)
- [x] Application stored with status `pending`; confirmation email to the applicant and a notice to admins
- [x] **Login** page (email/password, magic link, Google): built in Phase 1
- [x] "Pending approval" screen (`/pending`): shows submission date; rejected users see the reviewer's note and can apply again
- [x] Admin review queue (`/admin/applications`): Pending/Approved/Rejected tabs, application detail, approve or reject (a note is required to reject), email to the applicant. A temporary admin menu is used until Phase 5.
- [x] **Member dashboard**: welcome, quick links, upcoming events the member registered for (including ones registered before signing in, matched by email), saved-jobs count
- [x] Profile editing (details, bio, LinkedIn)
- [x] Saved jobs: `saved_jobs` table with RLS (+test), Save button on job pages, `/dashboard/saved`
- [x] Account settings: change password; request account deletion (sends a request to admins)
- [x] Avatar upload (done in Phase 5: `avatars` bucket + policies, form on the profile page)
- [x] Change email address (confirmation link to the new address, via Supabase) and self-service account deletion (type DELETE; removes account, profile, saved jobs, registrations, avatar files; last admin protected). Done after Phase 6

**Acceptance:** a new user can apply, an admin can approve them, and the member then sees their dashboard; a rejected or pending user cannot access member pages. Met.

Status: verified in a browser against a real Postgres + PostgREST (running the project migrations) plus a small test-only stand-in for Supabase sign-in. Checked: validation per step, sign-up, email confirmation, pending lock-out of dashboard/admin, admin approve/reject (note required), member access, profile save, saved jobs, event registration on the dashboard, password change, deletion request, reject then re-apply, anonymous redirects. Axe: 0 violations on join, pending, admin queue/review, dashboard, profile, settings.
- Known gaps: the real Supabase Auth round trip (including real confirmation emails and Google) is still unverified until a live project exists; the header still shows "Sign in / Join YPF" on member pages; no member directory; no rate limiting on sign-up (Supabase's own limits apply).

## Phase 5: Administration
Goal: non-developers can run the site.

- [x] Role-based admin shell with sidebar (Dashboard, Members, Events, Jobs, News, Leadership, Pages & Media, Messages, Settings, plus Audit log). Editors see only content sections; admins see everything. Mobile menu, skip link, waiting-count badges
- [x] **Dashboard**: totals (members, events, jobs, posts), membership growth chart (new approved members per month, last 12), recent activity (registrations, applications, messages, audit entries)
- [x] **Members** (admin): search by name/email, filter by status and role, detail page, approve/suspend/reinstate, role assignment. Admins can't change their own role/status. Application review stays at `/admin/applications`
- [x] **Events**: create/edit/publish/unpublish/archive/delete, speakers with photos, cover image, registrations list (remove entry) and export
- [x] **Jobs**: create/edit/publish/unpublish/archive/delete, duplicate a listing (copy is a draft with no deadline)
- [x] **News**: Markdown editor (toolbar, image upload, live preview), draft/publish, optional publish date (future date = scheduled), categories
- [x] **Leadership**: add/edit/hide/delete leaders with photos, reorder with up/down buttons (no drag and drop)
- [x] **Messages** (admin): inbox with New/Read/Replied tabs, detail, reply by email link, delete
- [x] **Site settings** (admin): home figures, contact details, social links, partners with optional logos (home page now reads partners from settings)
- [x] **Pages & Media**: image library (upload many, copy link, delete). About/Privacy/Terms wording is still in code (noted on the page)
- [x] **Exports**: members (honours the current filters), event registrations, contact messages, each as CSV and Excel (.xlsx). Cells starting with `= + - @` are neutralised against spreadsheet formula injection
- [x] Audit log: database triggers record role/status changes, deletions and settings edits; exports are logged through `log_admin_action()`. Admin-only viewer at `/admin/audit`, append-only
- [x] Form UX: confirm dialogs for unpublish/archive/delete/suspend; failed saves keep what was typed; local autosave of text fields with a "restore" banner (stored in the browser only, not on the server)
- [x] Avatar upload on `/dashboard/profile` (closes the Phase 4 item); Supabase Storage buckets `avatars` (own folder only) and `media` (editors/admins) with policies in migration 8

**Acceptance:** an editor can publish an event, job and article without touching code; an editor cannot change roles or approve members; exports match the data. Met.

Status: built; lint, typecheck and production build pass. `npm run test:db`: 28 tests (8 new: audit log, audited changes, `log_admin_action`, `admin_list_members`, storage policies). Browser pass against real Postgres + PostgREST: 85 checks (all three roles, publish/unpublish with immediate public refresh, uploads, exports parsed back from CSV and xlsx, audit trail, axe 0 violations on dashboard, event/news/member/audit/settings/media/profile pages, no horizontal overflow at 360px on 10 admin pages, mobile menu).
- Decision: site settings stay **admin-only** (the existing RLS rule and test); editors manage events, jobs, news, leaders and media.
- Known gaps: uploads were exercised against a small stand-in for Supabase Storage that runs the project's real storage policies, not a hosted project; no image resizing (5 MB / 2 MB limits); the Supabase "storage.objects" policies and bucket rows need a first look in the dashboard after the migration runs; no drag-and-drop ordering; no editor-requested "scheduled unpublish"; autosave is per browser; change-email and self-service account deletion (Phase 4 leftovers) are still open; member directory not built.

---

## Phase 6: Launch hardening
- [x] **Permissions testing**: `npm run test:db` now 45 tests, including a role x table matrix (anon, member, unapproved editor, editor, admin; read/update/delete, rolled back), own-only profiles, saved-jobs privacy, internal functions denied to clients
- [ ] **Mobile usability**: no overflow at 360px on public and admin pages (automated); real Android/iPhone and slow-3G pass still needs devices (LAUNCH.md)
- [ ] **Email delivery**: needs your domain and Resend account; steps in LAUNCH.md section 2
- [x] **Error states**: friendly messages for full events, closed registration, expired jobs (404), expired sessions (login notice), route error boundaries for admin, dashboard and the whole app
- [x] **Accessibility**: axe 0 violations across public, join (with consent error), member and admin pages; Lighthouse accessibility 100
- [x] **SEO**: metadata, canonical, Open Graph and Twitter per page, `sitemap.xml` (published content only), `robots.txt` (blocks /admin, /dashboard), Event and JobPosting JSON-LD (escaped), noindex on login/pending.
- [~] **Performance**: Lighthouse mobile (throttled, sandbox) performance 88, best practices 100, SEO 92; pages are ISR cached. Re-measure on Vercel; real photos will need sizing
- [x] **Security**: DB rate limiting (contact 5/h, register 20/h, signup 6/h, login 20/15min, email links 8/h; hashed IPs), CSP and security headers, HSTS on https, secrets audit (service-role client only in server files, no keys in repo), storage policies tested, JSON-LD/markdown XSS tests
- [~] **Operations**: daily cron `/api/cron/maintenance` (archives jobs closed 14+ days, purges old rate-limit rows). Backups, error monitoring and analytics need your accounts (LAUNCH.md section 6). Past events are not auto-archived: they stay visible under Past events
- [~] **Legal**: NDPA consent checkbox on Join (required); Privacy page expanded (controller, legal basis, retention, rights, NDPC complaint). Still marked Draft pending lawyer review
- [ ] **Deployment (Vercel)**: checklist in `LAUNCH.md`; can proceed on the vercel.app address; email needs a custom domain

**Acceptance:** all tests pass; Lighthouse and axe results meet targets; a full signup-to-approval journey works in production with real email.

---

## Later (post-launch)
- [ ] Employer job submissions with approval
- [ ] Job alerts by email/WhatsApp
- [ ] Mentorship matching
- [ ] Member directory (opt-in)
- [ ] Resource library
- [ ] Event check-in via QR code and participation certificates
- [ ] Dues/payments (Paystack or Flutterwave)
- [ ] Multi-chapter support (would add a chapter column and chapter-scoped roles)

## Build notes (decisions made while building)
- Next.js 16.4: `middleware` is now `proxy.ts`; `cacheComponents` is switched off in `next.config.ts` so session reads work without wrapping every page in Suspense.
- Fonts: Geist is self-hosted via the `geist` package (no Google Fonts request at build or runtime). Revisit in Phase 2 when the final typography is chosen.
- Public event registration goes through the `register_for_event()` database function; there is deliberately no INSERT policy on `event_registrations` for visitors.
- Admin bootstrap: the first admin is created with one SQL statement (README, "First admin").
- Not in Phase 1 (planned later): storage buckets and audit log (added in Phase 5, migration 8), saved-jobs table (Phase 4), rate limiting (Phase 6).

- Phase 2: tokens live in `src/app/globals.css` (`@theme`), so utilities like `bg-brand-800`, `text-h2`, `rounded-card`, `shadow-card` come from there. `Header` is intentionally static (no session lookup) so public pages stay cacheable; signed-in state belongs on member pages.
- Phase 2: form controls (`Input`, `Textarea`, `Select`, `Checkbox`) carry their own label, hint and error wiring; use `useZodForm` + `errorMessage` from `src/lib/forms.ts` for client forms and the same zod schema in server actions.
- Phase 2: sharing uses plain labelled links (WhatsApp first) instead of brand icons, to avoid shipping unofficial logo artwork.

## Progress log
- 2026-10-23: Plan written. No code yet.
- 2026-10-23: Phase 1 (Foundation) built: Next.js project, Supabase migrations, seed, RLS with tests, auth (password, magic link, Google), route protection. Live Supabase round trip still to verify.
- 2026-10-24: Phase 2 (Design system) built and checked in a browser at 360/768/1280px (focus, skip link, axe). `/design` shows every component in development.
- 2026-10-24: Email provider decided: Resend.
- 2026-10-24: Phase 3 (Public content) built: home, about, leadership, events + detail + calendar, jobs + detail, news + article, contact, privacy, terms, 404/error pages. Verified in browser against a local database.
- 2026-10-24: Phase 4 (Membership) built and verified in a browser: join form, email-verified application, admin review, member dashboard, profile, saved jobs, settings.
- 2026-10-25: Phase 5 (Administration) built and verified in a browser: admin shell, dashboard, members, events, jobs, news, leadership, messages, settings, media, audit log, CSV + Excel exports, avatar upload. Migration 8 adds the audit log, `admin_list_members()` and the storage buckets.
- 2026-10-25: Phase 6 (Launch hardening) built: migration 9 (rate limits, maintenance), rate limiting, cron, security headers, SEO, consent, error pages, permission matrix tests. Verified: 45 DB tests, 82-check Phase 6 browser suite, 86-check Phase 5 regression. Remaining items need your domain, accounts and devices: see LAUNCH.md.
- 2026-10-25: Carry-overs done: change email, self-service account deletion, signed-in header (My dashboard, swapped client-side so pages stay cached), generated Open Graph image (`/opengraph-image`). Browser suite p7: 19 checks; regressions p5 86 and p6 82 pass. Real Supabase email-change round trip untested.
- 2026-10-25: Decision: use the Vercel (*.vercel.app) domain for now. LAUNCH.md updated, including the email limitation until a custom domain is verified in Resend.
- 2026-10-25: Created the production Supabase project (`ypf-website`) and applied migrations 1-10. New migration 10 (`tighten_grants`) strips default anon/authenticated table privileges that hosted Supabase adds (incl. TRUNCATE) and removes API access to trigger functions; 3 anon tests updated to accept "permission denied". Verified: 45 DB tests, p5 86, p6 82, p7 19. First admin and Vercel env vars still to do (LAUNCH.md).
- 2026-10-26: Google sign-in landed on localhost: cause is Supabase Auth > URL Configuration (Site URL still localhost, redirect URLs missing). Code safety net added in `src/lib/supabase/proxy.ts`: a `/?code=` landing is forwarded to `/auth/callback`. Same file now skips the Supabase session call for signed-out visitors on public pages (faster, cache-friendly). Confirmed only /dashboard, /admin and /pending require sign-in; everything else is public. Suites: p5 86, p6 82, p7 19.
