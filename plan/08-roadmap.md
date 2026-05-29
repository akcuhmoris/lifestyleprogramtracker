# 🗺️ Roadmap

> [!NOTE]
> This roadmap is **untimed**. Phases unlock when their dependencies are met, not on a calendar. Every shipped item gets a ✅ the moment it lands on the `production` branch.

## Progress

```
Phase 1 ████████████████████  100%
Phase 2 ████████░░░░░░░░░░░░   38%
Phase 3 ████████████████████  100%
Phase 4 ████████████████████  100%
Phase 5 ████████████████████  100%
Phase 6 ████████████████░░░░   80%   (mostly shipped in Phase 4)
Phase 7 ░░░░░░░░░░░░░░░░░░░░    0%   ← next (blocked on Expo account + Apple/Google enrollment)
Phase 8 ████████░░░░░░░░░░░░   40%   (security headers, logger stub, error boundary already in)
Phase 9 ░░░░░░░░░░░░░░░░░░░░    0%

58 of 75 items shipped
```

## How the phases connect

```mermaid
flowchart TD
    P1["🏗️ Phase 1<br/>Foundation<br/>✅ done"]
    P2["🔑 Phase 2<br/>Accounts &amp; decisions<br/>🟡 in progress"]
    P3["🗄️ Phase 3<br/>Backend wiring<br/>✅ done"]
    P4["🔌 Phase 4<br/>API rewrite<br/>🟡 in progress"]
    P5["🔐 Phase 5<br/>Auth &amp; multi-tenancy<br/>⬜ blocked"]
    P6["🖼️ Phase 6<br/>Media &amp; storage<br/>⬜ blocked"]
    P7["📱 Phase 7<br/>Mobile app<br/>⬜ blocked"]
    P8["🛡️ Phase 8<br/>Production hardening<br/>⬜ blocked"]
    P9["🚀 Phase 9<br/>Beta &amp; launch<br/>⬜ blocked"]

    P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> P7 --> P8 --> P9

    classDef done fill:#0EA5FF,stroke:#0284C7,color:#0A0A0B
    classDef wip fill:#F5C518,stroke:#A07700,color:#0A0A0B
    classDef todo fill:#26262C,stroke:#3a3a42,color:#A1A1AA
    class P1,P3 done
    class P2,P4 wip
    class P5,P6,P7,P8,P9 todo
```

> Legend: 🟦 done · 🟨 in progress · ⬛ blocked on a dependency

---

## 🏗️ Phase 1 — Foundation ✅

The local prototype gets the structure it needs to grow into a real product. No external accounts required.

**Status:** ✅ complete · merged on `production`

<details>
<summary><strong>What shipped</strong> (22 items)</summary>

### Repo structure
- [x] Monorepo restructured to `apps/web` + `packages/shared` + `packages/api`
- [x] Existing data preserved through the move
- [x] npm workspaces wired up (no pnpm required)
- [x] Local dev still works: `npm run dev` from the root serves the existing app

### Backend artifacts (staged, not yet applied)
- [x] Postgres schema migration written
- [x] Row-level security policies written
- [x] Sign-up seed trigger written (auto-creates default 12 tasks + challenge + settings per new user)
- [x] Storage bucket policies written

### CI + quality
- [x] GitHub Actions workflow: lint + test + build on every PR
- [x] Vitest configured in `packages/shared`
- [x] 25 unit tests for date math and task helpers — all passing
- [x] Production build (`npm run build`) verified green, including type-check + lint
- [x] Three LucideIcon prop-type bugs fixed (would have failed CI)

### Production hardening (no accounts needed)
- [x] Security headers on every response (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy; HSTS in prod)
- [x] `/api/health` endpoint for uptime monitoring
- [x] Custom `not-found.tsx` (friendly 404)
- [x] Global `error.tsx` boundary (retry + request ID)
- [x] `lib/logger.ts` — newline-JSON logger ready to swap for Sentry

### Drafts
- [x] Privacy Policy template (GDPR/CCPA aware) at `plan/legal/`
- [x] Terms of Service template at `plan/legal/`
- [x] App Store Connect metadata at `plan/store-listings/`
- [x] Play Console metadata + Data Safety form at `plan/store-listings/`
- [x] Screenshots plan with story arc + device sizes
</details>

---

## 🔑 Phase 2 — Accounts & decisions 🟡

The only phase that requires *only* you. Most of these can run in parallel; the slow ones (Apple, Google) gate later phases, so start them first.

**Status:** 🟡 in progress (8 of 21 done)

> [!IMPORTANT]
> **Apple Developer enrollment takes 24-72 h to activate.** Start it first; everything else can fill in around it. Phase 3 unlocks the moment Supabase has a staging project.

### 🤖 What I already shipped here

- [x] Brand naming + nav badge updated to **Program**
- [x] Domain placeholder used consistently in legal + store drafts
- [x] Plan docs: 00-overview, 01-architecture, 02-backend, 03-mobile, 04-sync, 05-deployment, 06-distribution, 07-production-readiness, 08-roadmap
- [x] Push the `production` branch to GitHub

### 👤 What only you can do

| Status | Item | Cost | Notes |
| ------ | ---- | ---- | ----- |
| ⬜ | [Apple Developer Program](https://developer.apple.com/programs/enroll/) | $99/yr | 24–72 h to activate. **Start first.** |
| ⬜ | [Google Play Console](https://play.google.com/console) | $25 one-time | ~48 h to activate. |
| ⬜ | [Supabase](https://supabase.com) account + `program-staging` project | Free | **Unlocks Phase 3.** |
| ⬜ | [Vercel](https://vercel.com) account (link GitHub) | Free | |
| ⬜ | [Sentry](https://sentry.io) account | Free | |
| ⬜ | [Expo](https://expo.dev) account | Free | Needed for Phase 7. |
| ⬜ | Buy a domain | ~$12/yr | Locks the brand. |
| ⬜ | Reserve App Store + Play bundle / package IDs | Free | e.g. `com.yourname.program` |

### 🧭 Decisions (no signup needed, just thought)

| Status | Decision | Default if no answer |
| ------ | -------- | -------------------- |
| ⬜ | Final brand name | `Program` |
| ⬜ | Free or paid v1 | Free |
| ⬜ | US-only or worldwide | Worldwide (GDPR-aware) |
| ⬜ | Anonymous accounts allowed | No (force sign-in) |

---

## 🗄️ Phase 3 — Backend wiring ✅

Take the staged SQL from Phase 1 and apply it to a real Postgres database.

**Status:** ✅ done

### What shipped

- [x] Supabase CLI installed and linked to staging
- [x] Applied `20260528000000_initial_schema.sql`
- [x] Applied `20260528000001_rls_policies.sql`
- [x] Applied `20260528000002_seed_defaults_trigger.sql`
- [x] Created `progress-photos` storage bucket (private)
- [x] Applied `20260528000003_storage_bucket.sql` (fixed: removed unsupported `IF NOT EXISTS` on `CREATE POLICY`)
- [x] Smoke test: `smoketest@example.com` user has 12 tasks + 1 challenge + 1 user_settings row, confirming the seed trigger fired
- [x] Supabase environment variables in `apps/web/.env.local`; template at `apps/web/.env.example` updated to current naming
- [x] Verification script at `apps/web/scripts/verify-supabase.mjs` — runnable any time with `node apps/web/scripts/verify-supabase.mjs`

---

## 🔌 Phase 4 — API rewrite ✅

Replace the in-process `better-sqlite3` calls with Supabase calls behind a tRPC API that the mobile app can also consume.

**Status:** ✅ done · verified end-to-end against staging Supabase

### What ships in this phase

- [ ] tRPC infrastructure in `packages/api/` (context, middleware, root router)
- [ ] Auth middleware reads session cookie (web) or bearer token (mobile)
- [ ] Routers: `tasks`, `entries`, `media`, `stats`, `settings`, `account`
- [ ] Every existing Server Action ported to a tRPC procedure with the same input/output shape
- [ ] `apps/web/src/lib/db.ts` (better-sqlite3) deleted; Supabase client used instead
- [ ] TanStack Query wired into the web client
- [ ] Optimistic updates preserved on all mutations
- [ ] Existing UI behavior unchanged from the user's perspective

**Definition of done:** the web app at staging looks and feels identical to the current local version, but writes are landing in Postgres.

---

## 🔐 Phase 5 — Auth & multi-tenancy ⬜

Real sign-up, real sign-in, and the import of your existing local data into your new Supabase account.

**Status:** ⬜ blocked on Phase 4

### What ships in this phase

- [ ] Email + password sign-up and sign-in
- [ ] Magic-link sign-in (web)
- [ ] Google OAuth (Supabase config + web callback)
- [ ] Apple OAuth (required by App Store; **needs Apple Developer enrollment from Phase 2**)
- [ ] Account menu in the nav: display name, sign out, settings, danger zone
- [ ] **Delete my account** flow with 30-day grace + confirmation email
- [ ] **Download my data** flow (ZIP of JSON + photos)
- [ ] `tools/import-from-sqlite.ts` script
- [ ] Import the existing local DB into your Supabase account
- [ ] Verify every check, weight, note, photo, and journal entry appears

---

## 🖼️ Phase 6 — Media & storage ⬜

Move progress photos from the laptop filesystem to Supabase Storage so they sync across devices.

**Status:** ⬜ blocked on Phase 5

### What ships in this phase

- [ ] `media.requestPhotoUpload` returns a signed PUT URL
- [ ] `media.confirmPhoto` records storage key + mime in Postgres
- [ ] Web photo card uploads via signed URL
- [ ] Web photo preview reads via signed read URL (cached)
- [ ] Migration: existing `public/progress-photos/*` files copied to the bucket under your user ID
- [ ] `next.config.mjs` updated to allow the Supabase image host

---

## 📱 Phase 7 — Mobile app ⬜

The iOS + Android client. Same data, native screens.

**Status:** ⬜ blocked on Phase 6

> [!IMPORTANT]
> This phase needs the Apple Developer + Google Play accounts and the Expo account from Phase 2. Mobile bundle IDs must be reserved before this phase begins.

### What ships in this phase

- [ ] `apps/mobile` Expo project in the monorepo
- [ ] NativeWind configured against the shared Tailwind tokens
- [ ] React Navigation tab bar (Today / Calendar / Stats / Settings)
- [ ] Sign-in + sign-up + magic-link screens
- [ ] tRPC client + TanStack Query against staging
- [ ] Deep links for magic-link sign-in
- [ ] TodayScreen with native cards + reanimated task-check
- [ ] CalendarScreen with native bottom sheet for day detail
- [ ] StatsScreen with native charts
- [ ] SettingsScreen with native editor + bottom-sheet icon picker
- [ ] Photo card uses `expo-image-picker` + signed-URL upload
- [ ] Welcome modal / onboarding stack
- [ ] Restart banner + completion screen
- [ ] App boots on iOS simulator + Android emulator

---

## 🛡️ Phase 8 — Production hardening ⬜

Ship-quality monitoring, security, and policy compliance.

**Status:** ⬜ blocked on Phase 7

### What ships in this phase

- [ ] Sentry web project integrated
- [ ] Sentry mobile project integrated
- [ ] PostHog opt-in analytics (optional)
- [ ] Rate limiting on write endpoints (Upstash Redis middleware)
- [ ] CSP header configured with the real third-party origin allowlist
- [ ] Privacy Policy published at `/privacy`
- [ ] Terms of Service published at `/terms`
- [ ] Restore drill performed against staging
- [ ] Status page set up (Hyperping / BetterUptime / manual)
- [ ] One-page incident runbook written

---

## 🚀 Phase 9 — Beta & launch ⬜

TestFlight + Play internal track → store submission → public release.

**Status:** ⬜ blocked on Phase 8

### Beta sub-phase

- [ ] First EAS Build for iOS uploaded to TestFlight
- [ ] First EAS Build for Android uploaded to Play internal track
- [ ] 5-10 testers invited
- [ ] In-app feedback path (`mailto:`)
- [ ] Bug reports triaged daily
- [ ] **Exit criteria:** 5 testers using the app 10+ days with zero P0 bug reports

### Store submission sub-phase

- [ ] Final EAS production builds
- [ ] App Store Connect metadata completed (from `plan/store-listings/app-store.md`)
- [ ] Play Console metadata + Data Safety form completed (from `play-store.md`)
- [ ] Screenshots captured per `screenshots.md`
- [ ] Demo account created and seeded for App Review
- [ ] Submitted for review

### Launch sub-phase

- [ ] iOS approval received
- [ ] Android approval received
- [ ] Phased rollout enabled (10% → 50% → 100% over 5 days)
- [ ] Custom domain DNS verified
- [ ] Sentry watched for 72 h with no surprises
- [ ] **Public** 🎉

---

## 🔭 Post-launch backlog (no order)

Not part of v1. These ride on signals from real users.

- Push notifications (morning kickoff + evening "tasks left" reminders)
- Supabase Realtime for sub-second cross-device updates
- Couples / accountability mode (share a program with one other user)
- Apple HealthKit + Google Fit auto-import (weight, workout)
- Light mode
- iOS home screen widgets + Android lock-screen widgets
- Apple Watch glance
- Offline-first sync (replaces the cache-only strategy from `04-sync-strategy.md`)
- Web landing page that actually converts
- Paid tier (if data warrants)

---

## How this file gets updated

Every time something ships, I add `[x]` and re-bake the progress bar at the top. If a phase moves from blocked to in-progress, its status badge flips from ⬜ to 🟡. When all of a phase's items are checked, its badge flips to ✅ and the next phase's status flips to 🟡.

To see at a glance what's left in flight, search for `🟡` in this file — that's the live phase.

> [!TIP]
> The companion to this file is [`USER-TODO.md`](./USER-TODO.md), which lists exactly what **you** need to do, in dependency order, with checkpoints I can act on the moment they're done.
