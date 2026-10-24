# Young Planners Forum (YPF) website

Website for the Young Planners Forum of the Nigerian Institute of Town Planners.
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase · deployed on Vercel.

The build plan and progress live in [`TODO.md`](./TODO.md).

## Requirements

- Node.js 20+ and npm
- A Supabase project (hosted at supabase.com, or local via the Supabase CLI + Docker)

## First run

1. Install dependencies

   ```bash
   npm install
   ```

2. Create a Supabase project and copy its keys into `.env.local` (see `.env.example`):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   and `NEXT_PUBLIC_SITE_URL` (`http://localhost:3000` locally).

3. Apply the database schema

   ```bash
   # hosted project
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push

   # or local (needs Docker)
   npx supabase start        # applies supabase/migrations and supabase/seed.sql
   ```

   Optional sample content for development: run `supabase/seed.sql` in the SQL editor
   (it is applied automatically by `supabase start` / `supabase db reset`).
   **Replace the sample content before launch.**

4. In the Supabase dashboard, **Authentication → URL Configuration**:
   - Site URL: your `NEXT_PUBLIC_SITE_URL`
   - Redirect URLs: add `http://localhost:3000/auth/callback` and your production
     `https://<domain>/auth/callback`

5. Run it

   ```bash
   npm run dev
   ```

### Google sign-in

1. In Google Cloud Console create an OAuth client (type: Web application).
2. Add this authorised redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   (local: `http://127.0.0.1:54321/auth/v1/callback`).
3. In Supabase: **Authentication → Providers → Google**, enable it and paste the client ID and secret.
   For local development set `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and
   `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` (read by `supabase/config.toml`).

### First admin

New accounts start as `member` with status `pending`. Visitors apply at `/join`; admins approve or reject at `/admin/applications` (the first admin is created with the SQL below). Sign in once (so your profile exists), then
run this in the Supabase SQL editor, using your own email:

```sql
update public.profiles
set role = 'admin', membership_status = 'approved'
where id = (select id from auth.users where email = 'you@example.com');
```

Role and status can only be changed by admins (enforced by a database trigger), or by SQL run
as the project owner like the statement above.

### Email

Site emails (event confirmations, contact-form notifications) are sent with [Resend](https://resend.com).
Set `RESEND_API_KEY`, `EMAIL_FROM` (a verified domain) and `ADMIN_NOTIFY_EMAIL` (comma-separated).
Without a key emails are skipped and logged, so local development works unchanged.

Supabase's built-in email is rate-limited and meant for development. Before launch, configure a
custom SMTP provider in **Authentication → SMTP Settings** (this is Phase 6 in `TODO.md`).
Email confirmation is on by default (`supabase/config.toml`).

## Scripts

| Command             | What it does                                                      |
| ------------------- | ----------------------------------------------------------------- |
| `npm run dev`       | Start the dev server                                              |
| `npm run build`     | Production build                                                  |
| `npm run typecheck` | TypeScript check                                                  |
| `npm run lint`      | ESLint                                                            |
| `npm run format`    | Prettier                                                          |
| `npm run test:db`   | Database permission (RLS) tests: runs migrations + seed in PGlite |

`npm run test:db` needs no Docker or Supabase account. It applies every migration to an in-process
Postgres and checks what visitors, members, editors and admins can read and write.

## Project layout

```
src/
  app/                  routes (App Router)
    (site)/               public pages with header + footer (home, about, leadership, events, jobs, news, contact, legal; /design in dev)
    login/ forgot-password/ reset-password/ pending/   auth pages
    auth/callback  auth/signout                        auth route handlers
    dashboard/ admin/                                  protected areas (placeholders until Phases 4-5)
  components/auth/      auth forms
  lib/
    supabase/           browser, server, admin (service role) and proxy clients
    auth/               getSession(), requireApprovedMember/Editor/Admin(), safeNext()
  lib/data/             cached public queries (events, jobs, posts, leaders, settings)
  lib/email/            Resend helper
  proxy.ts              refreshes the session; redirects signed-out visitors
  types/database.ts     database types (hand-maintained; regenerate with the Supabase CLI)
supabase/
  config.toml           local Supabase + auth settings
  migrations/           schema, triggers, RLS (one concern per file)
  seed.sql              sample development data
  tests/                RLS tests (PGlite)
```

## Design system

Tokens (colours, type scale, radii, shadows) are declared once in `src/app/globals.css`.
Run `npm run dev` and open **/design** to see every component (the page is a 404 in production).

```
src/components/
  ui/        Button, Card, Badge, Tabs, Input/Textarea/Select/Checkbox, Stepper, Pagination,
             EmptyState, Skeleton, Toast, Breadcrumbs, FormAlert
  layout/    Container, Section, PageHero, Header, Footer, MobileNav, Logo, CoverImage
  domain/    EventCard/EventRow, JobRow, NewsCard, LeaderCard, StatTile, ShareButtons, Avatar
src/lib/     cn.ts (class names), format.ts (Nigerian-time dates, labels), forms.ts (zod forms)
```

Conventions: mobile-first; every interactive element shows a focus ring (never remove it);
images go through `CoverImage` / `Avatar` so missing photos fall back gracefully;
dates are always rendered in `Africa/Lagos` time via `src/lib/format.ts`.

## How access control works

Three layers, so a mistake in one doesn't expose data:

1. **`src/proxy.ts`**: signed-out visitors are redirected away from `/dashboard`, `/admin`, `/pending`.
2. **`requireApprovedMember()` / `requireEditor()` / `requireAdmin()`** (`src/lib/auth/session.ts`)
   in each protected page, checked against the database on every request.
3. **Row Level Security** in Postgres: the real boundary. Visitors only read published content;
   members only their own data; editors manage content; admins manage members, roles and messages.
   An editor or admin who is not `approved` has no extra powers.

Never use the service-role client (`src/lib/supabase/admin.ts`) for anything triggered by a visitor
without checking permissions first. It bypasses RLS.

## Deploying to Vercel

1. Import the repository in Vercel.
2. Set the environment variables from `.env.example` (production values). Keep
   `SUPABASE_SERVICE_ROLE_KEY` server-only.
3. Set `NEXT_PUBLIC_SITE_URL` to the production URL, and add `https://<domain>/auth/callback`
   to Supabase **Redirect URLs** (and update the Site URL).
4. Run `npx supabase db push` against the production project for schema changes.
