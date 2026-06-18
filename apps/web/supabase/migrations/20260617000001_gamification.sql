-- Hero Mode: gamification layer.
-- Each user gets a single character_profiles row tracking their chosen archetype,
-- accumulated XP, current level, and selected UI theme. RLS scopes everything to
-- the owning user. A trigger seeds a default row on signup; we also backfill any
-- existing users so the app can assume the row exists.

create table if not exists public.character_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  archetype  text not null default 'warrior'
    check (archetype in ('warrior','sage','athlete','monk','explorer','phoenix')),
  xp         integer not null default 0 check (xp >= 0),
  level      integer not null default 1 check (level >= 1),
  theme      text not null default 'electric'
    check (theme in ('electric','forest','sunset','cyber','monochrome','ember')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable row-level security and define per-user policies.
alter table public.character_profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'character_profiles'
      and policyname = 'character_profiles_select_own'
  ) then
    create policy character_profiles_select_own
      on public.character_profiles
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'character_profiles'
      and policyname = 'character_profiles_insert_own'
  ) then
    create policy character_profiles_insert_own
      on public.character_profiles
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'character_profiles'
      and policyname = 'character_profiles_update_own'
  ) then
    create policy character_profiles_update_own
      on public.character_profiles
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;

-- Seed a default character profile for a new user. Defaults defined at the column
-- level keep this short: archetype = warrior, xp = 0, level = 1, theme = electric.
create or replace function public.seed_character_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.character_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Trigger fires once per new user record in auth.users. We use a separate trigger
-- name from handle_new_user so the existing seed trigger stays untouched.
drop trigger if exists on_auth_user_created_character on auth.users;
create trigger on_auth_user_created_character
  after insert on auth.users
  for each row execute function public.seed_character_profile();

-- Backfill: existing users (created before this migration) should also have a
-- character_profiles row so the UI never has to handle the "missing" case.
insert into public.character_profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;
