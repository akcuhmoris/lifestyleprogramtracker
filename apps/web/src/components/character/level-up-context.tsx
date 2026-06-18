"use client";

import { useEffect, useRef, useState } from "react";

import { LevelUpToast } from "./level-up-toast";

const CLEAR_MS = 4000;

type LevelUpWatcherProps = {
  level: number;
};

/**
 * Watches the current character level and renders <LevelUpToast> whenever the
 * level prop increases between renders. The toast auto-clears after 4s.
 *
 * Drop this near the root of the app (alongside Today/character pages) and
 * pass the freshest known level. It's safe to mount on first load — it only
 * fires on a strict increase, not on initial mount.
 */
export function LevelUpWatcher({ level }: LevelUpWatcherProps) {
  const previousLevelRef = useRef<number>(level);
  const [celebratingLevel, setCelebratingLevel] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const previous = previousLevelRef.current;
    if (level > previous) {
      setCelebratingLevel(level);

      if (timerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(timerRef.current);
      }
      if (typeof window !== "undefined") {
        timerRef.current = window.setTimeout(() => {
          setCelebratingLevel(null);
          timerRef.current = null;
        }, CLEAR_MS);
      }
    }
    previousLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (celebratingLevel === null) return null;

  return (
    <LevelUpToast
      level={celebratingLevel}
      onDone={() => {
        setCelebratingLevel(null);
        if (timerRef.current !== null && typeof window !== "undefined") {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }}
    />
  );
}
