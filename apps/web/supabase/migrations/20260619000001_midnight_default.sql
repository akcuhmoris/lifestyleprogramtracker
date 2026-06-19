-- Make Midnight the default theme for new users and backfill untouched rows.
--
-- The product canon now treats Midnight (#14141d / #a5b4fc) as the canonical
-- look — it matches the cinematic landing page and the unified in-app design
-- language. Previously `character_profiles.theme` defaulted to 'electric',
-- which made every freshly seeded account feel disconnected from the marketing
-- surface. This migration:
--
--   1. Re-points the column default to 'midnight' so future inserts inherit it.
--   2. Backfills existing rows that are still on the original default AND have
--      never been touched (heuristic: updated_at = created_at). Anyone who
--      actively picked 'electric' or any other theme is left alone.

alter table public.character_profiles
  alter column theme set default 'midnight';

update public.character_profiles
  set theme = 'midnight', updated_at = now()
  where theme = 'electric' and updated_at = created_at;
