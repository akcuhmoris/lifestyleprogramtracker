# 07 — Production readiness

The "boring" stuff that turns an app into a product real people can rely on. None of this is optional for v1.

## Observability

### Error tracking — Sentry

- One Sentry project for `web`, one for `mobile`. Same account.
- Capture unhandled errors + 500-class API responses on both.
- Source maps uploaded on every web build (Sentry's Next.js webpack plugin does this automatically).
- For React Native, the Expo Sentry plugin handles symbolication.
- Configure alerts:
  - **P0:** any unhandled error in production with > 5 events in 5 min → email + push to your phone.
  - **P1:** a new error type appearing more than 50 times in a day → email digest.
- Set sample rates carefully: 100% for errors, 10% for performance traces (a free-tier issue more than a value issue).

### Logging

- Web API logs go to Vercel's runtime logs (kept ~24h) plus Sentry breadcrumbs.
- Postgres slow-query logs from Supabase dashboard.
- Don't log PII (email, weight) — log user IDs only.
- Add a request-id middleware that returns an `X-Request-ID` header so users can quote a specific request when they report bugs.

### Analytics — PostHog (optional, opt-in)

- Useful for funnel insight: "What % of users who sign up complete Day 1?"
- Privacy-first: self-host if you want; cookieless on web.
- Events to capture:
  - `signed_up`, `signed_in`, `signed_out`
  - `day_completed`, `task_completed`, `photo_uploaded`
  - `program_completed`, `restart_triggered`
  - `settings_changed`
- Don't capture: weight values, journal/notes content, photo bytes, task titles (could leak PII).
- Add an opt-out toggle in Settings before launch.

## Performance

### Targets

- **Web Time to Interactive** < 2 seconds on a fast 3G connection (Lighthouse Mobile).
- **API p95 latency** < 400 ms for read endpoints, < 600 ms for writes (excluding cold starts).
- **App cold launch** < 1.5 seconds on a recent device.

### Practices

- Use Server Components for the initial render.
- React Native: prefetch the next screen's queries on tab focus.
- Image optimization: photos stored as `image/webp` server-side when possible. Use `next/image` for the web preview; Expo Image for mobile.
- Bundle size: keep Lucide imports tree-shakable (already done).
- Postgres: every query that filters by `user_id` already has an index because of the FK; verify with `EXPLAIN` once production data lands.

## Security

### Auth

- Enforce password rules: 8+ chars min, no common-password check via [zxcvbn](https://github.com/dropbox/zxcvbn) (rate the entered password live, block obvious ones).
- Magic link expires after 1 hour. Single-use.
- 2FA via TOTP is a v1.1 nice-to-have, not blocker.
- Sign-out clears the token on both server and client.

### Authorization

- **Every** API procedure uses `protectedProcedure` unless explicitly public.
- **Every** Postgres query scopes by `user_id`.
- **RLS policies** in Postgres are the second line of defense — they would catch a bug in the API layer.
- Service role key is server-only; never bundled into the web client or mobile app.

### Transport

- HTTPS everywhere. Vercel handles certs.
- HSTS header set with a 1-year max-age once you're confident.
- Supabase requires TLS — no plaintext connection paths exist.

### Input validation

- Zod on every API input.
- Reject future-dated checks and weight outside `(0, 2000]` (the current Server Actions already do).
- Maximum upload size 12 MB enforced at the storage signed URL level + client-side before upload.

### Secrets

- Service role key, Sentry DSNs (DSNs are technically public; auth tokens aren't), Stripe keys (when applicable) — all stored in Vercel environment variables, scoped per environment.
- Rotate service role key quarterly + after team departures.
- No secrets in screenshots, in `git log`, in support tickets.

### CSP + headers

In `apps/web/next.config.mjs`, set:

```ts
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // CSP gets added after you've verified what third-party origins you genuinely need.
];
```

## Privacy & compliance

### Privacy policy

You need one. Generate a draft via [Iubenda](https://www.iubenda.com/) or [Termly](https://termly.io/) (~$10-30/mo) or hand-write one — both work. It must say:

- What you collect (email, IP, device info, all the app data).
- Who you share it with (Supabase, Vercel, Sentry, PostHog, Expo Push servers).
- How long you keep it (until account deletion + 30-day grace).
- How users delete their data (in-app + email).
- Cookies (only essential ones for the web — auth cookie).
- Children's policy (state that the app is not for users under 13).
- Contact email for privacy questions.

Host it at `program.app/privacy` and link it from the in-app footer + the App Store / Play Store listings.

### Terms of Service

Required for sign-up. Standard SaaS terms cover:

- Acceptable use
- Intellectual property (you own the code, they own their data)
- Disclaimer of warranties (this is not medical/fitness advice)
- Limitation of liability
- Governing law (pick a US state and stick with it)

### Account deletion

App Store rule + Play rule + GDPR rule. Build this:

1. Settings → "Danger zone" → "Delete account" → confirm with password.
2. Server marks the user as `pending_deletion` and emails a "we'll delete in 30 days" confirmation with a "Cancel deletion" link.
3. A scheduled job runs daily and hard-deletes accounts past their 30-day mark:
   - `delete from auth.users where id = $1` (cascades via FK to all our tables)
   - `delete` matching storage objects under `progress-photos/{userId}/`
   - Final confirmation email sent ("your account and all data have been deleted").

### Data export

GDPR Article 20 + general good-citizen behavior. A "Download my data" button in Settings that:

- Bundles a JSON file with every row from every table where `user_id = me`.
- Bundles all progress photos.
- Emails a link to a signed-URL ZIP that expires in 24 hours.

For v1, this can be a manual process (you receive an email, you generate the ZIP). Build the in-app version in v1.1.

### Cookies

Only essential cookies (auth session). No analytics cookies. This way the cookie banner is optional in most jurisdictions; we'll still link a privacy policy.

## Reliability

### Backups & restore

- Supabase nightly backups (built-in).
- Optional: nightly `pg_dump` via a scheduled GitHub Action, uploaded to S3 / R2 with a 90-day retention.
- **Restore drill before launch.** Restore the latest backup to a scratch project, verify a row, write a one-page runbook. Run again quarterly.

### Status

- A simple status page (Hyperping, BetterUptime, or even GitHub Pages with a manual update) at `status.program.app`.
- Configure synthetic checks: hit `/api/health` from 3 regions every 5 minutes; page you when 2/3 fail.

### Incident runbook

Write a one-page document. Sections:

1. **Where everything lives.** Vercel project, Supabase project, EAS, Sentry, status page.
2. **Common failures.** Vercel build failed (rollback how), Supabase down (status page + standby), App rejected (how to resubmit).
3. **Who to call.** Even if it's just you, write your own phone number — saves future-you 10 minutes of panic.
4. **Comms templates.** "We're investigating", "We've identified the issue", "We've deployed a fix".

## Customer support

For v1, an email address is enough. `support@program.app` forwards to your inbox. A canned response saying "thanks, looking into it" goes out in <24h. Real reply in <72h.

Don't build an in-app chat for v1.

## If you ever charge for it

(Out of scope for v1 — adding here so the rest of the plan stays focused.)

- **Web:** Stripe Checkout + Stripe Customer Portal.
- **Mobile:** RevenueCat (handles App Store + Play Store IAP with one SDK).
- Pricing model worth testing: monthly + annual, with a 7-day free trial.
- Build a `subscription` table linked to user. Block paid features behind a `hasSubscription` check.
- Apple takes 30% (15% after year 1). Stripe takes 2.9% + 30¢. Plan margins accordingly.

## Checklist for this doc

- [ ] Sentry projects created and tested with a thrown error.
- [ ] Privacy policy + Terms of Service drafted, even if not perfect.
- [ ] Account-deletion flow specced (and now on the roadmap before launch).
- [ ] Backup restore drill scheduled before public launch.
- [ ] You can answer "where do I look when something breaks at 2 AM?" without thinking.
