"use client";

/**
 * Static fallbacks for the dynamically-imported landing primitives used on the
 * auth pages (login, signup, forgot-password, reset-password, check-email).
 *
 * The real components — AnimatedHeading + MagneticButton — pull a sizeable
 * chunk of framer-motion. We lazy-load them via `next/dynamic` to keep the
 * critical JS small, then render these static stand-ins until the bundle
 * arrives. Each fallback mirrors the real component's layout/typography so
 * there is no layout shift on hydration.
 */

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  JSX,
  ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// AnimatedHeading fallback — static heading with the exact same classes the
// real component renders into. No motion, no word-splitting.
// ---------------------------------------------------------------------------

type AnimatedHeadingFallbackProps = {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
};

export function AnimatedHeadingFallback({
  children,
  className,
  as = "h1",
}: AnimatedHeadingFallbackProps) {
  const Tag = as as keyof JSX.IntrinsicElements;
  return <Tag className={className}>{children}</Tag>;
}

// ---------------------------------------------------------------------------
// MagneticButton fallback — static <button> / <a> with the same visual classes
// the real component uses for `primary` and `ghost` variants. The magnetic
// pull and spring scale-down won't fire until hydration; before then the
// element is fully interactive (submits forms, navigates, fires onClick).
// ---------------------------------------------------------------------------

type FallbackVariant = "primary" | "ghost";

const BASE_CLASSES =
  "relative inline-flex items-center justify-center rounded-full px-8 py-4 font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a5b4fc]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14141d]";

const VARIANT_CLASSES: Record<FallbackVariant, string> = {
  primary:
    "bg-[#a5b4fc] text-[#14141d] hover:shadow-[0_0_40px_rgba(165,180,252,0.45)]",
  ghost:
    "border border-white/10 bg-transparent text-white hover:border-white/30",
};

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

type CommonFallbackProps = {
  variant?: FallbackVariant;
  className?: string;
  children?: ReactNode;
};

type AnchorFallbackProps = CommonFallbackProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
    href: string;
  };

type ButtonFallbackProps = CommonFallbackProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

export type MagneticButtonFallbackProps =
  | AnchorFallbackProps
  | ButtonFallbackProps;

export function MagneticButtonFallback(
  props: MagneticButtonFallbackProps = {},
) {
  const {
    variant = "primary",
    className,
    children = " ",
    ...rest
  } = props;
  const innerClassName = cx(BASE_CLASSES, VARIANT_CLASSES[variant], className);

  if ("href" in props && props.href !== undefined) {
    const { href, ...anchorRest } = rest as AnchorFallbackProps;
    return (
      <a {...anchorRest} href={href} className={innerClassName}>
        {children}
      </a>
    );
  }
  const buttonRest = rest as ButtonFallbackProps;
  return (
    <button {...buttonRest} className={innerClassName}>
      {children}
    </button>
  );
}
