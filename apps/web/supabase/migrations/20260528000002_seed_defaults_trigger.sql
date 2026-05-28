-- When a new user signs up, seed their account with the default 12-task program
-- and a user_settings row. This runs server-side via a database trigger so the
-- API doesn't need to handle the "first sign-in" case explicitly.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_challenge_id uuid;
begin
  -- 1. Profile row
  insert into public.profiles (user_id) values (new.id);

  -- 2. Settings row (defaults to 100-day program)
  insert into public.user_settings (user_id, total_days) values (new.id, 100);

  -- 3. Active challenge starting today
  insert into public.challenges (user_id, start_date, status)
  values (new.id, (now() at time zone 'utc')::date, 'active')
  returning id into new_challenge_id;

  -- 4. Default 12 tasks (the 100 Hard starter template). Users can edit anything.
  insert into public.tasks (user_id, position, title, subtitle, icon, kind, requires_detail, detail_label, detail_placeholder)
  values
    (new.id, 0,  'Structured diet',   'No cheat meals',                'Apple',      'check',   false, null, null),
    (new.id, 1,  'No alcohol',        null,                            'Beer',       'check',   false, null, null),
    (new.id, 2,  'No processed food', null,                            'Sandwich',   'check',   false, null, null),
    (new.id, 3,  'Workout 1',         '45 min · log what you did',     'Dumbbell',   'check',   true,
       'What did you do?', 'e.g. Push day · bench, OHP, dips, triceps'),
    (new.id, 4,  'Workout 2',         '45 min outdoors · log what you did', 'Trees', 'check',   true,
       'What did you do?', 'e.g. 5-mile zone 2 run along the river'),
    (new.id, 5,  '1 gallon of water', null,                            'GlassWater', 'check',   false, null, null),
    (new.id, 6,  'Read 10 pages',     'Nonfiction',                    'BookOpen',   'check',   false,
       'What did you read?', 'e.g. Atomic Habits · ch. 3, pp. 41–53'),
    (new.id, 7,  'Progress photo',    null,                            'Camera',     'photo',   false, null, null),
    (new.id, 8,  'Self-care block',   '20–30 min',                     'Sparkles',   'check',   false, null, null),
    (new.id, 9,  '7+ hours sleep',    null,                            'Moon',       'check',   false, null, null),
    (new.id, 10, 'No social media',   'Until morning task done',       'Smartphone', 'check',   false, null, null),
    (new.id, 11, 'Journal entry',     'Tap to write',                  'PenLine',    'journal', false, null, null);

  return new;
end;
$$;

-- Trigger fires once per new user record in auth.users.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
