# What you need to do — sequenced

The plan in this folder is detailed but most of it depends on either **accounts** (Supabase, Apple, etc.) or **secrets** that only you can produce. This doc separates the two streams:

- **🤖 AI-doable** items — things I can do on this branch with no input from you.
- **👤 You-only** items — accounts, payments, secrets, app-store listings.

Work the two columns in parallel. The dependency arrows are at the bottom of each section.

> **Where you are right now:** the monorepo migration is done. The app still works locally exactly as before (just from `apps/web/` now). All your data is preserved. Schema + RLS SQL for Supabase is staged in `apps/web/supabase/migrations/`. The next steps are listed below.

---

## Right now — do this today (≤ 30 minutes)

### 👤 You-only

| # | Task | Time | Why now |
| - | ---- | ---- | ------- |
| 1 | **Enroll in the Apple Developer Program** at <https://developer.apple.com/programs/enroll/>. $99/year. | 10 min to fill, **24–72 h to activate**. | This is the slowest gate. Start it now so it's done by week 4. |
| 2 | **Create a Google Play Console account** at <https://play.google.com/console>. $25 one-time. | 10 min to fill, **~48 h to activate**. | Same reason. |
| 3 | **Decide on the final brand name.** Current default in the code is `Program`. | 10 min of thought. | Affects domain purchase + App Store name + bundle ID. |

When 1 & 2 are filing, move on to "this week."

---

## This week — accounts + decisions

### 👤 You-only

| # | Task | Time | Notes |
| - | ---- | ---- | ----- |
| 4 | **Buy a domain.** Cloudflare Registrar or Porkbun. $12/year. | 15 min | Pick now to match the brand. e.g. `program.app`, `tryprogram.com`, `getprogram.io`. |
| 5 | **Create a Supabase account** at <https://supabase.com>. Don't create a project yet. | 5 min | We'll create staging + production projects together in week 2. |
| 6 | **Create a Vercel account** linked to your GitHub. | 5 min | |
| 7 | **Create a Sentry account** at <https://sentry.io>. Free tier. | 5 min | |
| 8 | **Decide:** free or paid for v1? | 5 min | Recommended: free. Skip Stripe/RevenueCat for v1. |
| 9 | **Decide:** US-only or worldwide? | 5 min | Affects whether you need a GDPR-compliant privacy policy on day one (recommended yes either way). |

### 🤖 What I can do in parallel

While you're filling out forms:

- [x] **Monorepo migration.** Web app moved to `apps/web/`. Shared code in `packages/shared/`. ✅ done.
- [x] **Stage Supabase SQL migrations.** Schema + RLS + sign-up trigger + storage policies. ✅ done, ready to apply.
- [x] **Scaffold `packages/api`.** Placeholder for the tRPC routers. ✅ done.
- [x] **Add CI workflow** that runs lint + build on every PR. ✅ done.
- [ ] **Draft a Privacy Policy** and **Terms of Service**. I can write boilerplate that's a good starting point — you'll want a lawyer to review before publishing if you're going for real users at scale.
- [ ] **Draft App Store + Play Store metadata** (description, keywords, screenshots plan).

→ Tell me to do those two drafts and I'll add them under `plan/legal/` and `plan/store-listings/`.

---

## Week 2 — Supabase setup

**Wait for:** items 5 + 8 above.

### 👤 You-only

| # | Task | Notes |
| - | ---- | ----- |
| 10 | **Create a Supabase project for `staging`.** | Pick a region near you. Pick a strong DB password and put it in a password manager. |
| 11 | **Send me the staging project's URL + anon key + service-role key.** | Share via a secure channel; service-role key is sensitive. |

### 🤖 What I'll do after you give me the keys

- [ ] Apply all migrations in `apps/web/supabase/migrations/` to the staging project.
- [ ] Create the `progress-photos` storage bucket and re-apply the storage policies.
- [ ] Wire up Supabase clients (server + browser) in `apps/web/src/lib/supabase/`.
- [ ] Add the env vars to the local dev workflow.
- [ ] Smoke-test: insert a test user via the Supabase auth dashboard, verify the seed trigger creates their 12 tasks.

**Definition of done for week 2:** the dashboard shows a test user with 12 seeded tasks and the storage bucket exists.

---

## Week 3 — tRPC API + Server Action migration

**Wait for:** week 2 done.

### 👤 You-only

- Nothing. Sit back and watch.

### 🤖 What I'll do

- [ ] Build the tRPC router infrastructure in `packages/api/`.
- [ ] Port every Server Action in `apps/web/src/app/actions.ts` to a tRPC procedure.
- [ ] Replace the `better-sqlite3` calls in `apps/web/src/lib/db.ts` with Supabase calls.
- [ ] Wire TanStack Query into the web client.
- [ ] Keep the existing UI working — same animations, same UX.

**Definition of done for week 3:** the web app has zero references to `better-sqlite3`, runs against staging Supabase, and looks/feels identical.

---

## Week 4 — Auth + multi-tenancy

**Wait for:** week 3 done.

### 👤 You-only

| # | Task | Notes |
| - | ---- | ----- |
| 12 | **Enable Google OAuth in Supabase.** Settings → Auth → Providers → Google. Requires a Google Cloud Console OAuth app. | Follow Supabase's setup doc. |
| 13 | **Enable Apple OAuth in Supabase.** Required by Apple if you offer Google sign-in on iOS. | Apple Developer enrollment must be complete by now. |

### 🤖 What I'll do

- [ ] Sign-up + sign-in + magic-link UI on the web.
- [ ] Account menu in the nav (sign out, settings, danger zone).
- [ ] Account-deletion flow.
- [ ] Data-export flow ("download my data" — emails a ZIP).
- [ ] Run the import script against your existing local data so your real entries land in your new Supabase account.

**Definition of done for week 4:** you sign in on the web with your email, see your real 26 task completions and your real notes and weight logs. You can sign out and back in.

---

## Week 5 — Storage migration (progress photos)

**Wait for:** week 4 done.

### 👤 You-only

- Nothing.

### 🤖 What I'll do

- [ ] `media.requestPhotoUpload` and `media.confirmPhoto` tRPC procedures.
- [ ] Update web photo card to upload via signed URL.
- [ ] Migrate any existing `public/progress-photos/*` to the bucket.
- [ ] Display via signed read URL with caching.

---

## Week 6 — Mobile app foundation

**Wait for:** week 5 done. Items 1 + 4 must also be done by now.

### 👤 You-only

| # | Task | Notes |
| - | ---- | ----- |
| 14 | **Create an Expo account** at <https://expo.dev>. | Free. |
| 15 | **Install Xcode on your Mac** (Mac App Store, ~10 GB). | Needed to run the iOS simulator locally. |
| 16 | **Install Android Studio** (only if you want to test Android locally; EAS Build covers production builds without it). | Optional. |
| 17 | **Reserve a bundle ID** in App Store Connect, e.g. `com.program.lifestyle`. | Once chosen, it's locked. |
| 18 | **Reserve a package name** in Play Console, same as above. | Same identifier on both stores by convention. |

### 🤖 What I'll do

- [ ] Scaffold `apps/mobile` with Expo SDK.
- [ ] NativeWind config sharing the existing Tailwind tokens.
- [ ] React Navigation tab bar (Today / Calendar / Stats / Settings).
- [ ] Auth screens.
- [ ] tRPC client + TanStack Query.
- [ ] You install on your phone via Expo Go and we test sign-in.

---

## Weeks 7-8 — Mobile screens

**Wait for:** week 6 done.

### 👤 You-only

- Use the mobile app daily. File bug reports as you go.

### 🤖 What I'll do

- [ ] Build TodayScreen, CalendarScreen, StatsScreen, SettingsScreen.
- [ ] Native bottom sheets for day-detail editing.
- [ ] Reanimated for the task-check spring + ripple.
- [ ] Expo ImagePicker for the photo task.
- [ ] Restart banner + completion screen.

---

## Week 9 — Production hardening

**Wait for:** week 8 done.

### 👤 You-only

| # | Task | Notes |
| - | ---- | ----- |
| 19 | **Create a Sentry project for `web` and one for `mobile`.** | One Sentry account, two projects. |
| 20 | **(Optional) PostHog account** at <https://posthog.com>. | Skip if you don't want analytics. |
| 21 | **Pick a "data deletion" email address** like `support@yourdomain.app`. | Required for the Privacy Policy + App Store. |

### 🤖 What I'll do

- [ ] Sentry integration on web + mobile.
- [ ] Security headers on web (CSP, HSTS).
- [ ] Rate limiting on write endpoints.
- [ ] Final account-deletion + data-export polish.
- [ ] Privacy Policy + Terms of Service published at `/privacy` and `/terms`.

---

## Week 10 — Closed beta

**Wait for:** week 9 done.

### 👤 You-only

| # | Task | Notes |
| - | ---- | ----- |
| 22 | **TestFlight build:** I'll trigger the build; you accept the App Store Connect agreement and add 5–10 testers by email. | |
| 23 | **Play Console internal track:** Same as above. | |
| 24 | **Recruit 5–10 testers.** Friends, your most trusted feedback givers. | The bar is "people who will actually report bugs." |

### 🤖 What I'll do

- [ ] First EAS Build for iOS + Android.
- [ ] Set up EAS Update channels (staging + production).
- [ ] Fix bug reports as they come in.

---

## Week 11 — Store submission

### 👤 You-only

| # | Task | Notes |
| - | ---- | ----- |
| 25 | **App Store Connect metadata.** Description, keywords, support URL, privacy policy URL, screenshots. | I'll prepare drafts; you upload. |
| 26 | **Play Console metadata + Data Safety form.** Same. | The Data Safety form is long; budget an hour. |
| 27 | **Submit for review.** | Apple ~24-48h, Google ~1-3d for new apps. |

### 🤖 What I'll do

- [ ] Generate screenshots from the simulator at every required device size.
- [ ] Final production builds.
- [ ] Web landing page or sign-in entry polish.
- [ ] Status page setup.

---

## Week 12 — Launch

### 👤 You-only

| # | Task | Notes |
| - | ---- | ----- |
| 28 | **Click "Release" on both stores.** | Phased release recommended (10% → 50% → 100% over 5 days). |
| 29 | **Point your custom domain at the Vercel production deployment.** | DNS A or CNAME record. |
| 30 | **Tell the world.** Where your audience lives. | |
| 31 | **Watch Sentry for 72 hours.** | Be ready to push a hotfix. |

### 🤖 What I'll do

- [ ] Be on standby for hotfixes.

---

## Decision points where I need your input

These are mini-decisions that I'll ask you about when we reach them:

| When | Decision |
| ---- | -------- |
| Week 4 | Brand name on the welcome screen + auth screens. Default `Program` if no answer. |
| Week 4 | Should new users go through an onboarding flow (program length picker + task customization) or accept defaults silently? Default: silent + welcome modal explains how to customize. |
| Week 6 | Mobile-only feature: do you want a "Camera (live)" option in addition to "Library" for the photo task? Default: library only for v1. |
| Week 9 | Analytics opt-in copy. I'll draft; you approve. |
| Week 9 | Privacy Policy contact email. |
| Week 11 | Final App Store description and keywords. I'll draft; you tweak. |

---

## Status dashboard (update as you go)

Mark these done so we can see progress at a glance.

### Accounts
- [ ] Apple Developer Program enrolled
- [ ] Google Play Console enrolled
- [ ] Supabase account
- [ ] Vercel account
- [ ] Expo account
- [ ] Sentry account
- [ ] PostHog account (optional)
- [ ] Domain purchased

### Decisions
- [ ] Final brand name picked
- [ ] Free vs paid decided (default: free)
- [ ] US-only vs worldwide decided (default: worldwide w/ GDPR)
- [ ] Domain name picked
- [ ] Bundle ID + Android package name picked

### Migration milestones
- [x] Monorepo set up
- [x] SQL migrations staged
- [ ] Supabase staging project created
- [ ] SQL migrations applied to staging
- [ ] Local data imported to staging
- [ ] tRPC API live
- [ ] Auth flows working
- [ ] Photos in Supabase Storage
- [ ] Mobile app scaffolded
- [ ] Mobile feature parity with web
- [ ] Sentry + monitoring live
- [ ] TestFlight + Play internal live
- [ ] App Store + Play submitted
- [ ] Public launch
