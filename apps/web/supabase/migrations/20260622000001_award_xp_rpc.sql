-- Atomic XP increment + level recompute.
--
-- The application-level awardCharacterXp() did a read-modify-write against
-- character_profiles, which can lose updates when two task toggles race (both
-- read the same xp, both write xp+delta, second wins). This RPC moves the
-- increment into a single UPDATE so concurrent calls compose correctly under
-- Postgres row-level locking.
--
-- The level formula matches packages/shared/src/gamification.ts
-- (xpForLevel / levelForXp):
--   xpForLevel(n) = 50 * (n - 1) * n
-- Solving 50*(n-1)*n <= xp for the largest integer n:
--   50*n^2 - 50*n - xp <= 0
--   n <= (1 + sqrt(1 + xp/12.5)) / 2
-- A floor() with min 1 gives the current level for any non-negative xp.
-- Sanity check: xp=100 -> (1 + sqrt(9)) / 2 = 2, matching xpForLevel(2)=100.

create or replace function public.award_character_xp(
  p_amount integer
)
returns table(xp integer, level integer, leveled_up boolean)
language plpgsql
as $$
declare
  v_user_id uuid;
  new_xp integer;
  prev_level integer;
  new_level integer;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into public.character_profiles (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  update public.character_profiles cp
  set xp = cp.xp + greatest(p_amount, 0),
      updated_at = now()
  where cp.user_id = v_user_id
  returning cp.xp, cp.level into new_xp, prev_level;

  -- Solve 50*(n-1)*n <= xp -> n = floor((1 + sqrt(1 + xp/12.5)) / 2)
  -- Matches levelForXp() in packages/shared/src/gamification.ts.
  new_level := greatest(1, floor((1 + sqrt(1.0 + (new_xp::numeric / 12.5))) / 2)::integer);

  if new_level <> prev_level then
    update public.character_profiles cp
    set level = new_level,
        updated_at = now()
    where cp.user_id = v_user_id;
  end if;

  return query select new_xp, new_level, (new_level > prev_level);
end;
$$;

grant execute on function public.award_character_xp(integer) to authenticated;
