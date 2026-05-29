-- Progress-photos bucket policies.
-- All access via signed URLs only; bucket itself is private.
-- The convention is `progress-photos/{user_id}/{date}.{ext}` — the first
-- folder segment must match the requesting user's auth.uid().
--
-- Note: the bucket itself is created separately (Dashboard → Storage → New
-- bucket → Name: "progress-photos" → Public: OFF). These policies attach to
-- storage.objects and only take effect once the bucket exists, but creating
-- them ahead of time is harmless.
--
-- Idempotent: drop existing same-named policies first (Postgres does not
-- support `IF NOT EXISTS` on CREATE POLICY).

drop policy if exists "progress_photos_select_own" on storage.objects;
create policy "progress_photos_select_own"
  on storage.objects for select
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "progress_photos_insert_own" on storage.objects;
create policy "progress_photos_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "progress_photos_update_own" on storage.objects;
create policy "progress_photos_update_own"
  on storage.objects for update
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "progress_photos_delete_own" on storage.objects;
create policy "progress_photos_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
