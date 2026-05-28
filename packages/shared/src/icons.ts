import {
  Activity,
  Apple,
  Beer,
  Bike,
  BookOpen,
  Brain,
  Camera,
  Coffee,
  Cookie,
  Dumbbell,
  Flame,
  Footprints,
  GlassWater,
  Heart,
  Leaf,
  ListChecks,
  Moon,
  Mountain,
  PenLine,
  Pill,
  Salad,
  Sandwich,
  Smartphone,
  Smile,
  Sparkles,
  Star,
  Sun,
  Target,
  Trees,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Curated icon set users can pick from in Settings.
 * Keys are stored as strings in the DB; lookups go through ICONS.
 */
export const ICONS = {
  Apple,
  Beer,
  Sandwich,
  Cookie,
  Salad,
  Coffee,
  Dumbbell,
  Trees,
  Footprints,
  Bike,
  Mountain,
  Activity,
  Flame,
  GlassWater,
  BookOpen,
  Brain,
  Camera,
  Smartphone,
  PenLine,
  Sparkles,
  Moon,
  Sun,
  Heart,
  Smile,
  Leaf,
  Wind,
  Pill,
  Star,
  Target,
  Zap,
  ListChecks,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function getIcon(name: string | null | undefined): LucideIcon {
  if (name && name in ICONS) return ICONS[name as IconName];
  return ListChecks;
}
