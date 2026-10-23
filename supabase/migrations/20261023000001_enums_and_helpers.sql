-- Enums and generic helpers shared by every table.

create type public.app_role as enum ('member', 'editor', 'admin');
create type public.membership_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.career_stage as enum ('student', 'graduate', 'early_career', 'professional');
create type public.job_type as enum ('full_time', 'part_time', 'internship', 'nysc', 'volunteer', 'contract');
create type public.experience_level as enum ('entry', 'entry_mid', 'mid', 'senior');
create type public.post_category as enum ('advocacy', 'events', 'careers', 'announcements');
create type public.leader_group as enum ('national_executive', 'coordinator');
create type public.message_status as enum ('new', 'read', 'replied');
create type public.registration_status as enum ('registered', 'cancelled');

-- Keeps updated_at current on every UPDATE.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
