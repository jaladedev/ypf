-- Jobs a member has bookmarked. Private to the member.
create table public.saved_jobs (
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

alter table public.saved_jobs enable row level security;

create policy "saved jobs: read own" on public.saved_jobs
  for select to authenticated using (user_id = auth.uid());
create policy "saved jobs: save own" on public.saved_jobs
  for insert to authenticated with check (user_id = auth.uid());
create policy "saved jobs: remove own" on public.saved_jobs
  for delete to authenticated using (user_id = auth.uid());

-- Blanket grants in migration 6 only covered tables that existed then.
grant select, insert, delete on public.saved_jobs to authenticated;
