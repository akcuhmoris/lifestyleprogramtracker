import {
  Apple,
  Beer,
  Sandwich,
  Dumbbell,
  Trees,
  GlassWater,
  BookOpen,
  Camera,
  Sparkles,
  Moon,
  Smartphone,
  PenLine,
  type LucideIcon,
} from "lucide-react";

export type TaskDef = {
  id: number;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  /** If set, the card exposes a small expandable drawer with this placeholder. */
  detailPlaceholder?: string;
  detailLabel?: string;
  /** If true, the task cannot be checked until detail text is non-empty. */
  requiresDetail?: boolean;
};

export const TASKS: TaskDef[] = [
  { id: 1, title: "Structured diet", subtitle: "No cheat meals", icon: Apple },
  { id: 2, title: "No alcohol", icon: Beer },
  { id: 3, title: "No processed food", icon: Sandwich },
  {
    id: 4,
    title: "Workout 1",
    subtitle: "45 min · log what you did",
    icon: Dumbbell,
    detailLabel: "What did you do?",
    detailPlaceholder: "e.g. Push day · bench, OHP, dips, triceps",
    requiresDetail: true,
  },
  {
    id: 5,
    title: "Workout 2",
    subtitle: "45 min outdoors · log what you did",
    icon: Trees,
    detailLabel: "What did you do?",
    detailPlaceholder: "e.g. 5-mile zone 2 run along the river",
    requiresDetail: true,
  },
  { id: 6, title: "1 gallon of water", icon: GlassWater },
  {
    id: 7,
    title: "Read 10 pages",
    subtitle: "Nonfiction",
    icon: BookOpen,
    detailLabel: "What did you read?",
    detailPlaceholder: "e.g. Atomic Habits · ch. 3, pp. 41–53",
  },
  { id: 8, title: "Progress photo", icon: Camera },
  { id: 9, title: "Self-care block", subtitle: "20–30 min", icon: Sparkles },
  { id: 10, title: "7+ hours sleep", icon: Moon },
  { id: 11, title: "No social media", subtitle: "Until morning task done", icon: Smartphone },
  { id: 12, title: "Journal entry", subtitle: "Tap to write", icon: PenLine },
];

export const TASK_COUNT = TASKS.length;
export const JOURNAL_TASK_ID = 12;
