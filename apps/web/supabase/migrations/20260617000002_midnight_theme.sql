-- Midnight theme
--
-- Extends the original gamification migration (20260617000001_gamification.sql),
-- which introduced the `character_profiles.theme` column with a CHECK constraint
-- restricted to the original six theme ids. This migration adds a seventh theme,
-- `midnight`, by replacing the CHECK constraint.
--
-- Written to be idempotent: if the constraint already exists with the new set of
-- values, dropping + re-adding it produces the same end state.

alter table public.character_profiles
  drop constraint if exists character_profiles_theme_check;

alter table public.character_profiles
  add constraint character_profiles_theme_check
  check (theme in ('electric','forest','sunset','cyber','monochrome','ember','midnight'));
