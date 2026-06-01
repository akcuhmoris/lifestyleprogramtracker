/**
 * Preset lifestyle-program templates. Users can apply any of these to their
 * account in one click from Settings.
 *
 * Applying a template:
 *   - Archives every current non-archived task (data preserved)
 *   - Inserts the template's tasks in order
 *   - Updates user_settings.total_days
 *
 * Past task_completions stay in the DB — they just orphan to archived tasks.
 *
 * To add a new template: append to TEMPLATES below. No DB migration needed.
 */

export type TaskTemplate = {
  title: string;
  subtitle: string | null;
  icon: string;
  kind: "check" | "journal" | "photo";
  requiresDetail: boolean;
  detailLabel: string | null;
  detailPlaceholder: string | null;
};

export type ProgramTemplate = {
  id: string;
  name: string;
  /** One-line description shown on the template card. */
  tagline: string;
  /** Longer paragraph shown in the confirm-modal. */
  description: string;
  totalDays: number;
  /** Optional badge — "Popular", "Starter", etc. */
  badge?: string;
  tasks: TaskTemplate[];
};

/**
 * The classic 100 Hard challenge — the app's original starter template.
 * Same as the seed trigger uses on sign-up.
 */
const HUNDRED_HARD: ProgramTemplate = {
  id: "100-hard",
  name: "100 Hard",
  tagline: "100 days, 12 disciplines, no shortcuts.",
  description:
    "The original 100 Hard template. Two workouts a day, gallon of water, 10 pages of nonfiction, a daily photo, and journal. Strict — miss any task and the classic protocol says restart from Day 1.",
  totalDays: 100,
  badge: "Default",
  tasks: [
    { title: "Structured diet", subtitle: "No cheat meals", icon: "Apple", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "No alcohol", subtitle: null, icon: "Beer", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "No processed food", subtitle: null, icon: "Sandwich", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    {
      title: "Workout 1",
      subtitle: "45 min · log what you did",
      icon: "Dumbbell",
      kind: "check",
      requiresDetail: true,
      detailLabel: "What did you do?",
      detailPlaceholder: "e.g. Push day · bench, OHP, dips, triceps",
    },
    {
      title: "Workout 2",
      subtitle: "45 min outdoors · log what you did",
      icon: "Trees",
      kind: "check",
      requiresDetail: true,
      detailLabel: "What did you do?",
      detailPlaceholder: "e.g. 5-mile zone 2 run along the river",
    },
    { title: "1 gallon of water", subtitle: null, icon: "GlassWater", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    {
      title: "Read 10 pages",
      subtitle: "Nonfiction",
      icon: "BookOpen",
      kind: "check",
      requiresDetail: false,
      detailLabel: "What did you read?",
      detailPlaceholder: "e.g. Atomic Habits · ch. 3, pp. 41–53",
    },
    { title: "Progress photo", subtitle: null, icon: "Camera", kind: "photo", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "Self-care block", subtitle: "20–30 min", icon: "Sparkles", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "7+ hours sleep", subtitle: null, icon: "Moon", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "No social media", subtitle: "Until morning task done", icon: "Smartphone", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "Journal entry", subtitle: "Tap to write", icon: "PenLine", kind: "journal", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
  ],
};

/**
 * 75 Hard — Andy Frisella's mental-toughness challenge.
 * Seven rules over 75 days. Same strictness as 100 Hard.
 */
const SEVENTY_FIVE_HARD: ProgramTemplate = {
  id: "75-hard",
  name: "75 Hard",
  tagline: "Andy Frisella's mental-toughness program.",
  description:
    "75 days. Five core rules in their classic form: follow a diet with no alcohol or cheat meals, two 45-minute workouts (one outdoors), a gallon of water, 10 pages of nonfiction, a progress photo. We split the diet rule into two checks so you have something to log each piece.",
  totalDays: 75,
  badge: "Popular",
  tasks: [
    { title: "Follow your diet", subtitle: "No cheat meals", icon: "Salad", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "No alcohol", subtitle: null, icon: "Beer", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    {
      title: "Workout 1",
      subtitle: "45 min · indoors OK",
      icon: "Dumbbell",
      kind: "check",
      requiresDetail: true,
      detailLabel: "What did you do?",
      detailPlaceholder: "e.g. Upper body lift",
    },
    {
      title: "Workout 2",
      subtitle: "45 min outdoors · rain or shine",
      icon: "Trees",
      kind: "check",
      requiresDetail: true,
      detailLabel: "What did you do?",
      detailPlaceholder: "e.g. 3-mile walk in the rain",
    },
    { title: "1 gallon of water", subtitle: null, icon: "GlassWater", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    {
      title: "Read 10 pages",
      subtitle: "Nonfiction · self-development",
      icon: "BookOpen",
      kind: "check",
      requiresDetail: false,
      detailLabel: "What did you read?",
      detailPlaceholder: "e.g. Can't Hurt Me, ch. 4",
    },
    { title: "Progress photo", subtitle: null, icon: "Camera", kind: "photo", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
  ],
};

/**
 * 30-Day Reset — gentler entry point for someone new to habit tracking.
 */
const THIRTY_DAY_RESET: ProgramTemplate = {
  id: "30-day-reset",
  name: "30-Day Reset",
  tagline: "Build the foundation. Lighter than the Hard programs.",
  description:
    "30 days of basics. No diet rules to track, no two-a-days. Move daily, hydrate, read, sleep, and journal. A solid 'first program' if you've never used a tracker before.",
  totalDays: 30,
  badge: "Starter",
  tasks: [
    { title: "30 min of movement", subtitle: "Walk, run, lift, yoga — anything", icon: "Footprints", kind: "check", requiresDetail: true, detailLabel: "What did you do?", detailPlaceholder: "e.g. 30 min walk + 10 push-ups" },
    { title: "8 glasses of water", subtitle: null, icon: "GlassWater", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "Read 10 pages", subtitle: "Any book", icon: "BookOpen", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "7+ hours sleep", subtitle: null, icon: "Moon", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "10 min mindfulness", subtitle: "Meditation, breathwork, or stillness", icon: "Brain", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "Daily reflection", subtitle: "What went well + what's next", icon: "PenLine", kind: "journal", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
  ],
};

/**
 * Sober 30 — take a 30-day break from alcohol with supportive daily habits.
 */
const SOBER_THIRTY: ProgramTemplate = {
  id: "sober-30",
  name: "Sober 30",
  tagline: "30 days alcohol-free with supportive daily habits.",
  description:
    "A 30-day break from alcohol with the daily habits that make it stick: hydration, movement, sleep, and a journal entry to track how you feel. Lower stakes than the Hard programs — designed to be sustainable.",
  totalDays: 30,
  tasks: [
    { title: "No alcohol", subtitle: null, icon: "Beer", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "8 glasses of water", subtitle: null, icon: "GlassWater", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "30 min of movement", subtitle: null, icon: "Footprints", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "7+ hours sleep", subtitle: null, icon: "Moon", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    {
      title: "Reflection journal",
      subtitle: "How did today go?",
      icon: "PenLine",
      kind: "journal",
      requiresDetail: false,
      detailLabel: null,
      detailPlaceholder: null,
    },
  ],
};

/**
 * Strength Builder — eight weeks of consistent lifting.
 */
const STRENGTH_BUILDER: ProgramTemplate = {
  id: "strength-builder",
  name: "Strength Builder",
  tagline: "56 days of consistent lifting + recovery.",
  description:
    "Eight weeks (56 days) focused on getting stronger. Daily strength workout (with rest days you log as 'rest'), high protein, sleep, and a daily check-in. Built for someone who wants to actually finish a program block.",
  totalDays: 56,
  tasks: [
    {
      title: "Strength workout",
      subtitle: "Log lifts or rest day",
      icon: "Dumbbell",
      kind: "check",
      requiresDetail: true,
      detailLabel: "What did you do?",
      detailPlaceholder: "e.g. Squat 5x5 @ 225 / Bench 5x5 @ 155, or REST",
    },
    { title: "100g+ protein", subtitle: null, icon: "Apple", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "8+ hours sleep", subtitle: null, icon: "Moon", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "Stretch / mobility", subtitle: "10 min minimum", icon: "Activity", kind: "check", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
    { title: "Progress photo", subtitle: "Weekly minimum is plenty", icon: "Camera", kind: "photo", requiresDetail: false, detailLabel: null, detailPlaceholder: null },
  ],
};

/**
 * Custom — minimal scaffolding. The user adds their own tasks from Settings.
 */
const CUSTOM_BLANK: ProgramTemplate = {
  id: "custom",
  name: "Custom",
  tagline: "Blank slate. Build it yourself from Settings.",
  description:
    "Starts you with zero tasks and 30 days. Open Settings → Daily requirements → Add task to design the program from scratch. Best if none of the presets quite fit.",
  totalDays: 30,
  tasks: [],
};

export const TEMPLATES: ProgramTemplate[] = [
  HUNDRED_HARD,
  SEVENTY_FIVE_HARD,
  STRENGTH_BUILDER,
  THIRTY_DAY_RESET,
  SOBER_THIRTY,
  CUSTOM_BLANK,
];

export function findTemplate(id: string): ProgramTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
