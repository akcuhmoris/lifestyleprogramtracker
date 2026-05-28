# 08 — Roadmap

A concrete 12-week plan from today's local prototype to a v1 launch with web + iOS + Android. Pad as needed for your real availability — these are working weeks, not calendar weeks.

## Pre-flight (week 0)

Things you do before writing any production code. ~1-3 days of evenings.

- [ ] Sign up for the accounts in [05 — Deployment](./05-deployment.md).
- [ ] Buy a domain.
- [ ] Enroll in the Apple Developer Program (24-72h activation, do this first).
- [ ] Reserve App Store + Play Console listings as drafts.
- [ ] Decide on the v1 brand name (current default: `Program`).
- [ ] Decide on free vs paid (default: free).

## Week 1 — Foundation

**Goal:** the existing app runs unchanged inside a monorepo with the future structure ready to absorb new code.

- [ ] Restructure the repo: `apps/web`, `packages/shared`, `packages/api`, `pnpm-workspace.yaml`.
- [ ] Move `lib/date.ts`, `lib/tasks.ts`, `lib/icons.ts` into `packages/shared`.
- [ ] Move Zod schemas (inline today) into `packages/shared/src/schemas.ts`.
- [ ] CI: GitHub Actions running typecheck + lint on every PR.
- [ ] Update `README.md` to point at the monorepo layout.

**Definition of done:** `pnpm install && pnpm --filter web dev` still serves the current app at `localhost:3000`.

## Week 2 — Backend: schema + RLS

**Goal:** Supabase project exists with the production schema and RLS policies. Test data flows end-to-end.

- [ ] Supabase staging project created.
- [ ] Initial migration written (all tables from [02 — Backend](./02-backend.md)).
- [ ] RLS policies on every user-scoped table.
- [ ] Apply via Supabase CLI; verify schema in the dashboard.
- [ ] Seed script: insert a test user + default tasks for that user.
- [ ] Manual smoke test from the SQL editor: insert a `task_completion`, confirm RLS rejects access from another user's JWT.

**Definition of done:** you can sign in as a test user in the Supabase dashboard and see only their data.

## Week 3 — API: tRPC routers

**Goal:** every Server Action in the current app has a tRPC procedure equivalent backed by Supabase.

- [ ] tRPC infrastructure in `packages/api`: context, middleware, root router.
- [ ] Routers: `tasks`, `entries`, `media`, `stats`, `settings`.
- [ ] Mount tRPC under `apps/web/app/api/trpc/[trpc]/route.ts`.
- [ ] Auth middleware: read session cookie OR bearer token, resolve `userId`.
- [ ] Migrate Server Actions to call tRPC procedures (or refactor the web to use the tRPC client directly).
- [ ] Manual smoke test: open the existing web app against staging; every interaction works as before but now via tRPC + Postgres.

**Definition of done:** the web app has zero references to `better-sqlite3` and works against Supabase.

## Week 4 — Auth + multi-tenancy on web

**Goal:** the web app requires sign-in. Each user sees only their data.

- [ ] Sign-up + sign-in + magic-link screens.
- [ ] Google OAuth + Apple OAuth enabled in Supabase.
- [ ] Account menu in the nav: display name, sign out, settings link, danger zone.
- [ ] Delete-account flow (covered in [07](./07-production-readiness.md)).
- [ ] Update existing seed logic: on first sign-in for a user with no tasks, seed the default 12.
- [ ] Migrate your existing local data to your new Supabase account using the import script (covered in [02](./02-backend.md)).

**Definition of done:** a new email signs up, sees an empty Day 1, customizes their tasks, and uses the app for a day without issues.

## Week 5 — File storage migration

**Goal:** progress photos live in Supabase Storage, not `public/`.

- [ ] Create `progress-photos` bucket; configure RLS so users only access `progress-photos/{their-user-id}/*`.
- [ ] `media.requestPhotoUpload` returns a signed PUT URL.
- [ ] `media.confirmPhoto` records the storage key + mime in Postgres.
- [ ] Web client: photo card uploads via signed URL, displays via signed read URL.
- [ ] Migration: any existing `public/progress-photos/*` files copied to the bucket via a one-shot script.
- [ ] `next.config.mjs` updated to allow the Supabase image host.

**Definition of done:** upload a photo on the web, see it in the bucket, see the thumbnail in the calendar's day detail modal.

## Week 6 — Mobile shell

**Goal:** Expo app boots, shows the bottom tab bar, can authenticate.

- [ ] `apps/mobile` Expo project created in the monorepo.
- [ ] NativeWind configured against the shared Tailwind tokens.
- [ ] React Navigation bottom tab bar: Today / Calendar / Stats / Settings.
- [ ] Sign-in / sign-up screens.
- [ ] tRPC client + TanStack Query wired up, hitting staging.
- [ ] Deep-link config for magic-link sign-in.
- [ ] App runs on the iOS simulator + Android emulator.

**Definition of done:** sign in on the mobile app and see a blank Today screen with the correct day number.

## Week 7 — Mobile: Today + Calendar screens

**Goal:** the two most-used screens work natively.

- [ ] TodayScreen: progress ring, progress bar, task cards (including journal modal + photo picker), notes field, weight card.
- [ ] CalendarScreen: grid + day-detail modal (a native bottom sheet).
- [ ] Reanimated for task-check animations + ripple.
- [ ] `expo-image-picker` for photo selection; signed-URL upload.
- [ ] `expo-haptics` light feedback on each check.

**Definition of done:** complete a full day on the mobile app — every task check, photo upload, notes save, weight log — and verify each change shows up on the web.

## Week 8 — Mobile: Stats + Settings + polish

**Goal:** mobile reaches feature parity with web.

- [ ] StatsScreen with native charts (Skia or Reanimated for the sparkline).
- [ ] SettingsScreen: length input, tasks list editor, icon picker.
- [ ] Restart banner + restart confirmation sheet.
- [ ] Day-N completion celebration screen.
- [ ] Welcome modal / onboarding stack for first-launch.

**Definition of done:** open the mobile app cold, sign in, customize a task, complete a day, restart the program, restart again — every screen feels finished.

## Week 9 — Production hardening

**Goal:** ship-quality observability and reliability.

- [ ] Sentry on web + mobile.
- [ ] PostHog (optional) with opt-out toggle.
- [ ] Rate limiting on write endpoints (Upstash Redis middleware).
- [ ] Security headers (CSP, HSTS, etc.) on web.
- [ ] Account-deletion flow shipped.
- [ ] Data-export endpoint (email a ZIP) — manual for now is fine.
- [ ] Privacy Policy + Terms of Service drafted and hosted at `/privacy` and `/terms`.

**Definition of done:** Sentry shows zero unhandled errors for 48 hours of dogfooding.

## Week 10 — Closed beta

**Goal:** real users on real devices report real bugs.

- [ ] TestFlight build live, invite ~10 close friends.
- [ ] Play Console internal track, same crew.
- [ ] Web staging URL shared with the same crowd.
- [ ] In-app feedback link (mailto: works fine).
- [ ] Daily standup with yourself: pick 1-2 bug reports a day to fix.

**Definition of done:** 5 testers have used the app for 7+ days without a P0 bug.

## Week 11 — Store submission

**Goal:** Apple + Google have your binaries.

- [ ] Final EAS production builds.
- [ ] App Store Connect: complete metadata, screenshots, app review info.
- [ ] Play Console: complete metadata, screenshots, data safety form.
- [ ] Submit for review.
- [ ] While waiting: complete the web landing page or sign-in entry.
- [ ] Set up the status page.

**Definition of done:** both reviews submitted; you've eaten popcorn while waiting.

## Week 12 — Launch

**Goal:** the public can install.

- [ ] iOS App Store approval (typically by mid-week).
- [ ] Google Play approval (typically by mid-week).
- [ ] Phased rollout enabled (10% → 50% → 100% over 5 days).
- [ ] Web custom domain DNS verified; production-ready.
- [ ] Post a launch tweet / Mastodon post / wherever your audience is.
- [ ] Watch Sentry like a hawk for 72 hours.

**Definition of done:** a stranger downloaded the app, completed Day 1, and the only Sentry events you saw were the ones you expected.

## What v1.1 looks like (post-launch backlog)

In rough priority order:

1. Push notifications (morning kickoff + evening "tasks left" reminders).
2. Supabase Realtime for sub-second cross-device updates.
3. Couples / accountability mode — share a program with one other user.
4. Apple HealthKit + Google Fit integrations for auto-weight and auto-workout import.
5. Light mode (currently dark-only, intentionally).
6. Widgets (iOS home screen + Android lock screen).
7. Apple Watch glance / quick-check.
8. Offline-first sync (Option B from [04](./04-sync-strategy.md)).
9. A web landing page that converts.
10. Paid tier (if the data says people want one).

## How to use this roadmap

- Treat the weeks as **focus blocks**, not deadlines. If week 3 turns into 2 weeks, the launch slides — but the order rarely changes.
- Don't skip weeks 9-10. The temptation is huge ("it's mostly working, let's ship!"). Resist. The difference between "mostly working" and "trustworthy" is what determines whether your first 100 users stay.
- **Each Friday:** write yourself a one-line note about what you didn't ship that week. After 4 weeks, look at the list. Some of it should disappear (was never important). Some of it is the actual scope you missed; cut it now while it's cheap.

## Checklist for this doc

- [ ] You've blocked time on your calendar for at least the first 4 weeks.
- [ ] You've told 1-2 friends "I'm going to ask you to test something in ~6 weeks."
- [ ] You have a current-state snapshot of your data backed up before you start migrating in week 2.
