# 02 — Backend

How the database, API, and auth pieces come together. This is the most important doc — get this right and the clients are a matter of plumbing.

## Database — Postgres on Supabase

### Schema, mapped from current SQLite

Every existing SQLite table becomes a Postgres table with a `user_id uuid not null` column and row-level security policies. Types in `text` get upgraded to proper types where it helps.

```sql
-- USERS come from Supabase's auth.users; we never duplicate them.
-- A "profile" table for app-specific user data (display name, timezone, etc.)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'America/Los_Angeles',
  created_at timestamptz not null default now()
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  status text not null default 'active' check (status in ('active','restarted','completed')),
  created_at timestamptz not null default now()
);
create index on public.challenges(user_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  position integer not null,
  title text not null,
  subtitle text,
  icon text not null default 'ListChecks',
  kind text not null default 'check' check (kind in ('check','journal','photo')),
  requires_detail boolean not null default false,
  detail_label text,
  detail_placeholder text,
  archived boolean not null default false
);
create index on public.tasks(user_id);

create table public.days (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  date date not null,
  notes text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table public.task_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  task_id uuid not null references public.tasks(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, date, task_id)
);

create table public.task_details (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  task_id uuid not null references public.tasks(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, date, task_id)
);

create table public.journal_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table public.weights (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_lbs numeric(6,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table public.progress_photos (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  storage_key text not null,
  mime text,
  uploaded_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_days integer not null default 100 check (total_days between 1 and 365)
);
```

Notes on the schema changes vs current SQLite:

- `id` columns become UUIDs (collision-free across users).
- Task IDs become UUIDs, which means `task_completions.task_id` and similar references are UUIDs too. This means the seed-default trick of "task IDs 1-12 line up forever" goes away — we now look up via UUID, which is correct anyway.
- `notes` lives on `days` keyed by `(user_id, date)` so two users can share a `date` value without collision.
- `app_state` from the current schema is replaced by per-user state on `user_settings` and individual `app_state` rows only where strictly needed; consider whether you even need a free-form key/value table on Postgres.

### Row-level security

For every table, enable RLS and add a policy that scopes by `user_id`:

```sql
alter table public.tasks enable row level security;

create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);

create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);
```

Apply the same template to every table that has a `user_id` column. **Do not** disable RLS in production — even a single missed scope in the API layer is now harmless because the DB itself rejects the query.

### Migrations

- Migrations live in `apps/web/supabase/migrations/{timestamp}_{name}.sql`.
- Generated and applied with the [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase db diff`, `supabase db push`.
- CI runs `supabase db push --linked` against the staging project on every PR; production is deployed manually for v1 (one-button when comfortable).

### Migrating existing local SQLite data

For your own data — and for early users you onboard from the local prototype — we'll ship a one-shot CLI script in `tools/import-from-sqlite.ts`:

1. Read every row from the local SQLite file.
2. Sign in to Supabase as the target user (interactive prompt, refresh-token flow).
3. Resolve task UUIDs by matching `position + title` against the seeded tasks (or insert missing ones).
4. Insert challenges, days, completions, journal entries, weights, task details, and progress photo records.
5. Upload photo bytes to Supabase Storage with the correct keys.
6. Print a summary diff at the end.

The script is idempotent — running it twice doesn't double-insert.

## API — tRPC on Next.js

### Folder layout

```
apps/web/
├── app/
│   └── api/
│       └── trpc/
│           └── [trpc]/
│               └── route.ts          # the Route Handler hosting tRPC
├── server/
│   └── routers/
│       ├── _app.ts                   # appRouter (combines all routers)
│       ├── tasks.ts
│       ├── entries.ts
│       ├── media.ts
│       ├── stats.ts
│       └── settings.ts
│   └── trpc.ts                       # initTRPC, context, middleware
```

### Context

Every procedure gets a context with the authed user and a Supabase client scoped to that user's JWT (so RLS naturally applies to every query the procedure issues).

```ts
// server/trpc.ts (sketch)
export const createContext = async ({ req }: { req: Request }) => {
  const supabase = createServerClient(req);            // reads cookie or bearer token
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
};

const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);
```

### Example router

```ts
// server/routers/entries.ts (sketch)
export const entriesRouter = router({
  toggleTask: protectedProcedure
    .input(z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      taskId: z.string().uuid(),
      completed: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.completed) {
        await ctx.supabase.from("task_completions").upsert({
          user_id: ctx.user.id,
          date: input.date,
          task_id: input.taskId,
        });
      } else {
        await ctx.supabase
          .from("task_completions")
          .delete()
          .eq("user_id", ctx.user.id)
          .eq("date", input.date)
          .eq("task_id", input.taskId);
      }
      return { ok: true };
    }),
});
```

### Validation

All inputs validated via [Zod](https://zod.dev/). Date strings must match `YYYY-MM-DD`. Future dates rejected at the procedure level (current Server Action behavior preserved). Weight bounded to `(0, 2000]`. Image MIME must be in an allow-list.

### Rate limiting

For v1: ship without rate limiting and watch the metrics. Add an [Upstash Redis](https://upstash.com/) + middleware once we see abuse — fixed-window 60 requests/minute per IP for write procedures is plenty.

## Auth — Supabase Auth

### Methods to enable

1. **Email + password.** Default.
2. **Magic link.** Reduces password-reset friction; one-click sign-in from email.
3. **Google OAuth.** Frictionless desktop signup.
4. **Apple OAuth.** Required by Apple if you offer Google sign-in on iOS. Add this before App Store submission.

Don't bother with Twitter, GitHub, Facebook for v1.

### Session handling

| Client    | Storage                                 | Refresh                                |
| --------- | --------------------------------------- | -------------------------------------- |
| Web       | HTTP-only cookie via `@supabase/ssr`    | Auto-refreshed by Supabase helpers     |
| Mobile    | Refresh token in Expo SecureStore       | Access token kept in memory, refreshed by Supabase client |

### Account flows we need

- Sign up (web + mobile)
- Sign in (web + mobile)
- Magic link (web + mobile — deep link returns to app)
- Password reset (web — handled by Supabase email template)
- Sign out (web + mobile, clears local cache)
- **Delete my account** (covered in [07](./07-production-readiness.md)) — must cascade-delete every row + Storage object.

### What about the current "no-auth" experience?

Two options:

1. **Force sign-in.** Cleaner, single code path, no anonymous data to migrate. Recommended.
2. **Anonymous accounts.** Supabase supports `signInAnonymously()` — users can use the app with a generated UUID and then "upgrade" to an email later. More user-friendly, more code. Defer to v1.1 unless onboarding friction shows up in user testing.

## Migration plan for your own existing data

You currently have a local DB with real entries. Here's the safe path:

1. Stand up a staging Supabase project.
2. Run all migrations against staging.
3. Run `tools/import-from-sqlite.ts` pointed at staging.
4. Open the staging app, verify every check, weight, note, photo, and journal entry appears.
5. Repeat against production once you're satisfied.
6. Keep the local SQLite file for a month as belt-and-suspenders before deleting.

## Checklist for this doc

- [ ] You've created a Supabase project (or signed up if not yet).
- [ ] You've decided whether to enable anonymous accounts in v1 (default: no).
- [ ] You've reviewed the schema and flagged any column types you'd change.
- [ ] You've confirmed Apple OAuth is on the to-do for App Store submission.
- [ ] You agree to the migration script approach for moving your existing data.
