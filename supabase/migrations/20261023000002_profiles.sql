-- Profiles: one row per auth user. Created automatically on signup.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 200),
  phone text check (phone is null or char_length(phone) <= 40),
  institution text check (institution is null or char_length(institution) <= 200),
  career_stage public.career_stage,
  specialisation text check (specialisation is null or char_length(specialisation) <= 200),
  bio text check (bio is null or char_length(bio) <= 2000),
  linkedin_url text check (linkedin_url is null or char_length(linkedin_url) <= 300),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 500),
  role public.app_role not null default 'member',
  membership_status public.membership_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Role helpers. SECURITY DEFINER + empty search_path so RLS policies on other
-- tables (and on profiles itself) can call them without recursion.
create function public.user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.membership_status = 'approved'
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.user_role() = 'admin', false)
$$;

-- Editors and admins can manage content.
create function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.user_role() in ('editor', 'admin'), false)
$$;

create function public.is_approved_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.membership_status = 'approved'
  )
$$;

revoke all on function public.user_role(), public.is_admin(), public.is_editor(),
  public.is_approved_member() from public;
grant execute on function public.user_role(), public.is_admin(), public.is_editor(),
  public.is_approved_member() to anon, authenticated;

-- Create a profile row whenever a user signs up (email, magic link or Google).
-- Role and status are never taken from user-supplied metadata.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 200),
    left(new.raw_user_meta_data ->> 'avatar_url', 500)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Block privilege escalation: only admins may change role or membership_status.
-- Calls with no auth.uid() (migrations, service role, SQL editor) are trusted.
create function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role is distinct from old.role
       or new.membership_status is distinct from old.membership_status
       or new.id is distinct from old.id then
      raise exception 'Only admins can change role or membership status'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_privileged_columns
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_columns();

create index profiles_membership_status_idx on public.profiles (membership_status);
create index profiles_role_idx on public.profiles (role) where role <> 'member';
