-- Phase 5 (Administration): audit log, admin member listing, storage buckets.

-- ---------------------------------------------------------------- audit log
-- Append-only record of sensitive actions. Written only by database triggers and
-- by write_audit()/log_admin_action(), which stamp the real auth.uid(), so an
-- editor can't forge who did something. Only admins can read it.
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null check (char_length(action) <= 80),
  entity text not null check (char_length(entity) <= 80),
  entity_id text,
  summary text not null check (char_length(summary) <= 300),
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_created_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;
create policy "audit: admins read" on public.audit_log
  for select to authenticated using (public.is_admin());

revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;

-- Internal writer. Not callable from the API.
create function public.write_audit(
  p_action text, p_entity text, p_entity_id text, p_summary text,
  p_detail jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_log (actor_id, action, entity, entity_id, summary, detail)
  values (auth.uid(), p_action, p_entity, p_entity_id, left(p_summary, 300),
          coalesce(p_detail, '{}'::jsonb));
end;
$$;
revoke all on function public.write_audit(text, text, text, text, jsonb) from public, anon, authenticated;

-- Lets the app record exports (which no table trigger can see). Allow-listed
-- actions only, and editors/admins only.
create function public.log_admin_action(p_action text, p_summary text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_editor() then
    raise exception 'Editors only' using errcode = '42501';
  end if;
  if p_action not in ('export.members', 'export.registrations', 'export.messages') then
    raise exception 'Unknown audit action' using errcode = '22023';
  end if;
  perform public.write_audit(p_action, 'export', null, p_summary);
end;
$$;
revoke all on function public.log_admin_action(text, text) from public, anon;
grant execute on function public.log_admin_action(text, text) to authenticated;

-- Role / status changes on profiles (covers application approvals too, because
-- the application trigger updates the profile as the reviewing admin).
create function public.audit_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role then
    perform public.write_audit('member.role_changed', 'profile', new.id::text,
      format('%s: role %s to %s', coalesce(nullif(new.full_name, ''), 'Unnamed'), old.role, new.role),
      jsonb_build_object('from', old.role, 'to', new.role));
  end if;
  if new.membership_status is distinct from old.membership_status then
    perform public.write_audit('member.status_changed', 'profile', new.id::text,
      format('%s: status %s to %s', coalesce(nullif(new.full_name, ''), 'Unnamed'),
             old.membership_status, new.membership_status),
      jsonb_build_object('from', old.membership_status, 'to', new.membership_status));
  end if;
  return new;
end;
$$;

create trigger profiles_audit
  after update of role, membership_status on public.profiles
  for each row execute function public.audit_profile_changes();

-- Deletions. TG_ARGV: [entity label, column that names the row].
create function public.audit_deletion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.write_audit(TG_ARGV[0] || '.deleted', TG_ARGV[0], (to_jsonb(old) ->> 'id'),
    format('Deleted %s "%s"', TG_ARGV[0], coalesce(to_jsonb(old) ->> TG_ARGV[1], '?')));
  return old;
end;
$$;

create trigger events_audit_delete after delete on public.events
  for each row execute function public.audit_deletion('event', 'title');
create trigger jobs_audit_delete after delete on public.jobs
  for each row execute function public.audit_deletion('job', 'title');
create trigger posts_audit_delete after delete on public.posts
  for each row execute function public.audit_deletion('post', 'title');
create trigger leaders_audit_delete after delete on public.leaders
  for each row execute function public.audit_deletion('leader', 'name');
create trigger messages_audit_delete after delete on public.contact_messages
  for each row execute function public.audit_deletion('message', 'name');
create trigger registrations_audit_delete after delete on public.event_registrations
  for each row execute function public.audit_deletion('registration', 'name');

-- Site settings changes (who edited the public contact details, stats, ...).
create function public.audit_setting_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.write_audit('settings.updated', 'setting', new.key,
    format('Updated site setting "%s"', new.key));
  return new;
end;
$$;

create trigger site_settings_audit
  after insert or update on public.site_settings
  for each row execute function public.audit_setting_change();

-- ------------------------------------------------------ admin member listing
-- Emails live in auth.users, which the API can't read. This admin-only function
-- joins them in, with search, filters and a total for pagination.
create function public.admin_list_members(
  p_search text default null,
  p_status public.membership_status default null,
  p_role public.app_role default null,
  p_id uuid default null,
  p_limit integer default 25,
  p_offset integer default 0
)
returns table (
  id uuid,
  email text,
  full_name text,
  phone text,
  institution text,
  career_stage public.career_stage,
  specialisation text,
  avatar_url text,
  role public.app_role,
  membership_status public.membership_status,
  created_at timestamptz,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_pattern text;
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  if p_search is not null and btrim(p_search) <> '' then
    v_pattern := '%' || replace(replace(replace(btrim(p_search), '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;

  return query
  select p.id, u.email::text, p.full_name, p.phone, p.institution, p.career_stage,
         p.specialisation, p.avatar_url, p.role, p.membership_status, p.created_at,
         count(*) over ()
  from public.profiles p
  left join auth.users u on u.id = p.id
  where (p_id is null or p.id = p_id)
    and (p_status is null or p.membership_status = p_status)
    and (p_role is null or p.role = p_role)
    and (v_pattern is null or p.full_name ilike v_pattern or u.email::text ilike v_pattern)
  order by p.created_at desc, p.id
  limit greatest(least(p_limit, 10000), 1) offset greatest(p_offset, 0);
end;
$$;
revoke all on function public.admin_list_members(text, public.membership_status, public.app_role, uuid, integer, integer) from public, anon;
grant execute on function public.admin_list_members(text, public.membership_status, public.app_role, uuid, integer, integer) to authenticated;

-- ------------------------------------------------------------------ storage
-- Two public-read buckets. Writes are policed here, not in the app:
--   avatars: an approved member may write only inside their own folder (<user id>/...)
--   media:   editors and admins only (event, news and leader images, partner logos)
-- SVG is deliberately not allowed (it can carry scripts).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "avatars: members manage own folder" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'avatars'
    and public.is_approved_member()
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and public.is_approved_member()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "media: editors manage" on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and public.is_editor())
  with check (bucket_id = 'media' and public.is_editor());
