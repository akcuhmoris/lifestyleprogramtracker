"use client";

/**
 * AppCursorSpotlight — renders the landing's CursorSpotlight on every
 * authenticated page, but never on the marketing landing (`/`), where the
 * landing component already mounts its own spotlight inside its hero.
 *
 * Keeping the "render condition" in a tiny client wrapper means the rest of
 * the root layout stays a server component.
 */

import { usePathname } from "next/navigation";
import { CursorSpotlight } from "@/components/landing/cursor-spotlight";

export function AppCursorSpotlight() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <CursorSpotlight />;
}

export default AppCursorSpotlight;
