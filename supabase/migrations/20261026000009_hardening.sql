-- Phase 6 (Launch hardening): rate limiting and scheduled maintenance.

-- ------------------------------------------------------------ rate limiting
-- Fixed-window counters keyed by an opaque string (the app passes a hash of
-- action + client IP, never the raw IP). Only the server (service role) may use it:
-- the API keys in browsers can't call it, so nobody can flood the table with keys.
create table public.rate_limits (
  key text primary key check (char_length(key) <= 120),
  window_start timestamptz not null default now(),
  hits integer not null default 0
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Returns true when the call is allowed, false when the limit is exceeded.
create function public.check_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hits integer;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update
    set hits = case when r.window_start < now() - make_interval(secs => p_window_seconds)
                    then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds)
                            then now() else r.window_start end
  returning hits into v_hits;
  return v_hits <= p_limit;
end;
$$;
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

-- -------------------------------------------------------------- maintenance
-- Run daily by the app's cron route (service role only). Public pages already hide
-- expired jobs and registration closes by itself, so this keeps the admin lists
-- tidy and the counters table small.
create function public.run_maintenance()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_jobs integer;
  v_limits integer;
begin
  with archived as (
    update public.jobs set status = 'archived'
    where status = 'published' and deadline is not null and deadline < current_date - 14
    returning 1
  )
  select count(*) into v_jobs from archived;

  with gone as (
    delete from public.rate_limits where window_start < now() - interval '1 day' returning 1
  )
  select count(*) into v_limits from gone;

  if v_jobs > 0 then
    perform public.write_audit('maintenance.jobs_archived', 'job', null,
      format('Archived %s job(s) that closed more than 14 days ago', v_jobs));
  end if;
  return jsonb_build_object('jobs_archived', v_jobs, 'rate_limit_rows_removed', v_limits);
end;
$$;
revoke all on function public.run_maintenance() from public, anon, authenticated;
grant execute on function public.run_maintenance() to service_role;
