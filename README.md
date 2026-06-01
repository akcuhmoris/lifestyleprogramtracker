# Program — Lifestyle Program Tracker

[![CI](https://github.com/akcuhmoris/lifestyleprogramtracker/actions/workflows/ci.yml/badge.svg?branch=production)](https://github.com/akcuhmoris/lifestyleprogramtracker/actions/workflows/ci.yml)

A local-first habit tracker for any lifestyle program — 75 Hard, 100 Hard, a 30-day reset, a custom routine you invented yourself, whatever you want to commit to.

You configure the **length** (1–365 days) and the **daily requirements** (any number of tasks, each with its own icon, optional text-entry requirement, and special "Journal" / "Photo" behaviors). The app tracks completion per day, your weight over time, free-text notes, journal entries, workout / reading detail, and progress photos.

Runs locally on your laptop. No accounts, no servers, no telemetry, no cloud. Your data lives in a single SQLite file in the project root.

> **Status:** Feature-complete and fully configurable. Today view, calendar/heatmap with editable past-day detail modal, stats page, restart-prompt + restart flow, completion celebration, an in-app Settings page, and a welcome / help modal that explains the flow to new users — all live.
>
> **Going to production?** See [`plan/`](./plan/README.md) for the full blueprint. The shortest path is [`plan/USER-TODO.md`](./plan/USER-TODO.md) — a sequenced checklist separating what *you* need to do (accounts, decisions) from what AI can do alongside you.

---

## App flow

A high-level look at the journey from clone to celebration.

```
┌───────────────────────────────────────────────────────────────────┐
│  FIRST LAUNCH                                                     │
│  • npm install && npm run dev                                     │
│  • SQLite DB created with default 100-day program seeded          │
│  • Welcome modal auto-opens, walks you through every screen       │
└───────────────────────────────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────────────────────────┐
│  CUSTOMIZE (optional)  /settings                                  │
│  • Edit program length (1–365 days)                               │
│  • Add / remove / reorder tasks, pick icons                       │
│  • Mark a task as Journal / Photo / requires-text                 │
└───────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  EACH DAY  /                            │
│  ┌─────────────────────────────────┐    │
│  │  Tap task cards → ripple +      │    │
│  │  confetti + check               │    │
│  │  Workout cards → write what     │    │
│  │  you did (required)             │    │
│  │  Journal card → write modal     │    │
│  │  Photo card → upload image      │    │
│  │  Log weight + daily notes       │    │
│  └─────────────────────────────────┘    │
│         Progress bar fills              │
│             │                           │
│   all done? │ yes → 🎉 celebration      │
│             │ no                        │
│             ▼                           │
│       sleep, repeat tomorrow            │
└─────────────────────────────────────────┘
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

1. **Clone and install.** `npm install` builds `better-sqlite3` natively; `npm run dev` boots the server on <http://localhost:3000>.
2. **Welcome modal.** Auto-opens on first visit. Re-open any time from the **?** button in the top nav.
3. **(Optional) customize.** Hit **Settings** in the nav to change program length, edit the task list, change icons, mark a task as Journal/Photo, or require text on any task.
4. **Daily check-in.** Open **Today**. Each task is a card you tap to check off. Workout cards require you to write what you did; the Journal card opens a modal; the Photo card opens a file picker. Notes and weight live below the task grid.
5. **Watch the bars.** The progress ring shows where you are in the program; the linear bar shows where you are in today. Both glow brighter as you near completion.
6. **Calendar.** Open **Calendar** anytime. Each cell is colored by completion (dim / red / yellow / blue). Tap any past or current day to open a full editor.
7. **Stats.** Open **Stats** for per-task completion percentages, totals (water, workouts, pages, journal, photos), and a weight trend sparkline.
8. **Miss a day?** A banner appears on Today next time you open it: pick **Restart from Day 1** (archives the current attempt, starts a fresh program with today as Day 1) or **Keep going (modified rules)** (the miss stays in your history, counter advances).
9. **Finish strong.** When every day in your program is `N/N`, the Today page replaces itself with a celebration screen: trophy, totals, dates, confetti, and links back to Calendar / Stats.

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
- A **Photo** upload — opens a file picker, stores the image locally, shows a thumbnail with a full-size preview

The defaults seeded on first run are the 100 Hard task list — a common starting point — but you can replace them entirely in Settings.

---

## Customizable from day one

Visit `/settings` (the **Settings** tab in the nav) and you can:

- Change the **program length** (1–365 days). Default 100.
- **Add / edit / remove / reorder tasks** with up/down controls.
- Pick from a curated set of ~30 icons for each task.
- Mark any task as **Journal** or **Photo** (at most one of each — these get the special UI described above).
- Toggle **"Requires text to mark complete"** on any task.

Changes apply immediately to the today view, calendar, and stats.

---

## Default starter template (the 100 Hard challenge)

If you don't touch Settings, the app seeds your program with these 12 daily tasks:

1. Followed structured diet (no cheat meals)
2. No alcohol
3. No processed food
4. Workout 1 (45 min · requires you to log what you did)
5. Workout 2 (45 min outdoors · requires you to log what you did)
6. Drank 1 gallon of water
7. Read 10 pages of nonfiction (optional text entry for the book/chapter)
8. Took progress photo (upload an image — stored locally)
9. Self-care block (20–30 min)
10. Slept 7+ hours
11. No social media before morning task is complete
12. Wrote journal entry

Replace, edit, or delete any of these from Settings.

---

## Requirements

| Tool       | Version          | Why                              |
| ---------- | ---------------- | -------------------------------- |
| **Node**   | 18.18+ or 20+    | Required by Next.js 14           |
| **npm**    | 9+               | Ships with Node                  |
| **Python** | 3.x (build only) | `better-sqlite3` native bindings |
| **make / C compiler** | Apple Command Line Tools (macOS) or `build-essential` (Linux) | Same — for SQLite native build |

If `npm install` fails on `better-sqlite3`, install the build prerequisites for your platform:

- **macOS:** `xcode-select --install`
- **Debian/Ubuntu:** `sudo apt install -y build-essential python3`
- **Windows:** install [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) or use WSL

---

## Quick start

```bash
git clone https://github.com/akcuhmoris/lifestyleprogramtracker.git program
cd program
npm install
npm run dev
```

Open <http://localhost:3000> in any browser.

On first launch, the SQLite database (`hardtracker.db`) is created in the project root and seeded with a default program (100 days, the 12 tasks above). Head to **Settings** to customize.

---

## Setting your start date

The default start date is in `src/lib/date.ts`:

```ts
export const CHALLENGE_START = "2026-05-26"; // first-run seed
```

This value is **only used the first time** the database is created. After that, the start date is stored in the `challenges` table and changes only via the in-app **Restart** flow.

If you haven't logged anything yet and want a different start date: edit `CHALLENGE_START`, delete `hardtracker.db` (and the `-shm`/`-wal` sidecars), then `npm run dev`. Otherwise, when you're ready to start over, use the **Restart from Day 1** button on the today view (appears any time you have an unhandled missed day, or via the restart-banner flow).

---

## Tech stack

- **[Next.js 14](https://nextjs.org)** — App Router, Server Actions for all writes
- **TypeScript** — strict mode
- **[Tailwind CSS](https://tailwindcss.com)** — utility styling
- **[Radix UI](https://www.radix-ui.com)** — accessible primitives (dialog, etc.)
- **[Framer Motion](https://www.framer.com/motion/)** — spring animations and transitions
- **[Lucide](https://lucide.dev)** — icon set
- **[canvas-confetti](https://github.com/catdad/canvas-confetti)** — celebration bursts
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** — synchronous local SQLite

No tracking. No analytics. Nothing hits the network at runtime.

---

## Project layout

```
.
├── package.json                       # monorepo root (npm workspaces)
├── plan/                              # production blueprint + USER-TODO checklist
├── apps/
│   └── web/                           # the Next.js 14 web app
│       ├── hardtracker.db             # local SQLite (gitignored, auto-created)
│       ├── next.config.mjs
│       ├── tailwind.config.ts
│       ├── package.json
│       ├── supabase/migrations/       # SQL ready to push once Supabase is set up
│       ├── public/
│       │   └── progress-photos/       # uploaded photos (gitignored)
│       └── src/
│           ├── app/
│           │   ├── actions.ts         # Server Actions: all DB writes + file uploads
│           │   ├── globals.css        # dark theme, ambient blue gradient
│           │   ├── layout.tsx         # wraps every page with the nav bar
│           │   ├── page.tsx           # / route — today view OR completion screen
│           │   ├── calendar/page.tsx  # heatmap
│           │   ├── stats/page.tsx     # aggregates + weight trend
│           │   └── settings/page.tsx  # task list + length editor
│           ├── components/            # task-card, calendar-grid, settings-form, etc.
│           └── lib/
│               ├── db.ts              # better-sqlite3 connection, schema, read/write
│               └── utils.ts           # cn() class merger
├── packages/
│   ├── shared/                        # cross-app types + helpers
│   │   └── src/
│   │       ├── date.ts                # local-timezone date math
│   │       ├── tasks.ts               # Task type + journal/photo finders
│   │       └── icons.ts               # curated Lucide icon registry
│   └── api/                           # tRPC routers (placeholder until Supabase exists)
└── .github/workflows/                 # CI: lint + build on every PR
```

---

## How the data is stored

All writes go through Server Actions in `src/app/actions.ts`, which call helpers in `src/lib/db.ts`. The schema:

| Table              | Columns                                                                       | Purpose                                       |
| ------------------ | ----------------------------------------------------------------------------- | --------------------------------------------- |
| `challenges`       | `id`, `start_date`, `status`, `created_at`                                    | Tracks the active program + historical attempts |
| `days`             | `date` (PK), `challenge_id`, `notes`, `updated_at`                            | Per-day "what did you do" notes               |
| `task_completions` | `(date, task_id)` (PK), `completed_at`                                        | One row per checked task                      |
| `journal_entries`  | `date` (PK), `content`, timestamps                                            | Journal-kind reflective entry                 |
| `weights`          | `date` (PK), `weight_lbs`, timestamps                                         | Daily weigh-in                                |
| `task_details`     | `(date, task_id)` (PK), `content`                                             | Per-day text entry for any task (e.g. workout) |
| `progress_photos`  | `date` (PK), `filename`, `mime`                                               | Filenames of uploaded photos                  |
| `tasks`            | `id`, `position`, `title`, `subtitle`, `icon`, `kind`, `requires_detail`, ... | Configurable daily-task definitions           |
| `settings`         | `key` (PK), `value`                                                           | Configurable settings (e.g. `total_days`)     |
| `app_state`        | `key` (PK), `value`                                                           | Misc state (dismissed prompts, etc.)          |

Uploaded photos live at `public/progress-photos/{date}.{ext}` (gitignored). Back them up by copying that folder.

The DB file lives in the project root. To back it up, copy `hardtracker.db`.

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

Edit the `accent` palette in `tailwind.config.ts`. The default is electric blue `#0EA5FF`.

### Use kilograms instead of pounds

The `weights` table column is named `weight_lbs` but stores any numeric value. Change the unit label in `src/components/weight-card.tsx` and `src/components/stats-board.tsx` (search for `lbs`).

### Add more icons to the picker

Edit `src/lib/icons.ts` and add the desired Lucide icon to the `ICONS` map. It'll show up in the picker immediately.

### Change the seed defaults

If you want a different starter template (so cloners see your program instead of 100 Hard), edit the `DEFAULT_TASKS` array in `src/lib/db.ts`. Only runs when the `tasks` table is empty on first open.

---

## Troubleshooting

**`npm install` fails compiling `better-sqlite3`.** Install your platform's C toolchain (see Requirements). On macOS that's `xcode-select --install`.

**Day counter shows "Starts on ..."** You're before your configured start date. Either wait, or edit `CHALLENGE_START` in `src/lib/date.ts` (only effective on first DB creation).

**Day counter shows "Challenge complete".** You're past the configured length. Congrats — that's the intended end state.

**Animations feel sluggish.** If your OS has *Reduce Motion* enabled, the app respects it and disables transitions/confetti.

**Port 3000 in use.** Run `npm run dev -- -p 3001`.

---

## Scripts

| Command         | What it does                |
| --------------- | --------------------------- |
| `npm run dev`   | Start the dev server        |
| `npm run build` | Production build            |
| `npm run start` | Run the production build    |
| `npm run lint`  | Run ESLint                  |

---

## Privacy

Everything is local. The only network requests during normal use are for Google Fonts (Inter + JetBrains Mono) at build time. If you want a fully offline build, swap those imports in `src/app/layout.tsx` for a self-hosted font or system stack.

---

## License

MIT. Use it, fork it, change it. If it helps you finish your program, that's the only thanks needed.
