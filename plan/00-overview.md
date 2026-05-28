# 00 — Overview

## Where we are today

A polished local-first habit tracker built as a Next.js 14 app on top of better-sqlite3. It runs only on the developer's laptop and serves a single user. There is no auth, no remote storage, no mobile client. The SQLite file and uploaded photos live in the project directory and are gitignored.

What works today:

- Today view with configurable task list, animations, progress bars, journal/photo specials, weight + notes.
- Calendar heatmap with editable day-detail modal.
- Stats with weight trend and per-task bars.
- Settings page to edit tasks, length, and icons.
- Restart prompt + day-100 completion screen.
- Welcome / help modal for new users.

What's missing for "real users on web + phone":

- **Multi-tenancy** — every user must see only their own data.
- **Auth** — sign up, log in, recover account.
- **Remote database** — SQLite-on-laptop doesn't sync between devices.
- **API surface** — Server Actions can't be called from a React Native app as-is.
- **Mobile client** — there isn't one.
- **File storage** — `public/progress-photos/` doesn't survive a redeploy or work on mobile.
- **Hosting** — there is no production environment.
- **Observability** — no error tracking, logs, metrics.
- **Policies** — no Terms of Service, Privacy Policy, account deletion flow.

## Where we're going

A two-client product on a shared backend:

1. **Web** at e.g. `program.app` (or whatever domain), accessible from any browser.
2. **Mobile** on iOS App Store and Google Play, branded as **Program**.
3. **Backend** with auth, a Postgres database, object storage for photos, and a typed RPC API consumed by both clients.

A user can:

- Sign up on the web, log into the mobile app, and see the same data.
- Take a progress photo on their phone and review it on a laptop later.
- Check off tasks on either device — changes appear on the other (with minor sync latency for v1).
- Delete their account and have every byte of their data wiped within 30 days.

## Guiding principles

These are the calls we'll make in every doc that follows.

1. **Boring tech where possible.** Postgres, REST/RPC, server-rendered HTML, React Native via Expo. No bleeding-edge frameworks just because.
2. **One typed contract.** The same API is consumed by web and mobile. tRPC gives us that without a code-gen step.
3. **Sync is online-first for v1.** Offline-first is a months-long project and adds conflict-resolution complexity. We get 95% of the value with a smart cache. See [04](./04-sync-strategy.md).
4. **Privacy by default.** Row-level security in Postgres, signed URLs for images, no third-party trackers in the bundle. Analytics are opt-in once we add them.
5. **Free for v1.** Don't tangle launch with payments. Pick a generous-free-tier stack; revisit monetization after PMF signals.
6. **Ship to a tiny audience first.** TestFlight + Play Store internal track for the first 4 weeks. Don't open submit-to-store for review until the product survives 50 real-user days.

## Big decisions still open

These ride on what you want, not on best practices. Each is called out where it matters in the rest of the plan.

- **Domain name.** Will affect branding, App Store identity, and the cost of a privacy policy template.
- **Brand name.** Currently "Program." That's neutral; "Lifestyle," "Routine," and "Track" are all available.
- **Free vs paid.** v1 ships free. If you decide it's a paid product later, we'll add Stripe or RevenueCat (mobile).
- **Geography.** US-only or worldwide? Affects whether we need GDPR rigor upfront (we should anyway, but it changes some defaults).
- **Account deletion mechanics.** Hard delete vs soft delete with a 30-day grace window. We'll default to grace-window with one-click reactivate.

## Success criteria for v1 (the "done" line)

This is what we're aiming at. We stop calling things "v1" and start calling them "ongoing" when:

- [ ] A new user can sign up on the web, install the iOS or Android app, and see their data on both within 5 seconds of a change.
- [ ] Account deletion completes within 30 days with proof (a deletion confirmation email).
- [ ] 99% of API requests complete in under 400 ms (excluding cold starts).
- [ ] Sentry shows fewer than 1 unhandled error per 1,000 sessions for 14 consecutive days.
- [ ] At least 50 real users have used the app for 10+ days without a P0 bug report.
- [ ] App Store + Play Store listings are live (not just TestFlight / internal).
- [ ] Terms of Service, Privacy Policy, and "How we use your data" docs are published and linked from in-app.
- [ ] A nightly DB backup runs and a restore drill has been performed at least once.

## What you do next

1. Read [01 — Architecture](./01-architecture.md) so you can picture the system.
2. Read [02 — Backend](./02-backend.md) and decide on Supabase (recommended) vs alternatives.
3. Skim [08 — Roadmap](./08-roadmap.md) and tell yourself a story about which 12 weeks you can commit.
4. Sign up for the accounts on the [05 — Deployment](./05-deployment.md) "accounts needed" list.
