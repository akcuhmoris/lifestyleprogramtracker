# Changelog

The user-facing release notes. Keep entries terse and concrete — what changed for someone who uses the app.

## v0.5 — 2026-05-30 — Auth polish

- "Forgot password?" flow added (request reset email → set new password → forced sign-in).
- New **Account** section in Settings: change your email and change your password without leaving the app.
- Login screen shows a flash banner after account deletion or a successful password reset.
- Branded HTML email templates for Supabase auth (confirm-signup, magic link, password reset, change email).
- `/help` FAQ page covering the most common questions.
- `/changelog` page (this one).
- SEO basics: `robots.txt`, `sitemap.xml`, dynamic OpenGraph image, Twitter card metadata.
- `CLAUDE.md` orientation doc at the repo root for future development sessions.
- 10 new tRPC router tests + a mock Supabase client for testing.

## v0.4 — 2026-05-29 — Real auth & multi-tenancy

- Migrated the entire web app off local SQLite to Supabase (Postgres + Auth + Storage).
- Sign up / sign in (email + password, magic link, Google + Apple OAuth UI).
- Account menu in the nav with your email + quick links.
- **Download my data** (JSON export with signed photo URLs).
- **Delete my account** (cascade-deletes every row + every Storage object).
- `/about` marketing landing page for unauthenticated visitors.
- `/privacy` and `/terms` full drafts (App Store ready, lawyer review still recommended).
- tRPC routers in `packages/api` for the future mobile app.
- TanStack Query wired into the layout.
- `tools/import-from-sqlite.mjs` to bring data from a local SQLite file into your Supabase account.

## v0.3 — 2026-05-28 — Backend infrastructure

- Monorepo restructure (`apps/web`, `packages/shared`, `packages/api`).
- Supabase SQL migrations + RLS policies + sign-up seed trigger applied to staging.
- Vitest test infrastructure; 25 unit tests for date math and task helpers.
- Security headers, `/api/health` endpoint, structured logger stub.
- CI workflow on every PR (lint + test + build).
- App Store + Play Store listing drafts in `plan/store-listings/`.

## v0.2 — 2026-05-27 — Lifestyle program rebrand

- Rebranded from "100 Hard tracker" to **Program** — a generic lifestyle program tracker.
- Settings page lets you customize the length (1–365 days) and the daily task list (any number, any icons, any kinds).
- Workout cards require text. Reading card supports book/chapter logging.
- Progress photos upload and store locally.
- Welcome modal walks new users through every screen.

## v0.1 — 2026-05-26 — Local prototype

- First playable build: today view, calendar heatmap, day-detail modal, stats page, journal modal, restart prompt, day-100 completion celebration.
- Local SQLite via better-sqlite3.
- Dark mode, electric-blue accents, framer-motion animations, canvas-confetti celebrations.
