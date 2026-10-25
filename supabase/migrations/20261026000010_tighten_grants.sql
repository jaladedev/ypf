-- Defence in depth for hosted Supabase. New tables there get default privileges
-- for anon and authenticated (including TRUNCATE, which ignores RLS), so strip
-- everything and grant back only what the app needs. RLS still decides rows.

revoke all on all tables in schema public from anon, authenticated;

-- Visitors: read public content, send a contact message.
grant select on public.events, public.event_speakers, public.jobs, public.posts,
  public.leaders, public.site_settings to anon;
grant insert on public.contact_messages to anon;

-- Signed-in users: row-level access only (no TRUNCATE/REFERENCES/TRIGGER).
grant select, insert, update, delete on
  public.events, public.event_speakers, public.event_registrations, public.jobs,
  public.posts, public.leaders, public.site_settings, public.contact_messages
  to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.membership_applications to authenticated;
grant select, insert, delete on public.saved_jobs to authenticated;
grant select on public.audit_log to authenticated;
-- rate_limits stays server-only (service role).

-- Trigger functions are never meant to be called through the API.
revoke execute on function
  public.handle_new_user(),
  public.guard_profile_privileged_columns(),
  public.sync_profile_on_application_review(),
  public.audit_profile_changes(),
  public.audit_deletion(),
  public.audit_setting_change()
from public, anon, authenticated;
