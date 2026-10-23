-- Events, speakers and registrations.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text check (summary is null or char_length(summary) <= 500),
  body text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  city text,
  cover_image text,
  registration_deadline timestamptz,
  capacity integer check (capacity is null or capacity > 0),
  features text[] not null default '{}',
  status public.publish_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create index events_status_starts_idx on public.events (status, starts_at);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create table public.event_speakers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null check (char_length(name) <= 200),
  title text check (title is null or char_length(title) <= 200),
  photo_url text,
  sort_order integer not null default 0
);

create index event_speakers_event_idx on public.event_speakers (event_id, sort_order);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  status public.registration_status not null default 'registered',
  created_at timestamptz not null default now()
);

-- Registration is open to anyone, one registration per email per event.
create unique index event_registrations_event_email_idx
  on public.event_registrations (event_id, lower(email));
create index event_registrations_user_idx on public.event_registrations (user_id);

-- Public registration goes through this function instead of a direct INSERT so
-- anonymous visitors never need read access to the registrations table, and
-- the checks (published, deadline, capacity) can't be bypassed from the client.
create function public.register_for_event(
  p_event_id uuid,
  p_name text,
  p_email text
)
returns public.registration_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events%rowtype;
  v_count integer;
  v_email text := lower(trim(p_email));
  v_name text := trim(p_name);
begin
  select * into v_event from public.events
  where id = p_event_id and status = 'published';

  if not found then
    raise exception 'Event not found' using errcode = 'P0002';
  end if;

  if coalesce(v_event.registration_deadline, v_event.starts_at) < now() then
    raise exception 'Registration for this event has closed' using errcode = 'P0001';
  end if;

  if v_event.capacity is not null then
    select count(*) into v_count from public.event_registrations
    where event_id = p_event_id and status = 'registered';
    if v_count >= v_event.capacity then
      raise exception 'This event is full' using errcode = 'P0001';
    end if;
  end if;

  insert into public.event_registrations (event_id, user_id, name, email)
  values (p_event_id, auth.uid(), v_name, v_email)
  on conflict (event_id, lower(email)) do update
    set status = 'registered', name = excluded.name
    where public.event_registrations.status = 'cancelled';

  return 'registered';
end;
$$;

revoke all on function public.register_for_event(uuid, text, text) from public;
grant execute on function public.register_for_event(uuid, text, text) to anon, authenticated;
