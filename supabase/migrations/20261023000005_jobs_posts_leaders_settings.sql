-- Jobs, news posts, leadership, site settings and contact messages.

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  organisation text not null check (char_length(organisation) <= 200),
  description text not null,
  requirements text[] not null default '{}',
  location text,
  job_type public.job_type not null,
  experience_level public.experience_level,
  specialisation text,
  apply_url text,
  apply_email text,
  deadline date,
  status public.publish_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Applications happen off-site, so at least one way to apply is required.
  check (apply_url is not null or apply_email is not null),
  check (apply_url is null or apply_url ~* '^https?://')
);

create index jobs_status_deadline_idx on public.jobs (status, deadline);
create index jobs_type_idx on public.jobs (job_type);

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text check (excerpt is null or char_length(excerpt) <= 500),
  body text not null default '',
  category public.post_category not null default 'announcements',
  cover_image text,
  author_id uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_status_published_idx on public.posts (status, published_at desc);
create index posts_category_idx on public.posts (category);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

create table public.leaders (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 200),
  role_title text not null check (char_length(role_title) <= 200),
  "group" public.leader_group not null default 'national_executive',
  photo_url text,
  bio text check (bio is null or char_length(bio) <= 1000),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leaders_group_sort_idx on public.leaders ("group", sort_order);

create trigger leaders_set_updated_at
  before update on public.leaders
  for each row execute function public.set_updated_at();

-- Editable site content (stats, contact details, social links).
-- Everything here is publicly readable: never store secrets in this table.
create table public.site_settings (
  key text primary key check (key ~ '^[a-z0-9_.]+$'),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject text check (subject is null or char_length(subject) <= 200),
  message text not null check (char_length(message) between 5 and 5000),
  status public.message_status not null default 'new',
  created_at timestamptz not null default now()
);

create index contact_messages_status_idx on public.contact_messages (status, created_at desc);
