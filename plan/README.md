# Plan — Program (Web + Mobile, Production)

This folder is the blueprint for taking the current local-only Next.js prototype and shipping it as a real product that real users can sign up for on the web and download on iOS / Android, with their data synced across devices.

These docs are written to be read in order. Each one is short enough to read in a sitting and ends with a concrete checklist or set of decisions you'll need to make.

## Reading order

| # | Doc | What it answers |
| - | --- | --------------- |
| 00 | [Overview](./00-overview.md) | Where we are, where we're going, the guiding principles. |
| 01 | [Architecture](./01-architecture.md) | The target system diagram — clients, API, data, storage. |
| 02 | [Backend](./02-backend.md) | DB migration, API design, auth, multi-tenancy. |
| 03 | [Mobile app](./03-mobile.md) | React Native via Expo, code sharing with web. |
| 04 | [Sync strategy](./04-sync-strategy.md) | Online-first with cache vs offline-first. The trade-offs. |
| 05 | [Deployment](./05-deployment.md) | Hosting, environments, CI/CD, secrets. |
| 06 | [Distribution](./06-distribution.md) | App Store / Play Store submission and the web release process. |
| 07 | [Production readiness](./07-production-readiness.md) | Monitoring, errors, backups, security, privacy, ToS. |
| 08 | [Roadmap](./08-roadmap.md) | Untimed phase-by-phase plan with live status badges. |
| 🚨 | [USER-TODO](./USER-TODO.md) | What only you can do, in dependency order. |

## Snapshot of the recommended stack

| Layer        | Choice                                       | Why                                                                  |
| ------------ | -------------------------------------------- | -------------------------------------------------------------------- |
| Web          | Next.js 14 (existing, lightly adapted)       | Already built; App Router fits server-side auth + RSC well.          |
| Mobile       | React Native via Expo (managed workflow)     | Reuse React mental model; EAS handles native builds + OTA updates.  |
| Backend API  | tRPC (over Next.js Route Handlers)           | One typed contract, consumed by both web and mobile.                 |
| Database     | Postgres on Supabase                         | Hosted Postgres with row-level security, backups, point-in-time.     |
| Auth         | Supabase Auth                                | Email + OAuth + magic links; integrates with Postgres RLS for free.  |
| File storage | Supabase Storage                             | Signed URLs, RLS, S3 underneath, free tier suitable for v1.          |
| Cache/RPC    | TanStack Query                               | Works identically in web + React Native; handles invalidation.       |
| Push         | Expo Notifications                           | Cross-platform with a single token API.                              |
| Error logs   | Sentry (web + RN)                            | Same dashboard for both apps.                                        |
| Analytics    | PostHog (self-host capable)                  | Privacy-respecting, supports session replay if you want it later.    |
| CI/CD        | GitHub Actions + Vercel + EAS Build          | Native fit for Next.js + Expo, no third-party glue.                  |

You can swap any of these — these are the defaults the rest of the plan assumes.

## What this plan does NOT do

- **It doesn't change the current local-first prototype yet.** Today the app works exactly as before — the plan exists to be executed deliberately, not all at once.
- **It doesn't lock you into any vendor.** Supabase is recommended because it's the fastest path to a working product, but every choice has an escape hatch documented in the relevant doc.
- **It doesn't gate on monetization.** v1 ships free. A short "if you want to charge later" note lives at the bottom of [07 — Production readiness](./07-production-readiness.md).

## Decision log

A running list of decisions made while drafting this plan, with reasoning so future-you (or a collaborator) can challenge them.

| Date | Decision | Reasoning |
| ---- | -------- | --------- |
| 2026-05-28 | Use Supabase for DB + auth + storage instead of building each piece separately | One vendor, three needs solved, generous free tier, can migrate off later. |
| 2026-05-28 | Use tRPC instead of REST | The web app already uses Server Actions; tRPC is the closest fit and gives mobile end-to-end type safety. |
| 2026-05-28 | Monorepo via pnpm workspaces (not Nx, not Turborepo yet) | Lightest weight that solves package sharing; we can add Turborepo later if build times demand it. |
| 2026-05-28 | Online-first with TanStack Query cache (not full offline sync) for v1 | Real offline sync is months of work; cache-on-stale-while-revalidate covers 95% of perceived value. See [04](./04-sync-strategy.md). |
| 2026-05-28 | Mobile via Expo managed workflow (not bare RN) | EAS Build + EAS Update remove almost all native build pain for v1. Eject later if needed. |
