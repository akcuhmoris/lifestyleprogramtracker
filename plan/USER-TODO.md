# 👤 What only you can do

> [!NOTE]
> This file is the **single source of truth for human-only work**. Items unlock the AI side of the work — when you finish something, I can proceed.

For the full picture of where we are and what's next, see [`08-roadmap.md`](./08-roadmap.md).

## Status

| Phase | Your work | AI work | Status |
| ----- | --------- | ------- | ------ |
| 🏗️ Phase 1 — Foundation | none | scaffolding, hardening, tests, drafts | ✅ done |
| 🔑 Phase 2 — Accounts & decisions | **this is you, right now** | drafts already in | 🟡 Apple enrollment in flight |
| 🗄️ Phase 3 — Backend wiring | (done — Supabase keys sent) | migrations applied | ✅ done |
| 🔌 Phase 4 — API rewrite | nothing | tRPC ported, Supabase live | ✅ done |
| 🔐 Phase 5 — Auth | enable OAuth providers when ready | UI + import script + account section | ✅ done (OAuth provider config pending) |
| 🖼️ Phase 6 — Media & storage | nothing | bucket + signed URLs | ✅ mostly shipped in Phase 4 |
| 📱 Phase 7 — Mobile app | install Xcode, reserve bundle IDs, **finish Apple enrollment** | build the app | ⬜ blocked on you |
| 🛡️ Phase 8 — Production hardening | create Sentry projects, deploy to Vercel | wire it all in | 🟡 foundations done |
| 🚀 Phase 9 — Beta & launch | recruit testers, click "Release" | upload builds, fix bugs | ⬜ blocked on Phase 7 |

---

## 🔑 Phase 2 — what to do now

All of these are independent and can run in parallel. The slow ones (Apple, Google) gate later phases — start them first.

### Accounts to create

- [ ] **Apple Developer Program** — <https://developer.apple.com/programs/enroll/> · $99/yr · **24–72 h to activate, start first**
- [ ] **Google Play Console** — <https://play.google.com/console> · $25 one-time · ~48 h to activate
- [ ] **Supabase** — <https://supabase.com> · free · then create a project named `program-staging`, pick a region near you, save the DB password in a password manager
- [ ] **Vercel** — <https://vercel.com> · free · link your GitHub account
- [ ] **Sentry** — <https://sentry.io> · free
- [ ] **Expo** — <https://expo.dev> · free (you'll need it before Phase 7)
- [ ] **Domain registrar** — Cloudflare Registrar or Porkbun · ~$12/yr · lock in your brand

### Decisions to make

- [ ] **Brand name** — current default `Program`
- [ ] **Free or paid for v1** — current default Free
- [ ] **US-only or worldwide** — current default Worldwide w/ GDPR-aware policies
- [ ] **Domain name** — feeds into the App Store + Play listings
- [ ] **iOS bundle ID + Android package name** — e.g. `com.yourname.program` (lock once, never change)

> [!IMPORTANT]
> The single most important hand-off: when your **Supabase staging project** exists, send me **Project URL**, **anon public key**, and **service role key** (the last one is sensitive — share over a channel you trust). That single message unlocks Phases 3 → 6 and I can run with it for a long stretch.

---

## 🔐 Phase 5 — what to do when we get there

These configurations live inside Supabase's dashboard. They need real OAuth app credentials from Google + Apple.

- [ ] Enable Google OAuth in Supabase (Settings → Auth → Providers → Google). Requires a Google Cloud Console OAuth app.
- [ ] Enable Apple OAuth in Supabase. Requires Apple Developer enrollment to be complete.
- [ ] Confirm magic-link email template branding looks right.

---

## 📱 Phase 7 — what to do when we get there

- [ ] **Install Xcode** from the Mac App Store (~10 GB) — needed for the iOS simulator
- [ ] **Install Android Studio** (only if you want to test on the Android emulator locally; EAS Build can produce production builds without it)
- [ ] **Reserve a bundle ID** in App Store Connect, e.g. `com.yourname.program`
- [ ] **Reserve a package name** in Play Console (same identifier by convention)
- [ ] **Add at least one test device** to your Apple Developer profile for TestFlight

---

## 🛡️ Phase 8 — what to do when we get there

- [ ] Create a **Sentry project for `web`** and one for `mobile`
- [ ] (Optional) Create a **PostHog** account if you want analytics
- [ ] Pick a **support / privacy contact email** (e.g. `support@yourdomain.app`)
- [ ] Review the **Privacy Policy + Terms** drafts in `plan/legal/`, fill in the `[BRACKETED]` placeholders, ideally have a lawyer review

---

## 🚀 Phase 9 — what to do when we get there

### Beta

- [ ] **Accept the App Store Connect agreement** (if not already) — required before TestFlight works
- [ ] **Invite 5–10 testers** to TestFlight by email
- [ ] **Invite the same crew** to Play Console internal track
- [ ] **Use the app daily** and file bug reports — be your own toughest tester

### Store submission

- [ ] **App Store Connect metadata** — paste from `plan/store-listings/app-store.md`, fill in `[BRACKETS]`
- [ ] **Play Console metadata** — paste from `plan/store-listings/play-store.md`
- [ ] **Data Safety form** in Play — answers in the draft, but you press the buttons
- [ ] **Upload screenshots** per `plan/store-listings/screenshots.md`
- [ ] **Submit for review**

### Launch

- [ ] **Click "Release"** on both stores when approved
- [ ] **DNS record** for your custom domain pointed at Vercel
- [ ] **Tell the world** wherever your audience lives

---

## Status dashboard

Mark as you go — gives both of us a single-glance picture of where we are.

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

### Done so far
- [x] Monorepo set up
- [x] SQL migrations staged
- [x] CI configured (7-job pipeline: lint, typecheck × 3 workspaces, tests, migrations, audit, build)
- [x] Production build green + 41 tests passing
- [x] Security headers + health endpoint
- [x] Friendly 404 + 500 + structured logger stub
- [x] Privacy Policy + ToS drafts (real pages at `/privacy` and `/terms`)
- [x] App Store + Play Store listing drafts
- [x] Pushed to `origin/production`
- [x] **Supabase staging applied** — schema, RLS, seed trigger, storage bucket all live
- [x] **Local data imported to Supabase** via `tools/import-from-sqlite.mjs`
- [x] **tRPC API live** — routers in `packages/api/`
- [x] **Auth flows working** — email/password sign-up, magic link, forgot/reset password
- [x] **Account section** — change email, change password, delete account, download data
- [x] **Photos in Supabase Storage** via signed URLs
- [x] **Program templates + signup onboarding picker** — pick a starter preset from `/onboarding` or `/settings`
- [x] **FAQ + changelog pages** at `/help` and `/changelog`

### Still to come
- [ ] Supabase OAuth providers (Google + Apple) configured in dashboard — you-task
- [ ] Vercel project linked to GitHub — you-task
- [ ] Custom domain — you-task
- [ ] Mobile app scaffolded — blocked on your Expo account
- [ ] Mobile feature parity with web
- [ ] Sentry projects created + DSN swapped in — you-task
- [ ] Rate limiting on write endpoints
- [ ] Restore drill performed against staging
- [ ] TestFlight + Play internal live
- [ ] App Store + Play submitted
- [ ] Public launch 🎉
