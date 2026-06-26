"use client";

/**
 * Shared error banner used across the auth pages. Mirrors the inline banner
 * each page previously declared locally — same colors, same animation, same
 * AlertCircle glyph.
 *
 * Uses framer-motion's AnimatePresence + motion.div, so this needs to be a
 * client component. Safe to render inside server components (Next.js will
 * just hydrate it).
 */

import { AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  message: string;
};

export function ErrorBanner({ message }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-[13px]"
        style={{
          border: "1px solid rgba(244, 63, 94, 0.35)",
          background: "rgba(244, 63, 94, 0.07)",
          color: "#fda4af",
        }}
      >
        <AlertCircle
          className="mt-0.5 h-4 w-4 flex-shrink-0"
          strokeWidth={2.5}
        />
        <span>{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
