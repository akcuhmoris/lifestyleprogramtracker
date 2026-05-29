# CLAUDE.md

Orientation for an AI session landing in this repo. Read once at session start.

## What this project is

**Program** is a lifestyle program / habit tracker. Day-by-day check-offs against a configurable task list, with calendar heatmap, weight log, photos, stats, and restart logic. The product is positioned as "track 75 Hard / 100 Hard / your own routine, your way."

The repo holds **two production targets**: the web app (live) and a mobile app (not yet started). They share types and the API.

## Current state

- **`main` branch**: original local-only prototype using better-sqlite3 (preserved for reference).
- **`production` branch**: current work — Supabase-backed multi-user web app at parity with the original prototype, plus auth, account management, marketing surface, legal pages.
- Phase 4 (API rewrite to Supabase + tRPC) is complete and verified.
- Phase 5 (auth + multi-tenancy) is almost done — account menu, delete-account, data-export, OAuth UI, forgot-password all shipped.
- Mobile app (Phase 7) hasn't started. Blocked on the user's Expo + Apple Developer accounts.

See `plan/08-roadmap.md` for the live phase status.

## Stack

| Layer | Choice |
| --- | --- |
| Web | Next.js 14 App Router, TypeScript, Tailwind |
| Mobile (planned) | React Native via Expo |
| API | tRPC procedures over Next.js Route Handlers |
| Backend | Supabase (Postgres + Auth + Storage) |
| State | Server Components for reads; TanStack Query + tRPC for client mutations |
| Tests | Vitest in `packages/shared` |
| Hosting (planned) | Vercel for web, EAS for mobile |

## Monorepo layout

```
.
├── apps/
│   └── web/                          # Next.js 14 app (Server Actions, tRPC, Supabase)
│       ├── src/
│       │   ├── app/                  # Route handlers + pages
│       │   │   ├── api/trpc/[trpc]/  # tRPC HTTP endpoint
│       │   │   ├── account/actions.ts# Delete + export server actions
│       │   │   ├── auth/             # Sign in/up/out + callback
│       │   │   ├── login, signup, forgot-password, reset-password
│       │   │   ├── about, privacy, terms
│       │   │   ├── settings, stats, calendar
│       │   │   └── page.tsx          # Today view
│       │   ├── components/
│       │   ├── lib/
│       │   │   ├── supabase/         # server, client, middleware clients
│       │   │   ├── trpc/             # client provider + react hooks
│       │   │   ├── db.ts             # Supabase-backed DB helpers
│       │   │   └── logger.ts         # Structured logger (Sentry stub)
│       │   └── middleware.ts         # Session refresh + auth redirect
│       ├── supabase/
│       │   ├── migrations/           # SQL applied via `supabase db push`
│       │   ├── email-templates/      # Branded HTML for Supabase Auth
│       │   └── config.toml
│       ├── scripts/verify-supabase.mjs
│       └── .env.local                # Gitignored — Supabase keys live here
├── packages/
│   ├── shared/                       # Types + helpers used by both web and mobile
│   │   └── src/{date,tasks,icons}.ts
│   └── api/                          # tRPC routers (mobile will also import)
│       └── src/routers/
├── tools/
│   └── import-from-sqlite.mjs        # Migrate old local data to Supabase
├── plan/                             # Productionization blueprint
└── .github/workflows/ci.yml
```

## Where things live

| Concern | File |
| --- | --- |
| Schema migrations | `apps/web/supabase/migrations/*.sql` |
| RLS policies | `apps/web/supabase/migrations/20260528000001_rls_policies.sql` |
| Auto-seed trigger | `apps/web/supabase/migrations/20260528000002_seed_defaults_trigger.sql` |
| Task type | `packages/shared/src/tasks.ts` |
| Date math | `packages/shared/src/date.ts` |
| Icon registry | `packages/shared/src/icons.ts` |
| DB queries | `apps/web/src/lib/db.ts` (Server Actions) and `packages/api/src/routers/*.ts` (tRPC) |
| Server Actions | `apps/web/src/app/actions.ts`, `auth/actions.ts`, `account/actions.ts` |
| Supabase clients | `apps/web/src/lib/supabase/{server,client,middleware}.ts` |
| Auth UI | `apps/web/src/components/auth/*` |
| tRPC routers | `packages/api/src/routers/{tasks,entries,settings,challenges,media,stats}.ts` |
| tRPC root | `packages/api/src/router.ts` |
| Plan docs | `plan/` (00-overview, 08-roadmap, USER-TODO, etc.) |
| Tests | `packages/shared/src/*.test.ts` |

## Conventions

### Naming
- Task IDs are **UUIDs (strings)** since the Supabase migration. Old code using `number` is gone.
- Dates use ISO `YYYY-MM-DD` strings. Local timezone via `todayLocal()` in `packages/shared/src/date.ts`.
- Component files: kebab-case (`task-card.tsx`). Function components: PascalCase.

### Data flow
- Reads on server pages: call functions in `apps/web/src/lib/db.ts` — these use the cookie-authed Supabase client and RLS scopes everything to the current user.
- Writes from UI: Server Actions in `apps/web/src/app/actions.ts` (legacy / still used). tRPC routers in `packages/api/` are also live but the web app doesn't fully use them yet — mobile will.
- Mutations should be optimistic where the UX warrants it; revert on failure.

### Styling
- Tailwind with a custom palette in `apps/web/tailwind.config.ts` (look for `accent`, `bg`, `state`).
- Dark mode only by design. Don't introduce a light mode without confirming with the user.
- Components use `cn()` from `apps/web/src/lib/utils.ts` for class merging.

### Animations
- Framer Motion. Springs (`stiffness 280-380, damping 24-30`) for natural feel.
- Confetti via `canvas-confetti` for celebrations. See `apps/web/src/components/confetti.tsx`.
- Respect `prefers-reduced-motion`: it's wired in `globals.css`.

### Auth
- Middleware (`apps/web/src/middleware.ts` + `lib/supabase/middleware.ts`) refreshes the session on every request and redirects unauth users to `/login`.
- Public paths: `/login, /signup, /forgot-password, /reset-password, /auth/*, /about, /privacy, /terms`.
- API routes (`/api/*`) never redirect; they return proper 401s.
- Service-role key is server-only (`createServiceClient()` in `lib/supabase/server.ts`). Never expose to the client.

### Commits / pushes
- **DO NOT** `git commit` or `git push` unless the user explicitly asks. The user's instruction is to write code locally and let them decide when to commit.

## Live data + secrets

- `apps/web/.env.local` holds:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (a.k.a. anon key)
  - `SUPABASE_SERVICE_ROLE_KEY` (sensitive — server-only)
  - `NEXT_PUBLIC_APP_URL`
- The Supabase project is real and seeded. Verify with `node apps/web/scripts/verify-supabase.mjs`.

## Common tasks

| Want to | Do this |
| --- | --- |
| Add a new field to the schema | Write a new migration in `apps/web/supabase/migrations/`, then `supabase db push`. Also update `db.ts` and tRPC routers. |
| Add a new UI mutation | Add to `actions.ts` (Server Action) or a tRPC router. Wire up via TanStack Query if optimistic UX matters. |
| Add a new public page | Create the route, add the path to `HIDE_NAV_PATHS` in `nav.tsx` if no chrome wanted, add it to `isPublic` in `middleware.ts` if unauth should reach it. |
| Run the app locally | `npm run dev` from the repo root → <http://localhost:3000> |
| Type-check + lint + build | `npm run build` |
| Tests | `npm test` |
| Smoke-test Supabase end-to-end | `node apps/web/scripts/verify-supabase.mjs` |
| Migrate old local SQLite to Supabase | `node tools/import-from-sqlite.mjs --email me@example.com` |

## What's NOT done

- Mobile app (`apps/mobile/`) — not scaffolded. Blocked on user's Expo + Apple Dev accounts.
- Vercel deployment — needs user to connect GitHub.
- Sentry capture — DSN required; logger stub is ready to swap.
- Apple + Google OAuth provider config in Supabase dashboard — UI is ready.
- Production-ready legal — `/privacy` and `/terms` are real drafts; need lawyer review before public launch.

## Working norms

- Keep edits surgical. The web app works end-to-end against staging Supabase. Don't refactor things that aren't broken.
- When the user asks for "everything you can do without me," lean toward UX polish, tests, docs, and templates — not architectural rewrites.
- The user is solo and not deeply technical on every piece. Explain in plain language; lead with what they need to do, not what changed under the hood.
- The plan docs in `plan/` are the canonical source of truth for what's been done and what's next. Update `plan/08-roadmap.md` and `plan/USER-TODO.md` whenever you ship work that moves the needle.
