"use client";

/**
 * Client-only wrapper around AnimatedHeading for the /auth/check-email server
 * component. We lazy-load the heading so check-email doesn't drag the heavy
 * framer-motion staggered word-reveal onto its initial bundle.
 *
 * Falls back to a plain <h1> with the same classes during the brief window
 * before the bundle hydrates — zero layout shift.
 */

import dynamic from "next/dynamic";

import { AnimatedHeadingFallback } from "./lazy-fallbacks";

const HEADING_CLASS =
  "mt-6 text-balance text-3xl sm:text-4xl font-extrabold tracking-tight text-white";

const AnimatedHeading = dynamic(
  () =>
    import("@/components/landing/animated-heading").then(
      (m) => m.AnimatedHeading,
    ),
  {
    ssr: false,
    loading: () => (
      <AnimatedHeadingFallback className={HEADING_CLASS}>
        Check your email
      </AnimatedHeadingFallback>
    ),
  },
);

export function CheckEmailHeading() {
  return (
    <AnimatedHeading as="h1" className={HEADING_CLASS}>
      Check your email
    </AnimatedHeading>
  );
}
