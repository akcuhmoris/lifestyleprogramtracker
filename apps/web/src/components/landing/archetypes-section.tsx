"use client";

/**
 * Archetypes section for the marketing landing page.
 *
 * "Choose your hero" — six archetype cards that, on hover, lift the selected
 * archetype up to the parent landing page so the hero avatar swaps in real
 * time. The currently-selected archetype gets an accent ring.
 *
 * Hover behavior is mouse-only (pointer:fine). Touch users get the static
 * grid and tap-to-navigate at /signup if we ever wire that in later — for
 * now the section is purely a preview surface.
 */

import {
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  BookOpenText,
  Compass,
  Flame,
  Flower2,
  Sword,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { HudPanel } from "@/components/hud/hud-panel";
import { cn } from "@/lib/utils";
import { ARCHETYPES, type Archetype } from "@program/shared";
import { AnimatedHeading } from "./animated-heading";

// ---------------------------------------------------------------------------
// Icon map — matches the `icon` string field on each archetype
// ---------------------------------------------------------------------------

const ICONS: Record<string, LucideIcon> = {
  Sword,
  BookOpenText,
  Zap,
  Flower2,
  Compass,
  Flame,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type ArchetypesSectionProps = {
  selected: Archetype;
  onHover: (archetype: Archetype | null) => void;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ArchetypesSection({
  selected,
  onHover,
}: ArchetypesSectionProps) {
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleRadioKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const total = ARCHETYPES.length;
    let nextIndex: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (index + 1) % total;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (index - 1 + total) % total;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = total - 1;
        break;
      default:
        return;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    const target = cardRefs.current[nextIndex];
    if (target) {
      target.focus();
      onHover(ARCHETYPES[nextIndex].id);
    }
  }

  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 text-center"
      >
        <p
          className="mb-4 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--accent)" }}
        >
          Choose your hero
        </p>
        <AnimatedHeading
          as="h2"
          className="mb-4 text-balance text-5xl font-extrabold tracking-[-0.02em] text-white sm:text-6xl md:text-7xl"
        >
          Six paths. One discipline.
        </AnimatedHeading>
        <p className="text-balance text-base text-white/60 sm:text-lg">
          Switch anytime.
        </p>
      </motion.div>

      {/* Grid */}
      <div
        role="radiogroup"
        aria-label="Choose your hero"
        className="grid grid-cols-1 gap-5 md:grid-cols-3"
        style={{ perspective: "800px" }}
      >
        {ARCHETYPES.map((archetype, index) => {
          const Icon = ICONS[archetype.icon] ?? Sword;
          const isSelected = archetype.id === selected;

          return (
            <motion.div
              key={archetype.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.55,
                delay: index * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ArchetypeCard
                Icon={Icon}
                name={archetype.id}
                displayName={displayNameFor(archetype.id)}
                tagline={archetype.tagline}
                subtext={archetype.name}
                accent={archetype.accent}
                isSelected={isSelected}
                onMouseEnter={() => onHover(archetype.id)}
                onMouseLeave={() => onHover(null)}
                onKeyDown={(event) => handleRadioKeyDown(event, index)}
                buttonRef={(node) => {
                  cardRefs.current[index] = node;
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default ArchetypesSection;

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

type ArchetypeCardProps = {
  Icon: LucideIcon;
  name: Archetype;
  displayName: string;
  tagline: string;
  subtext: string;
  accent: string;
  isSelected: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
  buttonRef?: (node: HTMLButtonElement | null) => void;
};

function ArchetypeCard({
  Icon,
  displayName,
  tagline,
  subtext,
  accent,
  isSelected,
  onMouseEnter,
  onMouseLeave,
  onKeyDown,
  buttonRef,
}: ArchetypeCardProps) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLButtonElement | null>(null);

  // Normalized cursor position relative to the card center, mapped to a
  // bounded rotation. Springs smooth the entry and the snap-back.
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 200, damping: 20 });

  const MAX_TILT = 10;

  function handlePointerMove(event: ReactMouseEvent<HTMLButtonElement>) {
    if (reduceMotion) return;
    const node = cardRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width; // 0..1
    const py = (event.clientY - rect.top) / rect.height; // 0..1
    // Center-relative, [-1, 1]
    const nx = px * 2 - 1;
    const ny = py * 2 - 1;
    rotateYRaw.set(nx * MAX_TILT);
    // Inverted so the top tilts toward the cursor.
    rotateXRaw.set(-ny * MAX_TILT);
  }

  function handlePointerLeave() {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
    onMouseLeave();
  }

  return (
    <motion.button
      ref={(node) => {
        cardRef.current = node;
        buttonRef?.(node);
      }}
      type="button"
      role="radio"
      aria-checked={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handlePointerLeave}
      onMouseMove={handlePointerMove}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      onClick={onMouseEnter}
      onKeyDown={onKeyDown}
      aria-label={`Pick ${displayName}, ${tagline}`}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="group cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14141d] rounded-2xl"
      style={{
        // Card-scoped accent so the hover border / ring uses this archetype's
        // color without leaking out into the page theme.
        ["--card-accent" as string]: accent,
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformStyle: "preserve-3d",
      }}
    >
      <HudPanel
        className={cn(
          "h-full p-8 transition-colors duration-300",
          // Default border is HudPanel's white/[0.06]; we tint it on hover.
          "group-hover:border-[color:var(--card-accent)]/60",
          isSelected && "ring-2 ring-offset-0",
        )}
      >
        {/* Selected accent ring (color-matched to this archetype). */}
        {isSelected ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              boxShadow: `0 0 0 2px ${accent}, 0 0 32px -8px ${accent}`,
            }}
          />
        ) : null}

        {/* Icon */}
        <div
          className="mb-6 flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
          style={{
            width: 56,
            height: 56,
            background: `color-mix(in srgb, ${accent} 12%, transparent)`,
            color: accent,
          }}
        >
          <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
        </div>

        {/* Name (e.g. "Warrior") */}
        <h3 className="mb-1.5 text-xl font-bold tracking-tight text-white">
          {displayName}
        </h3>

        {/* Tagline */}
        <p className="mb-4 text-sm font-normal leading-relaxed text-white/60">
          {tagline}
        </p>

        {/* Subtext — the archetype.name field, e.g. "The Disciplined" */}
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/60">
          {subtext}
        </p>
      </HudPanel>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Title-case display name for an archetype id.
 *
 * The shared `ARCHETYPES` entries expose two strings: `id` (lowercase, e.g.
 * "warrior") and `name` (descriptive, e.g. "The Disciplined"). The landing
 * card wants the short heroic noun — "Warrior", "Sage", etc. — which is just
 * the capitalized id.
 */
function displayNameFor(id: Archetype): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}
