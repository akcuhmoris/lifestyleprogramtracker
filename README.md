# Lifestyle Program Tracker

[![CI](https://github.com/akcuhmoris/lifestyleprogramtracker/actions/workflows/ci.yml/badge.svg?branch=production)](https://github.com/akcuhmoris/lifestyleprogramtracker/actions/workflows/ci.yml)

A habit tracker for any lifestyle program — 75 Hard, 100 Hard, a 30-day reset, a custom routine you invented yourself, whatever you want to commit to.

You configure the **length** (1–365 days) and the **daily requirements** (any number of tasks, each with its own icon, optional text-entry requirement, and special "Journal" / "Photo" behaviors). The app tracks completion per day, your weight over time, free-text notes, journal entries, workout / reading detail, and progress photos.

> **Status:** Web app feature-complete and live against Supabase. Cinematic landing page at `/`, email + magic-link auth, account management (change email/password, delete account, download data), 6 program templates with a signup picker, calendar/heatmap with editable past-day detail, stats page with weight trend, restart-prompt flow, and a completion celebration. **Hero Mode** layers an RPG-style character (6 archetypes, 5 tiers, XP + leveling) on top of every check-in, and the whole app supports **7 themes** (Midnight is the default). Mobile app is next (Apple side ready; blocked on Expo account).
>
> For where this is going next, see [`plan/`](./plan/README.md) — especially [`plan/08-roadmap.md`](./plan/08-roadmap.md) (live phase status) and [`plan/USER-TODO.md`](./plan/USER-TODO.md) (what only the human-side can do).

---

## App flow

```
┌───────────────────────────────────────────────────────────────────┐
│  LANDING  /                                                       │
│  • Cinematic marketing page — aurora, archetype reel, themes,     │
│    live demo, scroll-driven story                                 │
│  • CTAs into /signup or /login                                    │
└───────────────────────────────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────────────────────────┐
│  SIGN UP  /signup                                                 │
│  • Email confirmation link                                        │
│  • Supabase trigger seeds 12 default tasks + a 100-day program    │
│    + a Hero Mode character row                                    │
└───────────────────────────────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────────────────────────┐
│  ONBOARDING  /onboarding                                          │
│  • Pick one of 6 program templates (100 Hard, 75 Hard, 75 Soft,   │
│    Movement Streak, Reset Week, or a blank slate)                 │
│  • Choose an archetype (Warrior / Sage / Ascetic / Athlete /      │
│    Builder / Wanderer) — sets your XP focus                       │
└───────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  EACH DAY  /today                       │
│  ┌─────────────────────────────────┐    │
│  │  Tap task cards → ripple +      │    │
│  │  confetti + XP award            │    │
│  │  Workout cards → write what     │    │
│  │  you did (required)             │    │
│  │  Journal card → write modal     │    │
│  │  Photo card → upload image      │    │
│  │  Log weight + daily notes       │    │
│  └─────────────────────────────────┘    │
│   HUD: day ring · streak · XP pill      │
│             │                           │
│   all done? │ yes → 🎉 celebration      │
│             │ no                        │
│             ▼                           │
│       sleep, repeat tomorrow            │
└─────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────────────────────────┐
│  HERO MODE  /character                                            │
│  • Avatar, archetype, current tier, level + XP bar                │
│  • Level-up toast fires when you cross a threshold                │
└───────────────────────────────────────────────────────────────────┘
              │
              │  (if you ended yesterday short)
              ▼
┌───────────────────────────────────────────────────────────────────┐
│  RESTART BANNER (only if a past day has misses + isn't dismissed) │
│  • Restart from Day 1 → archive current attempt, start fresh      │
│  • Keep going (modified rules) → dismiss prompt, advance counter  │
└───────────────────────────────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────────────────────────┐
│  REVIEW                                                           │
│  /calendar  → heatmap, tap past day to edit                       │
│  /stats     → per-task bars, totals, weight trend                 │
└───────────────────────────────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────────────────────────┐
│  COMPLETION                                                       │
│  All days N/N → /  shows the victory screen                       │
│  Trophy + totals + start→end dates + confetti                     │
└───────────────────────────────────────────────────────────────────┘
```

### Step-by-step

1. **Clone, install, and seed your `.env.local`** (see [Quick start](#quick-start) below).
2. **Land on `/`.** The cinematic landing page introduces the product, Hero Mode, and the 7-theme system. Hit **Get started**.
3. **Sign up.** Visit `/signup`, enter email + password. The confirmation email lands in your inbox; clicking it logs you in and sends you to `/onboarding`.
4. **Pick a template + archetype.** Six starter programs are available, plus a Hero Mode archetype that sets what your XP rewards.
5. **(Optional) customize further.** Hit **Settings** in the nav to change program length, edit the task list, change icons, mark a task as Journal/Photo, require text on any task, or swap the theme.
6. **Daily check-in.** Open **Today** (`/today`). Each task is a card you tap to check off; checking awards XP. Workout cards require you to write what you did; the Journal card opens a modal; the Photo card opens a file picker. Notes and weight live below the task grid.
7. **Watch the HUD.** A persistent header shows day ring, streak, and an XP pill — tap it to jump to `/character`.
8. **Calendar.** Open **Calendar** anytime. Each cell is colored by completion (dim / red / yellow / blue). Tap any past or current day to open a full editor.
9. **Stats.** Open **Stats** for per-task completion percentages, totals (water, workouts, pages, journal, photos), and a weight trend sparkline.
10. **Character.** Open `/character` for your avatar, archetype, current tier (5 total), and XP-to-next-level bar. Level-up toasts fire when you cross a threshold.
11. **Miss a day?** A banner appears on Today next time you open it: pick **Restart from Day 1** (archives the current attempt, starts a fresh program with today as Day 1) or **Keep going (modified rules)** (the miss stays in your history, counter advances).
12. **Finish strong.** When every day in your program is `N/N`, the Today page replaces itself with a celebration screen: trophy, totals, dates, confetti, and links back to Calendar / Stats.

---

## What you can track

For **every day** of your program, regardless of how you've configured tasks, the app always supports:

- A free-text **"What did you do today?"** notes field (autosaves)
- A daily **weight check-in** with delta vs. your previous entry
- Edit-anytime access from the calendar's day detail modal

And on top of that, you define your own **daily requirements** — a configurable list of tasks the app shows as cards on the today view. Each task is independent and can be:

- A **Checkbox** — the standard tap-to-complete card
- **Requires text** — like a workout — the user must write what they did (e.g. "Push day · bench, OHP, dips, triceps") before the checkbox flips
- A **Journal** entry — opens a modal with a write-anything textarea; saving non-empty text marks the task complete
- A **Photo** upload — opens a file picker, stores the image in Supabase Storage, shows a thumbnail with a full-size preview

The defaults seeded on first sign-up are the 100 Hard task list, but you can replace them entirely via the onboarding picker or from Settings.

---

## Customizable from day one

Visit `/settings` (the **Settings** tab in the nav) and you can:

- Change the **program length** (1–365 days). Default 100.
- **Add / edit / remove / reorder tasks** with up/down controls.
- Pick from a curated set of ~30 icons for each task.
- Mark any task as **Journal** or **Photo** (at most one of each — these get the special UI described above).
- Toggle **"Requires text to mark complete"** on any task.
- Apply a different starter template — archives your current tasks and replaces them.

Changes apply immediately to the today view, calendar, and stats.

---

## Built-in templates

The signup picker (and the Settings → Templates section) offers these out of the box:

| Template          | Days | Vibe                                                                 |
| ----------------- | ---- | -------------------------------------------------------------------- |
| 100 Hard          | 100  | Strict 12-task default — two workouts, gallon of water, 10 pages, journal, photo. |
| 75 Hard           | 75   | Classic Andy Frisella protocol.                                      |
| 75 Soft           | 75   | Gentler version — one workout, no diet restriction.                  |
| Movement Streak   | 30   | One workout + step goal, no diet rules.                              |
| Reset Week        | 7    | Short, gentle reset — sleep, water, walk, journal.                   |
| Build your own    | 30   | Blank slate — every task you add comes from you.                     |

Each template is editable from Settings the moment it's applied.

---

## Hero Mode (RPG layer)

A second layer that sits on top of the habit tracker — your day-by-day check-ins also build a character.

- **6 archetypes** — Warrior, Sage, Ascetic, Athlete, Builder, Wanderer. Each tilts which kinds of tasks weight your XP gain.
- **5 tiers** — Novice → Apprentice → Adept → Expert → Master. You unlock the next tier as your level climbs.
- **XP + leveling** — every task completion awards XP via the `award_xp` Postgres RPC; crossing a threshold pops a level-up toast and updates `/character`.
- **HUD chrome** — a persistent header on app pages shows day ring, streak, and an XP pill. See `apps/web/src/components/hud/`.

State lives in the `characters` table (added by the Phase-4.5 gamification migration); UI lives at `/character` and in `apps/web/src/components/character/`.

---

## Themes

The app supports **7 dark themes**: **Midnight** (default), Aurora, Forge, Solstice, Verdant, Obsidian, Carbon. Pick yours from **Settings → Theme** (component: `apps/web/src/components/theme/theme-picker.tsx`). All themes are scoped CSS variable sets — palettes live alongside the Tailwind config and the `theme-provider` resolves the active set per user.

---

## Requirements

| Tool       | Version          | Why                              |
| ---------- | ---------------- | -------------------------------- |
| **Node**   | 18.18+ or 20+    | Required by Next.js 14           |
| **npm**    | 9+               | Ships with Node                  |
| **Supabase** project | any        | The Postgres + Auth + Storage backend |

You'll also want the [Supabase CLI](https://supabase.com/docs/guides/cli) if you plan to run / write migrations locally.

---

## Quick start

```bash
git clone https://github.com/akcuhmoris/lifestyleprogramtracker.git program
cd program
npm install
cp apps/web/.env.example apps/web/.env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
# SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_APP_URL
npm run dev
```

Open <http://localhost:3000>. You'll be redirected to `/login` — sign up with any email to get rolling.

**Verify your Supabase wiring** any time with:

```bash
node apps/web/scripts/verify-supabase.mjs
```

It probes auth, RLS, the seed trigger, and storage in one shot.

---

## Tech stack

- **[Next.js 14](https://nextjs.org)** — App Router, Server Actions, middleware-driven auth
- **TypeScript** — strict mode
- **[Tailwind CSS](https://tailwindcss.com)** — utility styling with a custom dark palette
- **[Radix UI](https://www.radix-ui.com)** — accessible primitives (dialog, etc.)
- **[Framer Motion](https://www.framer.com/motion/)** — spring animations and transitions
- **[Lucide](https://lucide.dev)** — icon set
- **[canvas-confetti](https://github.com/catdad/canvas-confetti)** — celebration bursts
- **[Supabase](https://supabase.com)** — Postgres (RLS-scoped per user), Auth (email + magic link + OAuth), Storage (signed URLs for progress photos)
- **[tRPC](https://trpc.io)** — typed API procedures in `packages/api/` (shared with the upcoming mobile client)
- **[TanStack Query](https://tanstack.com/query)** — server-state cache on the web client
- **[Vitest](https://vitest.dev)** — 79 unit tests across `packages/shared` plus 10 across `packages/api`

---

## Project layout

```
.
├── package.json                       # monorepo root (npm workspaces)
├── plan/                              # production blueprint + USER-TODO checklist
├── apps/
│   └── web/                           # the Next.js 14 web app
│       ├── next.config.mjs
│       ├── tailwind.config.ts
│       ├── package.json
│       ├── supabase/
│       │   ├── migrations/            # SQL applied via `supabase db push`
│       │   ├── email-templates/       # branded HTML for Supabase Auth
│       │   └── config.toml
│       ├── scripts/verify-supabase.mjs
│       ├── .env.example
│       └── src/
│           ├── app/
│           │   ├── actions.ts         # Server Actions: writes + uploads
│           │   ├── api/trpc/[trpc]/   # tRPC HTTP endpoint
│           │   ├── auth/              # Sign in/up/out + callback
│           │   ├── account/           # Change email/password, delete, export
│           │   ├── onboarding/        # Signup template picker
│           │   ├── login, signup, forgot-password, reset-password
│           │   ├── about, privacy, terms, help, changelog
│           │   ├── settings, stats, calendar
│           │   ├── today/              # signed-in daily check-in OR completion screen
│           │   ├── character/          # Hero Mode page (avatar + XP bar)
│           │   ├── layout.tsx
│           │   └── page.tsx            # / cinematic landing (signed-out marketing)
│           ├── components/             # task-card, calendar-grid, etc.
│           │   ├── landing/            # hero, aurora, archetypes, themes, live-demo
│           │   ├── hud/                # persistent HUD, XP pill, quest card, stat blocks
│           │   ├── character/          # avatar, level-bar, level-up toast + context
│           │   └── theme/              # theme-picker + theme-provider (7 themes)
│           ├── lib/
│           │   ├── supabase/          # server, client, middleware clients
│           │   ├── trpc/              # client provider + react hooks
│           │   ├── db.ts              # Supabase-backed DB helpers
│           │   └── logger.ts          # newline-JSON logger (Sentry-swappable)
│           └── middleware.ts          # Session refresh + auth redirect
├── packages/
│   ├── shared/                        # cross-app types + helpers (tested with Vitest)
│   │   └── src/
│   │       ├── date.ts                # local-timezone date math
│   │       ├── tasks.ts               # Task type + journal/photo finders
│   │       ├── icons.ts               # curated Lucide icon registry
│   │       └── templates.ts           # 6 program templates
│   └── api/                           # tRPC routers (web + future mobile)
│       └── src/routers/{tasks,entries,settings,challenges,media,stats}.ts
├── tools/
│   └── import-from-sqlite.mjs         # Migrate old local SQLite data to Supabase
└── .github/workflows/ci.yml           # 7-job CI pipeline
```

---

## How the data is stored

Tables in your Supabase Postgres (all RLS-scoped to `auth.uid()`):

| Table              | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `challenges`       | Active program + historical attempts               |
| `days`             | Per-day notes                                      |
| `task_completions` | One row per checked task                           |
| `journal_entries`  | Journal-kind entries                               |
| `weights`          | Daily weigh-ins                                    |
| `task_details`     | Per-day text entry for any task (e.g. workouts)    |
| `progress_photos`  | Storage keys for uploaded photos                   |
| `tasks`            | Configurable daily-task definitions                |
| `user_settings`    | Per-user knobs (e.g. `total_days`, `theme`)        |
| `app_state`        | Misc per-user flags (dismissed prompts, etc.)      |
| `characters`       | Hero Mode: archetype, tier, level, XP              |

A `handle_new_user()` trigger fires on `auth.users INSERT` and auto-seeds the 12 default tasks + a 100-day challenge + a `user_settings` row, so a fresh signup lands on a working program from the first click.

Progress photos live in the private `progress-photos` Supabase Storage bucket, keyed by `{user_id}/{date}.{ext}`. The web client hands out signed PUT URLs for upload and signed GET URLs for preview.

To **back up** your account: hit **Account → Download my data** in the app — you get a JSON dump of every check, weight, note, journal entry, and photo metadata. Or copy the entire Supabase project via Supabase's own export tools.

---

## Daily-use mechanics

### Today view

- The day counter at the top shows **Day N of {total}** with a circular progress ring of the overall program.
- A linear **today progress bar** below the header shows how many of today's tasks are done with a glowing fill animation.
- Tap any of the cards to mark it complete. You get a spring animation, a ripple, and a small confetti burst.
- When all of today's tasks are done, the page fires a celebration and shows a "Day N complete" callout.
- **Tasks marked "Requires text"** (workouts by default) open the inline drawer and focus the textarea; typing auto-checks the card, clearing auto-unchecks.
- **Tasks of kind "Photo"** open a file picker. Once an image is uploaded the card flips to checked and shows a thumbnail; click for a full-size preview. Replace or remove from the card footer.
- **Tasks of kind "Journal"** open a modal with a textarea — saving any non-empty content checks the card.
- The notes field at the bottom autosaves about 600 ms after you stop typing.
- The weight card shows your weight delta vs. the most recent prior entry.

### Calendar view

`/calendar` shows a grid with one cell per day (length = whatever you set in Settings). Each cell is color-coded by completion (see *Coloring rules* below). Tap any past or current day to open the **day detail modal** — a single panel where you can:

- Check/uncheck any task
- Add or edit text-entry details (workouts, reading, etc.)
- Upload / view / replace / remove that day's progress photo
- Log or change your weight
- Edit the day's notes and journal entry

Edits flow back to the calendar colors the moment you close the modal. Future days are read-only.

### Coloring rules

- **Dim** — future day or no activity yet
- **Red** — 0 of N tasks checked at end of day
- **Yellow** — 1 to N–1 tasks checked at end of day
- **Electric blue** — N of N (full completion)
- A pulsing blue dot in today's cell marks the day-in-progress.

### Stats view

`/stats` aggregates everything the app tracks:

- **Overview** — full / partial / missed / remaining day counts
- **Totals** — water gallons, workout minutes, pages read, journal entries, photos logged (inferred from task titles where possible)
- **Weight trend** — animated sparkline of every weigh-in, with start / lowest / highest stats and a delta chip
- **Per-task completion** — horizontal bar for each task with `N/elapsed` and a percentage

All values are scoped to the active program only — restarted attempts are archived but not aggregated.

### Restart prompt

If you have a past day with any task still missing and haven't dismissed the prompt for that date, a banner appears at the top of the today view:

> *You missed N tasks on [date]. Restart from Day 1 or keep going (modified rules)?*

- **Restart from Day 1** — confirm dialog, then a new program row is created with today as the start date. The old attempt is archived (`status = restarted`) and no longer drives the calendar or stats, but its rows stay in the database.
- **Keep going** — sets a per-date dismissal flag; the banner won't reappear for that date. The day stays as a miss on the calendar and the day counter advances normally.

### Completion screen

When every day in your program is fully complete, the today route renders a victory screen instead of the daily list — trophy badge, "Program complete" headline, run totals (water, workouts, pages, journal, photos, weight change), and shortcuts to stats / calendar. Confetti fires on first view.

---

## Customizing further (beyond Settings)

### Change the accent color

Each theme has its own accent. The default **Midnight** theme uses `#a5b4fc` on bg `#14141d` / surface `#1f1f2c`. Tweak palettes in `apps/web/tailwind.config.ts` (and the matching CSS variable set in `globals.css`) or add a brand-new theme alongside the existing seven.

### Use kilograms instead of pounds

The `weights` table column is named `weight_lbs` but stores any numeric value. Change the unit label in `apps/web/src/components/weight-card.tsx` and `apps/web/src/components/stats-board.tsx` (search for `lbs`).

### Add more icons to the picker

Edit `packages/shared/src/icons.ts` and add the desired Lucide icon to the `ICONS` map. It'll show up in the picker immediately.

### Add a new template

Append to the `TEMPLATES` array in `packages/shared/src/templates.ts`. No DB migration needed — it'll appear in both the onboarding picker and the Settings template section automatically.

---

## Troubleshooting

**Sign-in loops back to `/login`.** Your `apps/web/.env.local` is probably missing or malformed. Re-run `node apps/web/scripts/verify-supabase.mjs` — it surfaces auth / RLS / storage / trigger problems in one shot.

**Animations feel sluggish.** If your OS has *Reduce Motion* enabled, the app respects it and disables transitions/confetti.

**Port 3000 in use.** Run `PORT=3001 npm run dev`.

**`npm ci` fails with "lockfile out of sync".** Delete `node_modules` and `package-lock.json` and run `npm install` to regenerate.

---

## Scripts

| Command            | What it does                                                  |
| ------------------ | ------------------------------------------------------------- |
| `npm run dev`      | Start the dev server                                          |
| `npm run build`    | Production build (type-check, lint, bundle)                   |
| `npm run start`    | Run the production build                                      |
| `npm run lint`     | Run ESLint                                                    |
| `npm test`         | Run Vitest unit tests                                         |
| `node apps/web/scripts/verify-supabase.mjs` | End-to-end Supabase smoke test                |

CI runs all of the above on every push to `production` plus a typecheck pass across every workspace, a SQL migrations sanity check, and a security audit. See `.github/workflows/ci.yml`.

---

## Privacy

The web app is multi-user via Supabase — your data sits in a Postgres database scoped to your account by Row-Level Security and progress photos live in a private Storage bucket. You can delete your account (and all associated data) from **Account → Danger zone** at any time, and export everything as JSON from **Account → Download my data**.

The drafts of the user-facing Privacy Policy and Terms of Service live at `/privacy` and `/terms`. Both are real drafts — they need a lawyer's eye before any public launch.

---

## License

MIT. Use it, fork it, change it. If it helps you finish your program, that's the only thanks needed.
