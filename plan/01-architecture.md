# 01 — Architecture

A drawing of the target system, what each piece does, and how requests flow through it.

## System diagram

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   Web client            │         │   Mobile client         │
│   Next.js 14 (Vercel)   │         │   React Native (Expo)   │
│   React + TanStack      │         │   React + TanStack      │
│   Query                 │         │   Query                 │
│                         │         │                         │
│   Server Components     │         │   Native UI primitives  │
│   for first paint       │         │   from React Native     │
│                         │         │                         │
└────────────┬────────────┘         └────────────┬────────────┘
             │                                   │
             │   HTTPS · JSON over tRPC          │
             │   Same typed contract for both clients
             │                                   │
             └─────────────────┬─────────────────┘
                               ▼
            ┌──────────────────────────────────────┐
            │   API tier                           │
            │   tRPC routers on Next.js Route      │
            │   Handlers (deployed to Vercel)      │
            │                                      │
            │   • Authenticates each request via   │
            │     Supabase JWT in Authorization    │
            │     header (mobile) or cookie (web)  │
            │   • Authorizes via row-level         │
            │     security on every Postgres query │
            │   • Uploads → signed URL to Storage  │
            └──────────────────┬───────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
   ┌──────────────────┐  ┌────────────┐  ┌──────────────────┐
   │ Supabase Auth    │  │ Postgres   │  │ Supabase Storage │
   │ JWT issuer       │  │ multi-     │  │ progress photos  │
   │ email + OAuth +  │  │ tenant w/  │  │ signed URLs only │
   │ magic links      │  │ RLS        │  │ S3 underneath    │
   └──────────────────┘  └────────────┘  └──────────────────┘
```

## Tier-by-tier

### Web client (Vercel)

- Existing Next.js 14 app, lightly modified:
  - Server Actions are replaced (or thinly wrap) tRPC procedures so the API surface is shared with mobile.
  - The current `better-sqlite3` DB layer is removed in favor of a Supabase client.
  - Auth flows become real (sign up / sign in screens, account menu).
- Server Components still pre-render the first paint; the client takes over for interactive state via TanStack Query against tRPC.
- Hosted on Vercel's free tier for v1.

### Mobile client (Expo)

- A new `apps/mobile` package added to the monorepo.
- React Native via Expo managed workflow. Reuses shared logic from `packages/shared` (types, validation, tRPC client).
- TanStack Query for caching and request lifecycle.
- Native modules used: Expo Image Picker for the progress photo, Expo Notifications for push, Expo SecureStore for the auth token, Expo Updates for OTA app updates.
- Distributed via TestFlight (iOS) and Play Console internal track (Android) until v1.

### API tier

- Lives inside the same Next.js app as Route Handlers at `/api/trpc/[trpc]`.
- tRPC routers are organized by domain:
  - `auth` (minimal — most auth flows hit Supabase directly from the client)
  - `tasks` (CRUD on the configurable task list)
  - `entries` (per-day check-offs, notes, journal, weight, task details)
  - `media` (sign upload URL + record metadata)
  - `stats` (read-only aggregates)
  - `settings` (program length, etc.)
- Every procedure runs through an authentication middleware that reads the bearer token (mobile) or session cookie (web) and resolves the current `userId`.
- Every database query is scoped to `userId`, **and** row-level security on Postgres enforces this independently — defense in depth.

### Data tier — Postgres on Supabase

- A single Postgres database, multi-tenant.
- Every table has a `user_id uuid not null` column with a foreign key to `auth.users(id)`.
- Row-level security policies on each table restrict reads/writes to rows where `user_id = auth.uid()`.
- Daily automated backups; 7-day retention on free tier, extendable.
- Schema migrations live in `apps/web/supabase/migrations/` and run via the Supabase CLI in CI.

### File storage — Supabase Storage

- A `progress-photos` bucket.
- All access is via signed URLs (read + write). Public read is disabled.
- Object keys: `{userId}/{date}.{ext}`.
- Upload flow: client requests a signed upload URL from the API → client PUTs the file directly to storage → client sends the key back to the API to record in Postgres.

### Identity — Supabase Auth

- Supports email + password, magic links, and OAuth (Google + Apple at minimum — Apple is required if you want the iOS app on the App Store with Google sign-in).
- Issues JWTs that both web and mobile use.
- Web stores the session in an HTTP-only cookie via the Supabase Next.js helpers.
- Mobile stores the refresh token in Expo SecureStore.

## Request flow examples

### Marking a task complete (web)

1. User taps the card. The Task card calls a TanStack Query mutation hook.
2. The hook calls `trpc.entries.toggleTask.mutate({ date, taskId, completed })`.
3. The browser request is a `POST /api/trpc/entries.toggleTask` with a session cookie.
4. The API middleware reads the cookie, exchanges for a Supabase session, attaches `userId` to the request context.
5. The router writes to `task_completions` (insert or delete), scoped by `user_id`.
6. The mutation returns the new day state; TanStack Query updates the cache; the UI animates the check.
7. RLS would have rejected the write if `userId` didn't match — defense in depth.

### Uploading a progress photo (mobile)

1. User taps the photo card. `ImagePicker.launchImageLibraryAsync()` returns a local file URI.
2. The mobile app calls `trpc.media.requestPhotoUpload.mutate({ date, mime })`.
3. The API returns a signed PUT URL pointing at `progress-photos/{userId}/{date}.jpg`.
4. The app does a raw `PUT` of the file bytes to that URL.
5. The app calls `trpc.media.confirmPhoto.mutate({ date, key, mime })` to record the row.
6. The day-detail query is invalidated; the new thumbnail renders.

## Why not …

Alternatives I considered and rejected, with reasoning so we can revisit later if circumstances change:

- **REST instead of tRPC.** REST is more familiar but loses end-to-end type safety. tRPC integrates with TanStack Query out of the box. Skip if you want a public API for third parties — we don't, yet.
- **Firebase instead of Supabase.** Comparable feature set. Postgres is more transferable than Firestore if you ever leave the platform. Supabase's row-level security is excellent for this kind of multi-tenancy.
- **Flutter for mobile instead of React Native.** Faster development for someone starting from scratch, but you'd duplicate every piece of UI logic and not share types. RN keeps us in one language and one mental model.
- **Native iOS (SwiftUI) + Android (Compose) instead of RN.** Two codebases, two teams' worth of work. Only worth it if the app needs deep native integrations we don't currently need.
- **Cloudflare Workers / D1.** Tempting (cheap, fast) but no row-level security primitive, weaker tooling for migrations, and the photo storage story is rougher than Supabase Storage.

## Checklist before reading the next doc

- [ ] You understand which tier owns which responsibility.
- [ ] You're OK with the Supabase recommendation, or you've picked a substitute and can mentally map it onto this diagram.
- [ ] You agree that v1 = "web + mobile against the same API," not "web first, mobile later."
