-- Row-level security: every user-scoped table is locked down so a user can
-- only read/write rows where `user_id = auth.uid()`.
-- This is defense in depth — the API layer also scopes by user_id, but RLS
-- catches any bug that lets a query through unscoped.

-- ---------- enable RLS on every table ----------
alter table public.profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.tasks enable row level security;
alter table public.days enable row level security;
alter table public.task_completions enable row level security;
alter table public.task_details enable row level security;
alter table public.journal_entries enable row level security;
alter table public.weights enable row level security;
alter table public.progress_photos enable row level security;
alter table public.user_settings enable row level security;
alter table public.app_state enable row level security;

-- ---------- profiles ----------
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = user_id);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = user_id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy profiles_delete_own on public.profiles
  for delete using (auth.uid() = user_id);

-- ---------- challenges ----------
create policy challenges_select_own on public.challenges
  for select using (auth.uid() = user_id);
create policy challenges_insert_own on public.challenges
  for insert with check (auth.uid() = user_id);
create policy challenges_update_own on public.challenges
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy challenges_delete_own on public.challenges
  for delete using (auth.uid() = user_id);

-- ---------- tasks ----------
create policy tasks_select_own on public.tasks
  for select using (auth.uid() = user_id);
create policy tasks_insert_own on public.tasks
  for insert with check (auth.uid() = user_id);
create policy tasks_update_own on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy tasks_delete_own on public.tasks
  for delete using (auth.uid() = user_id);

-- ---------- days ----------
create policy days_select_own on public.days
  for select using (auth.uid() = user_id);
create policy days_insert_own on public.days
  for insert with check (auth.uid() = user_id);
create policy days_update_own on public.days
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy days_delete_own on public.days
  for delete using (auth.uid() = user_id);

-- ---------- task_completions ----------
create policy task_completions_select_own on public.task_completions
  for select using (auth.uid() = user_id);
create policy task_completions_insert_own on public.task_completions
  for insert with check (auth.uid() = user_id);
create policy task_completions_update_own on public.task_completions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy task_completions_delete_own on public.task_completions
  for delete using (auth.uid() = user_id);

-- ---------- task_details ----------
create policy task_details_select_own on public.task_details
  for select using (auth.uid() = user_id);
create policy task_details_insert_own on public.task_details
  for insert with check (auth.uid() = user_id);
create policy task_details_update_own on public.task_details
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy task_details_delete_own on public.task_details
  for delete using (auth.uid() = user_id);

-- ---------- journal_entries ----------
create policy journal_select_own on public.journal_entries
  for select using (auth.uid() = user_id);
create policy journal_insert_own on public.journal_entries
  for insert with check (auth.uid() = user_id);
create policy journal_update_own on public.journal_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy journal_delete_own on public.journal_entries
  for delete using (auth.uid() = user_id);

-- ---------- weights ----------
create policy weights_select_own on public.weights
  for select using (auth.uid() = user_id);
create policy weights_insert_own on public.weights
  for insert with check (auth.uid() = user_id);
create policy weights_update_own on public.weights
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy weights_delete_own on public.weights
  for delete using (auth.uid() = user_id);

-- ---------- progress_photos ----------
create policy progress_photos_select_own on public.progress_photos
  for select using (auth.uid() = user_id);
create policy progress_photos_insert_own on public.progress_photos
  for insert with check (auth.uid() = user_id);
create policy progress_photos_update_own on public.progress_photos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy progress_photos_delete_own on public.progress_photos
  for delete using (auth.uid() = user_id);

-- ---------- user_settings ----------
create policy user_settings_select_own on public.user_settings
  for select using (auth.uid() = user_id);
create policy user_settings_insert_own on public.user_settings
  for insert with check (auth.uid() = user_id);
create policy user_settings_update_own on public.user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy user_settings_delete_own on public.user_settings
  for delete using (auth.uid() = user_id);

-- ---------- app_state ----------
create policy app_state_select_own on public.app_state
  for select using (auth.uid() = user_id);
create policy app_state_insert_own on public.app_state
  for insert with check (auth.uid() = user_id);
create policy app_state_update_own on public.app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy app_state_delete_own on public.app_state
  for delete using (auth.uid() = user_id);
