-- Membership applications reviewed by admins (workflow built in Phase 4).

create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  status public.membership_status not null default 'pending',
  review_note text check (review_note is null or char_length(review_note) <= 1000),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One open application per user.
create unique index membership_applications_one_pending_idx
  on public.membership_applications (user_id) where status = 'pending';
create index membership_applications_status_idx on public.membership_applications (status, created_at);

create trigger membership_applications_set_updated_at
  before update on public.membership_applications
  for each row execute function public.set_updated_at();

-- When an admin decides an application, keep the profile status in sync.
create function public.sync_profile_on_application_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status and new.status in ('approved', 'rejected') then
    new.reviewed_at = now();
    new.reviewed_by = coalesce(auth.uid(), new.reviewed_by);
    update public.profiles set membership_status = new.status where id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger membership_applications_sync_profile
  before update on public.membership_applications
  for each row execute function public.sync_profile_on_application_review();
