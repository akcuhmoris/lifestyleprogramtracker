/**
 * Hero Mode theme catalog.
 *
 * Themes recolor the whole app via CSS custom properties keyed on
 * `[data-theme="<id>"]` selectors in `globals.css`. This module is the
 * single source of truth for the palette values.
 */

export type ThemeId =
  | "electric"
  | "forest"
  | "sunset"
  | "cyber"
  | "monochrome"
  | "ember"
  | "midnight";

export type Theme = {
  id: ThemeId;
  name: string;
  /** Page background. */
  bg: string;
  /** Cards / elevated surfaces. */
  surface: string;
  /** Primary accent / brand color. */
  accent: string;
  /** Glow color (use as `box-shadow` / `text-shadow` accent). */
  accentGlow: string;
  /** Default foreground text. */
  text: string;
  /** Secondary / muted foreground text. */
  textMuted: string;
};

export const THEMES: ReadonlyArray<Theme> = [
  {
    id: "electric",
    name: "Electric",
    bg: "#0a0a0f",
    surface: "#14141f",
    accent: "#00d4ff",
    accentGlow: "rgba(0,212,255,.45)",
    text: "#f5f5f7",
    textMuted: "#9ca3af",
  },
  {
    id: "forest",
    name: "Forest",
    bg: "#0a1410",
    surface: "#122019",
    accent: "#2dd4bf",
    accentGlow: "rgba(45,212,191,.45)",
    text: "#ecfdf5",
    textMuted: "#6ee7b7",
  },
  {
    id: "sunset",
    name: "Sunset",
    bg: "#1a0f1f",
    surface: "#261a2e",
    accent: "#f97316",
    accentGlow: "rgba(249,115,22,.45)",
    text: "#fef3c7",
    textMuted: "#fcd34d",
  },
  {
    id: "cyber",
    name: "Cyber",
    bg: "#0d0a1f",
    surface: "#1a1430",
    accent: "#d946ef",
    accentGlow: "rgba(217,70,239,.45)",
    text: "#f5f3ff",
    textMuted: "#c4b5fd",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    bg: "#0a0a0a",
    surface: "#1a1a1a",
    accent: "#fafafa",
    accentGlow: "rgba(250,250,250,.3)",
    text: "#fafafa",
    textMuted: "#a3a3a3",
  },
  {
    id: "ember",
    name: "Ember",
    bg: "#140a05",
    surface: "#1f1209",
    accent: "#f59e0b",
    accentGlow: "rgba(245,158,11,.45)",
    text: "#fef3c7",
    textMuted: "#fdba74",
  },
  {
    id: "midnight",
    name: "Midnight",
    bg: "#14141d",
    surface: "#1f1f2c",
    accent: "#a5b4fc",
    accentGlow: "rgba(165,180,252,0.4)",
    text: "#f5f5f7",
    textMuted: "#8b8b95",
  },
] as const;

export const THEME_IDS: ReadonlyArray<ThemeId> = THEMES.map((t) => t.id);

export const DEFAULT_THEME: ThemeId = "midnight";

export function isThemeId(value: string): value is ThemeId {
  return (THEME_IDS as ReadonlyArray<string>).includes(value);
}

export function getTheme(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
