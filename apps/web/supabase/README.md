# Supabase migrations

This folder is the source of truth for the Postgres schema and policies once a Supabase project exists.

## Files

| File                                         | What it does                                                          |
| -------------------------------------------- | --------------------------------------------------------------------- |
| `migrations/20260528000000_initial_schema.sql` | All tables (challenges, tasks, days, completions, journal, weights, photos, settings, app_state, profiles). |
| `migrations/20260528000001_rls_policies.sql`   | Row-level security on every table — users see only their own rows.    |
| `migrations/20260528000002_seed_defaults_trigger.sql` | Auto-seeds a new user's account with the default 12-task program + a 100-day setting + an active challenge starting today. |
| `migrations/20260528000003_storage_bucket.sql` | Storage RLS for the `progress-photos` bucket.                         |

## How to apply (when you're ready)

1. Install the Supabase CLI: `brew install supabase/tap/supabase` (or see <https://supabase.com/docs/guides/cli/getting-started>).
2. Create your Supabase project at <https://supabase.com>.
3. From `apps/web/`:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

4. In the Supabase dashboard, create the **Storage** bucket named `progress-photos` (Public: OFF), then re-run `supabase db push` so the storage policies in `20260528000003` apply.

## Notes

- These migrations are idempotent (every `create table` uses `if not exists`, every `create policy` uses unique names). Running them twice is safe.
- The `auth.users` trigger in `20260528000002` runs as `security definer` because it needs to insert into `public.tasks` etc. on behalf of a user who doesn't yet have a session. This is the standard Supabase pattern.
