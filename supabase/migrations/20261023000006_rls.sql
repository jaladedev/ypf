-- Row-level security. Every table is locked by default; policies open exactly
-- what each role needs. Roles: anon (visitor), authenticated member, editor, admin.
-- Editors/admins are recognised through public.is_editor() / public.is_admin(),
-- which also require membership_status = 'approved'.

alter table public.profiles enable row level security;
alter table public.membership_applications enable row level security;
alter table public.events enable row level security;
alter table public.event_speakers enable row level security;
alter table public.event_registrations enable row level security;
alter table public.jobs enable row level security;
alter table public.posts enable row level security;
alter table public.leaders enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;

-- ---------------------------------------------------------------- profiles
-- Rows are created by the signup trigger, never inserted from the client.
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles: admins read all" on public.profiles
  for select to authenticated using (public.is_admin());
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: admins update all" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
-- role / membership_status changes are additionally blocked for non-admins by
-- the profiles_guard_privileged_columns trigger.

-- ------------------------------------------------- membership_applications
create policy "applications: read own" on public.membership_applications
  for select to authenticated using (user_id = auth.uid());
create policy "applications: admins read all" on public.membership_applications
  for select to authenticated using (public.is_admin());
create policy "applications: submit own pending" on public.membership_applications
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');
create policy "applications: admins review" on public.membership_applications
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------------ events
create policy "events: public read published" on public.events
  for select to anon, authenticated using (status = 'published');
create policy "events: editors read all" on public.events
  for select to authenticated using (public.is_editor());
create policy "events: editors insert" on public.events
  for insert to authenticated with check (public.is_editor());
create policy "events: editors update" on public.events
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "events: editors delete" on public.events
  for delete to authenticated using (public.is_editor());

create policy "speakers: public read for published events" on public.event_speakers
  for select to anon, authenticated
  using (exists (
    select 1 from public.events e where e.id = event_id and e.status = 'published'
  ));
create policy "speakers: editors all" on public.event_speakers
  for all to authenticated using (public.is_editor()) with check (public.is_editor());

-- Anonymous and member registration goes through register_for_event(); there is
-- deliberately no INSERT policy for visitors.
create policy "registrations: read own" on public.event_registrations
  for select to authenticated using (user_id = auth.uid());
create policy "registrations: cancel own" on public.event_registrations
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and status = 'cancelled');
create policy "registrations: editors read" on public.event_registrations
  for select to authenticated using (public.is_editor());
create policy "registrations: editors update" on public.event_registrations
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "registrations: editors delete" on public.event_registrations
  for delete to authenticated using (public.is_editor());

-- -------------------------------------------------------------------- jobs
create policy "jobs: public read open" on public.jobs
  for select to anon, authenticated
  using (status = 'published' and (deadline is null or deadline >= current_date));
create policy "jobs: editors read all" on public.jobs
  for select to authenticated using (public.is_editor());
create policy "jobs: editors insert" on public.jobs
  for insert to authenticated with check (public.is_editor());
create policy "jobs: editors update" on public.jobs
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "jobs: editors delete" on public.jobs
  for delete to authenticated using (public.is_editor());

-- ------------------------------------------------------------------- posts
create policy "posts: public read published" on public.posts
  for select to anon, authenticated
  using (status = 'published' and (published_at is null or published_at <= now()));
create policy "posts: editors read all" on public.posts
  for select to authenticated using (public.is_editor());
create policy "posts: editors insert" on public.posts
  for insert to authenticated with check (public.is_editor());
create policy "posts: editors update" on public.posts
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "posts: editors delete" on public.posts
  for delete to authenticated using (public.is_editor());

-- ----------------------------------------------------------------- leaders
create policy "leaders: public read active" on public.leaders
  for select to anon, authenticated using (is_active);
create policy "leaders: editors read all" on public.leaders
  for select to authenticated using (public.is_editor());
create policy "leaders: editors insert" on public.leaders
  for insert to authenticated with check (public.is_editor());
create policy "leaders: editors update" on public.leaders
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "leaders: editors delete" on public.leaders
  for delete to authenticated using (public.is_editor());

-- ----------------------------------------------------------- site_settings
create policy "settings: public read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "settings: admins write" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------- contact_messages
create policy "messages: anyone can submit" on public.contact_messages
  for insert to anon, authenticated with check (status = 'new');
create policy "messages: admins read" on public.contact_messages
  for select to authenticated using (public.is_admin());
create policy "messages: admins update" on public.contact_messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "messages: admins delete" on public.contact_messages
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------- grants
-- Table privileges; RLS above decides which rows each role can actually touch.
grant usage on schema public to anon, authenticated;
grant select on public.events, public.event_speakers, public.jobs, public.posts,
  public.leaders, public.site_settings to anon;
grant insert on public.contact_messages to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke delete on public.profiles, public.membership_applications from authenticated;
revoke insert on public.profiles from authenticated;
