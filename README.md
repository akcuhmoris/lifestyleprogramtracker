# 100 Hard

A personal habit tracker for the **100 Hard** challenge — 100 days, 12 daily disciplines, no shortcuts.

Runs locally on your laptop. No accounts, no servers, no telemetry, no cloud. Your data stays in a SQLite file in the project directory.

> **Status:** Feature-complete. Today view, calendar/heatmap with editable past-day detail modal, stats page, restart-prompt + restart flow, and day-100 completion celebration are all live. See [Daily-use mechanics](#daily-use-mechanics).

---

## The 12 daily tasks

Each day you check off whether you did each of these:

1. Followed structured diet (no cheat meals)
2. No alcohol
3. No processed food
4. Workout 1 (45 min)
5. Workout 2 (45 min, must be outdoors)
6. Drank 1 gallon of water
7. Read 10 pages of nonfiction
8. Took progress photo (upload an image — stored locally in `public/progress-photos/`, gitignored)
9. Self-care block (20–30 min)
10. Slept 7+ hours
11. No social media before morning task is complete
12. Wrote journal entry

Plus a daily weigh-in and free-text "what did you do today?" notes.

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
git clone <your-fork-url> 100hard
cd 100hard
npm install
npm run dev
```

Open <http://localhost:3000> in any browser.

The SQLite database (`hardtracker.db`) is created automatically on first request and lives in the project root. It's gitignored.

---

## Setting your start date

The challenge start date is hardcoded in `src/lib/date.ts`:

```ts
export const CHALLENGE_START = "2026-05-26"; // <-- change this
```

Use ISO date format (`YYYY-MM-DD`). Day 1 is whatever you put here. The app computes the current day number from your local system date.

If you change the start date after entering data, **delete `hardtracker.db`** before starting — otherwise the existing rows will be dated relative to your old start.

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
├── hardtracker.db          # local SQLite database (gitignored, auto-created)
├── next.config.mjs
├── tailwind.config.ts
├── public/
│   └── progress-photos/        # uploaded photos (gitignored, auto-created)
├── src/
│   ├── app/
│   │   ├── actions.ts                # Server Actions: all DB writes + file uploads
│   │   ├── globals.css               # dark theme, ambient blue gradient, scrollbar
│   │   ├── layout.tsx                # wraps every page with the nav bar
│   │   ├── page.tsx                  # / route — today view OR completion screen
│   │   ├── calendar/page.tsx         # /calendar route — 100-day heatmap
│   │   └── stats/page.tsx            # /stats route — aggregates + weight trend
│   ├── components/
│   │   ├── calendar-grid.tsx         # 100-cell heatmap + legend
│   │   ├── completion-screen.tsx     # day-100 victory layout
│   │   ├── confetti.tsx              # small-burst + big-celebration helpers
│   │   ├── day-detail-modal.tsx      # editable modal for any day from the calendar
│   │   ├── journal-modal.tsx         # task #12 dialog (today view)
│   │   ├── nav.tsx                   # top nav (Today / Calendar / Stats)
│   │   ├── notes-field.tsx           # autosaving "what did you do today" textarea
│   │   ├── photo-card.tsx            # progress-photo upload + thumbnail + preview
│   │   ├── progress-ring.tsx         # animated SVG ring
│   │   ├── restart-banner.tsx        # missed-day prompt + confirm dialog
│   │   ├── stats-board.tsx           # per-task bars, totals, weight sparkline
│   │   ├── task-card.tsx             # tappable 12-task cards w/ ripple + confetti
│   │   ├── today-view.tsx            # composes the today route
│   │   └── weight-card.tsx           # daily weigh-in + delta-from-previous
│   └── lib/
│       ├── date.ts         # local-timezone date math, day number, ISO helpers
│       ├── db.ts           # better-sqlite3 connection, schema, read/write
│       ├── tasks.ts        # the 12 task definitions + icons
│       └── utils.ts        # cn() class merger
```

---

## How the data is stored

All writes go through Server Actions in `src/app/actions.ts`, which call helpers in `src/lib/db.ts`. The schema:

| Table              | Columns                                            | Purpose                              |
| ------------------ | -------------------------------------------------- | ------------------------------------ |
| `challenges`       | `id`, `start_date`, `status`, `created_at`         | Tracks active + historical attempts  |
| `days`             | `date` (PK), `challenge_id`, `notes`, `updated_at` | Per-day "what did you do" notes      |
| `task_completions` | `(date, task_id)` (PK), `completed_at`             | One row per checked task             |
| `journal_entries`  | `date` (PK), `content`, timestamps                 | Task #12 reflective journal          |
| `weights`          | `date` (PK), `weight_lbs`, timestamps              | Daily weigh-in                       |
| `task_details`     | `(date, task_id)` (PK), `content`                  | Workout / reading notes per day      |
| `progress_photos`  | `date` (PK), `filename`, `mime`                    | Filenames of uploaded photos         |
| `app_state`        | `key` (PK), `value`                                | Misc state (dismissed prompts, etc.) |

Uploaded photos live at `public/progress-photos/{date}.{ext}` (gitignored). Back them up by copying that folder.

The DB file is in the project root by default. To back it up, just copy `hardtracker.db`.

---

## Daily-use mechanics

### Today view

- The day counter at the top shows **Day N of 100** with a circular progress ring of the overall challenge.
- Tap any of the 12 cards to mark it complete. You'll get a spring animation, a ripple, and a small confetti burst.
- When all 12 are done, the page fires a celebration animation and shows a "Day N complete" callout.
- **Workouts** (cards 4 & 5) require you to write what you did before they can be checked. Tapping the card opens the inline drawer and focuses the textarea; typing auto-checks, clearing auto-unchecks.
- **Reading** (card 7) lets you log the book / chapter (optional — toggling the checkbox still works without text).
- **Progress photo** (card 8) opens a file picker. Once an image is uploaded the card flips to checked and shows a thumbnail; click it for a full-size preview. Replace or remove from the card footer. Files are stored at `public/progress-photos/` (gitignored) — only you can see them.
- The notes field at the bottom autosaves about 600 ms after you stop typing.
- The weight card shows your weight delta vs. the most recent prior entry. Empty = no entry for today.
- Tapping the **Journal entry** card opens a modal. Saving any non-empty content marks task #12 complete. Clearing it unchecks the box.

### Calendar view

`/calendar` shows a 100-cell grid. Each cell is color-coded by completion (see *Coloring rules* below). Tap any past or current day to open the **day detail modal** — a single panel where you can:

- Check/uncheck any of the 12 tasks
- Add or edit workout / reading details
- Log or change your weight
- Edit the day's notes and journal entry

Edits made in the modal flow back to the calendar colors the moment you close it. Future days are read-only; the cell can't be opened.

### Editing past days

Past days are fully editable through the calendar detail modal. If you check off a previously-missed task and the count reaches 12, the day flips from yellow/red to electric blue.

### Future days

Server actions reject writes for dates after today (local timezone). The DB never accepts a future-dated check.

### Coloring rules

Used in the calendar grid and the day detail modal status badge.

- **Dim** — future day or no activity yet
- **Red** — 0 of 12 tasks checked at end of day
- **Yellow** — 1–11 tasks checked at end of day
- **Electric blue** — 12 of 12 (full completion)
- A pulsing blue dot in the top-right of today's calendar cell marks the day-in-progress.

### Stats view

`/stats` aggregates every metric the app tracks:

- **Overview** — full / partial / missed / remaining day counts
- **Totals** — water gallons (1 × completed water days), workout sessions and minutes (45 × completed workouts), pages read (10 × completed reading days), journal entries, photos logged
- **Weight trend** — animated sparkline of every weigh-in, with start / lowest / highest stats and a delta chip
- **Per-task completion** — horizontal bar for each of the 12 tasks with `N/elapsed` and a percentage

All values are computed from the active challenge only — restarted attempts are archived but not aggregated.

### Restart prompt

If you have a past day with any task still missing and haven't dismissed the prompt for that date, a banner appears at the top of the today view:

> *You missed N tasks on [date]. Restart from Day 1 or keep going (modified rules)?*

- **Restart from Day 1** — confirm dialog, then a new challenge row is created with today as its start date. The old attempt is archived (status = `restarted`) and no longer drives the calendar or stats, but its rows stay in the database for posterity.
- **Keep going** — sets a per-date dismissal flag; the banner won't reappear for that date. The day stays as a miss on the calendar and the day counter advances normally.

### Day-100 completion screen

When all 100 cells in the active challenge are 12/12, the today route renders a victory screen instead of the daily list. Trophy badge, gradient "Challenge complete" headline, totals for the entire run (water, workouts, pages, journal, photos, weight change), and shortcuts to the full stats / calendar. Confetti fires on first view.

---

## Customizing

### Change the tasks

Edit `src/lib/tasks.ts`. Each task has `id`, `title`, optional `subtitle`, and an icon from [Lucide](https://lucide.dev). `id` is the primary key in `task_completions`, so don't renumber existing tasks if you have data — add new ids instead.

### Use kilograms instead of pounds

The `weights` table column is named `weight_lbs` but stores any numeric value. Change the unit label in `src/components/weight-card.tsx` (search for `lbs`). For accurate delta math, just be consistent.

### Change the accent color

Edit the `accent` palette in `tailwind.config.ts`. The default is electric blue `#0EA5FF`.

### Change the timezone behavior

"Today" is computed via the browser/Node local timezone in `src/lib/date.ts`. There's no timezone setting — the app trusts your OS clock.

---

## Troubleshooting

**`npm install` fails compiling `better-sqlite3`.** Install your platform's C toolchain (see Requirements). On macOS that's `xcode-select --install`.

**Schema changed after I started using the app and now reads fail.** This app does not run migrations. If you change a table definition in `src/lib/db.ts`, delete `hardtracker.db` (and the `-wal` / `-shm` sidecar files) and restart `npm run dev`. The schema will be recreated.

**Day counter shows "Starts on ..."** You're before your configured start date. Either wait, or edit `CHALLENGE_START` in `src/lib/date.ts`.

**Day counter shows "Challenge complete".** You're past day 100. Congrats — that's the intended end state.

**Animations feel sluggish.** If your OS has *Reduce Motion* enabled, the app respects it and disables transitions/confetti. Turn off reduced motion in OS Accessibility settings to get the full polish.

**Port 3000 in use.** Run `npm run dev -- -p 3001` (or any other port).

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

MIT. Use it, fork it, change it. If it helps you finish 100 days, that's the only thanks needed.
