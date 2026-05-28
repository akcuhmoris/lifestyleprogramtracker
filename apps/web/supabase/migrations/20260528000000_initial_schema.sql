-- Initial schema for the Program (lifestyle tracker) backend.
-- Maps the current SQLite schema to Postgres + multi-tenancy via auth.users.
--
-- Apply locally via: supabase db push
-- Applied automatically in CI for staging; manually for production.

-- ============================================================================
-- Profiles — app-specific user data (display name, timezone)
-- ============================================================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'America/Los_Angeles',
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Challenges — one row per program attempt (active, restarted, completed)
-- ============================================================================
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  status text not null default 'active'
    check (status in ('active', 'restarted', 'completed')),
  created_at timestamptz not null default now()
);
create index if not exists challenges_user_id_idx on public.challenges(user_id);
create index if not exists challenges_user_active_idx
  on public.challenges(user_id) where status = 'active';

-- ============================================================================
-- Tasks — the configurable daily-task definitions
-- ============================================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  position integer not null,
  title text not null,
  subtitle text,
  icon text not null default 'ListChecks',
  kind text not null default 'check'
    check (kind in ('check', 'journal', 'photo')),
  requires_detail boolean not null default false,
  detail_label text,
  detail_placeholder text,
  archived boolean not null default false
);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_user_active_position_idx
  on public.tasks(user_id, position) where archived = false;

-- ============================================================================
-- Days — per-day notes
-- ============================================================================
create table if not exists public.days (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  date date not null,
  notes text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);
create index if not exists days_challenge_id_idx on public.days(challenge_id);

-- ============================================================================
-- Task completions — one row per checked task per day
-- ============================================================================
create table if not exists public.task_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  task_id uuid not null references public.tasks(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, date, task_id)
);
create index if not exists task_completions_user_date_idx
  on public.task_completions(user_id, date);

-- ============================================================================
-- Task details — per-day text for tasks that store content (workouts, reading)
-- ============================================================================
create table if not exists public.task_details (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  task_id uuid not null references public.tasks(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, date, task_id)
);

-- ============================================================================
-- Journal entries — reflective writing tied to one task per day
-- ============================================================================
create table if not exists public.journal_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- ============================================================================
-- Weights — daily weigh-in
-- ============================================================================
create table if not exists public.weights (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_lbs numeric(6, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- ============================================================================
-- Progress photos — metadata only; actual bytes live in Supabase Storage
-- Keys follow `progress-photos/{user_id}/{date}.{ext}`
-- ============================================================================
create table if not exists public.progress_photos (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  storage_key text not null,
  mime text,
  uploaded_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- ============================================================================
-- User settings — single row per user keyed by user_id
-- ============================================================================
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_days integer not null default 100
    check (total_days between 1 and 365)
);

-- ============================================================================
-- App state — misc per-user flags (e.g. dismissed restart prompts)
-- ============================================================================
create table if not exists public.app_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
