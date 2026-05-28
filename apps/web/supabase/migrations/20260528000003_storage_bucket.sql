-- Progress-photos bucket. All access via signed URLs only; bucket is private.
-- Run AFTER you've created the bucket in the Supabase dashboard:
--   Storage → New bucket → Name: "progress-photos" → Public: OFF → Create

-- RLS on storage.objects ensures each user can only touch keys under their UUID.
-- The convention is `progress-photos/{user_id}/{date}.{ext}`.

create policy if not exists "progress_photos_select_own"
  on storage.objects for select
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "progress_photos_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "progress_photos_update_own"
  on storage.objects for update
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "progress_photos_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
