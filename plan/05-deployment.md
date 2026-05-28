# 05 — Deployment

Hosting, environments, CI/CD, and the accounts you need to sign up for.

## Environments

Three, no more:

| Name        | Purpose                                | Where                       |
| ----------- | -------------------------------------- | --------------------------- |
| `local`     | Your laptop. Per-developer.            | Local Postgres via Supabase CLI / Docker, or a personal hosted Supabase project. |
| `staging`   | Pre-merge previews, manual QA, beta.   | Vercel preview deployments + a dedicated Supabase staging project. |
| `production`| Real users.                            | Vercel production + Supabase production project + iOS/Android app store builds. |

Vercel auto-creates preview deployments per PR. Each preview talks to staging Supabase.

## Accounts you need to sign up for

Before any deploy work happens:

- [ ] **Vercel** (free Hobby tier is fine to start; Pro at $20/mo when you go to production with custom domains and team).
- [ ] **Supabase** (free tier suitable for v1; ~$25/mo when you outgrow it).
- [ ] **GitHub** (already have it for the repo).
- [ ] **Domain registrar.** Cloudflare or Porkbun work. Buy `program.app` or whatever you want.
- [ ] **Apple Developer Program** — $99/year. Needed before you can build for iOS.
- [ ] **Google Play Console** — $25 one-time. Needed before you can publish to Play.
- [ ] **Expo account** + **EAS** subscription (free for hobby builds; Production plan ~$29/mo when you need more priority queue).
- [ ] **Sentry** account (free for small projects).
- [ ] **PostHog** account (free under a generous event volume).
- [ ] **Stripe / RevenueCat** — only if/when you monetize. Skip for v1.

## Web — Vercel

Steps:

1. Connect the GitHub repo to Vercel.
2. Set `Root Directory` to `apps/web/` (after the monorepo migration).
3. Set `Build Command` to `pnpm install && pnpm --filter web build` (or use Turborepo's `pnpm turbo build --filter=web`).
4. Add environment variables (see below).
5. Add a custom domain once DNS is ready.

### Environment variables (web)

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...               # server-only, never exposed to client
SENTRY_DSN=...
POSTHOG_KEY=...                             # if/when we add analytics
NEXT_PUBLIC_APP_URL=https://program.app
```

Put production secrets in Vercel's project settings (Production scope). Mark `SUPABASE_SERVICE_ROLE_KEY` as Production-only — preview deploys must not see it.

## Database — Supabase

### Setup steps

1. Create a Supabase project for `staging`.
2. Initialize the Supabase CLI in the repo: `supabase init`.
3. Generate migrations from your local schema: `supabase db diff -f initial_schema`.
4. Push to staging: `supabase db push --linked`.
5. Create another Supabase project for `production`. Keep its keys in a password manager.
6. Apply the same migrations to production.

### Backups

- Supabase makes daily automatic backups. Verify retention on your plan.
- Pro tier offers point-in-time recovery (PITR) up to 7 days back. Worth turning on before launch.
- Optional belt-and-suspenders: nightly `pg_dump` via a scheduled GitHub Action that uploads to S3 / R2 / Backblaze.
- **Do a restore drill before launch.** Restore the latest backup to a scratch project, verify a row, write a one-page runbook. Repeat quarterly.

## Mobile — EAS Build + EAS Update

Expo's Application Services builds your native binaries in the cloud and ships JS-only updates over the air.

### Builds (EAS Build)

- `eas build --platform ios --profile production` produces an `.ipa` for App Store submission.
- `eas build --platform android --profile production` produces an `.aab` for Play submission.
- `eas build --profile preview` produces internal builds for TestFlight / Play internal track.

`eas.json` carries the build profiles + env-var groups (so prod build hits prod Supabase, etc.).

### Over-the-air updates (EAS Update)

- Any pure-JS change ships as an OTA update without resubmitting to the store.
- Native module additions still require a new store submission.
- Configure release channels per branch (`production`, `staging`) so beta testers get the staging code automatically.

## CI/CD — GitHub Actions

Three workflows for v1:

### `.github/workflows/web-ci.yml`

On every push: install, typecheck, lint, run unit tests. PRs to `main` must be green to merge.

### `.github/workflows/web-deploy.yml`

On push to `main`: Vercel auto-deploys (no GH Action needed beyond the Vercel integration).

### `.github/workflows/mobile-ci.yml`

On every push: install, typecheck mobile, lint, run unit tests. Optionally trigger an EAS preview build on PRs to `main`.

### `.github/workflows/mobile-release.yml` (manual trigger)

`workflow_dispatch` that fires `eas build --profile production` and (optionally) `eas submit` to upload to the stores.

## Custom domain wiring

When you've bought a domain:

1. Add it to Vercel under the project's Domains tab.
2. Update DNS (`A` to Vercel's IP or `CNAME` to `cname.vercel-dns.com`).
3. Confirm HTTPS certificate auto-provisions (Vercel does this).
4. In Supabase, set the site URL + auth redirect URLs to `https://YOUR_DOMAIN.app/**`.
5. Add the domain to the `expo` deep-link associated domains in `app.json`.

## Secret hygiene

- Service role keys never appear in the mobile app, ever.
- API responses never include other users' data — RLS is the last line of defense, but design the queries to avoid hoping RLS catches a bug.
- `.env*` is gitignored. Use a password manager or 1Password's CLI to share secrets between humans.
- Rotate the service role key once a quarter and after any team-member departure.

## Cost estimates (rough, USD / month, for v1 with <500 users)

| Service                   | Cost                          |
| ------------------------- | ----------------------------- |
| Vercel Hobby              | $0                            |
| Supabase Free             | $0 (upgrade to Pro $25 ~500 MAU) |
| Domain                    | ~$12 / yr                     |
| Apple Developer           | $99 / yr                      |
| Google Play Console       | $25 one-time                  |
| EAS free                  | $0 (Production $29 when you want priority builds) |
| Sentry free               | $0 (5K errors/mo)             |
| PostHog free              | $0 (1M events/mo)             |

**Realistic v1 monthly cash burn: $0–$30 plus the one-time and annual fees.**

## Checklist for this doc

- [ ] Created Vercel + Supabase + Expo + Sentry accounts.
- [ ] Bought a domain (or know which one you'll buy).
- [ ] Apple Developer Program enrolled (this takes 24–72 hours, do it early).
- [ ] Google Play Console enrolled.
- [ ] Repo's CI green on a hello-world push.
