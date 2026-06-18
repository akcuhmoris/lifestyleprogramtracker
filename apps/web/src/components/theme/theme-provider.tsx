"use client";

import { useEffect } from "react";
import { isThemeId, type ThemeId, DEFAULT_THEME } from "@program/shared/themes";

type Props = {
  /**
   * The theme to apply. Stored on `<html data-theme="...">` so any CSS rule
   * keyed on `[data-theme="<id>"]` (see globals.css) takes effect.
   */
  theme: ThemeId;
  children: React.ReactNode;
};

/**
 * Sets `document.documentElement.dataset.theme` whenever the active theme
 * changes. Renders children with no visible wrapper so layout is unaffected.
 */
export function ThemeProvider({ theme, children }: Props) {
  useEffect(() => {
    const id: ThemeId = isThemeId(theme) ? theme : DEFAULT_THEME;
    document.documentElement.dataset.theme = id;
  }, [theme]);

  return <>{children}</>;
}
