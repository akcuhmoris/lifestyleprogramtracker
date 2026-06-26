"use client";

import { useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { THEMES, type Theme } from "@program/shared/themes";

import { AnimatedHeading } from "./animated-heading";

/**
 * "Make it yours" — theme showcase section.
 *
 * Renders a grid of all seven theme cards. Each card paints a small
 * preview using the theme's exact hex values, and on hover overrides
 * its own CSS custom properties so the surrounding chrome briefly
 * tints into that palette.
 */
export function ThemesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16 text-center"
      >
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
          Make it yours
        </p>
        <AnimatedHeading
          as="h2"
          className="text-balance text-5xl font-black tracking-[-0.02em] text-white sm:text-6xl"
        >
          Seven moods. One ritual.
        </AnimatedHeading>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
          Match the app to how you feel today.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
        {THEMES.map((theme, i) => (
          <ThemeCard key={theme.id} theme={theme} index={i} />
        ))}
      </div>
    </section>
  );
}

type ThemeCardProps = {
  theme: Theme;
  index: number;
};

function ThemeCard({ theme, index }: ThemeCardProps) {
  const [hovered, setHovered] = useState(false);

  // When hovered, override the card wrapper's CSS custom properties to
  // this theme's palette. This lets any descendant using var(--accent)
  // etc. tint into the theme as a live preview.
  const hoverStyle: CSSProperties = hovered
    ? ({
        ["--bg" as never]: theme.bg,
        ["--surface" as never]: theme.surface,
        ["--accent" as never]: theme.accent,
        ["--accent-glow" as never]: theme.accentGlow,
        ["--text" as never]: theme.text,
        ["--text-muted" as never]: theme.textMuted,
      } as CSSProperties)
    : {};

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={`Preview ${theme.name} theme`}
      style={hoverStyle}
      className="group block w-full text-left overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur transition-colors duration-300 hover:border-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] focus-visible:ring-[color:var(--accent)]"
    >
      {/* Preview area */}
      <div
        className="relative h-32 overflow-hidden"
        style={{ backgroundColor: theme.bg }}
      >
        {/* Surface bar */}
        <div
          className="absolute left-4 right-4 top-5 h-3 rounded-full"
          style={{ backgroundColor: theme.surface }}
        />
        {/* A second, narrower surface bar for layered depth */}
        <div
          className="absolute left-4 top-12 h-2 w-2/3 rounded-full opacity-70"
          style={{ backgroundColor: theme.surface }}
        />

        {/* Accent circle */}
        <motion.div
          animate={
            hovered
              ? { scale: 1.08, boxShadow: `0 0 28px 4px ${theme.accentGlow}` }
              : { scale: 1, boxShadow: `0 0 14px 0px ${theme.accentGlow}` }
          }
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute bottom-4 right-4 h-10 w-10 rounded-full"
          style={{ backgroundColor: theme.accent }}
        />

        {/* "lvl" pill */}
        <div
          className="absolute bottom-5 left-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{
            backgroundColor: theme.surface,
            color: theme.text,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: theme.accent }}
          />
          lvl 3
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between px-4 py-4">
        <p className="font-bold tracking-tight text-white" style={{ fontWeight: 700 }}>
          {theme.name}
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-white/10"
            style={{ backgroundColor: theme.bg }}
            aria-label="background color"
          />
          <span
            className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-white/10"
            style={{ backgroundColor: theme.surface }}
            aria-label="surface color"
          />
          <span
            className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-white/10"
            style={{ backgroundColor: theme.accent }}
            aria-label="accent color"
          />
        </div>
      </div>
    </motion.button>
  );
}
