"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  forwardRef,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

type Variant = "primary" | "ghost";

type CommonProps = {
  variant?: Variant;
  strength?: number;
  children: ReactNode;
  className?: string;
};

type AnchorProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
    href: string;
  };

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

export type MagneticButtonProps = AnchorProps | ButtonProps;

const baseClasses =
  "relative inline-flex items-center justify-center rounded-full px-8 py-4 font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a5b4fc]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14141d]";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#a5b4fc] text-[#14141d] hover:shadow-[0_0_40px_rgba(165,180,252,0.45)]",
  ghost:
    "border border-white/10 bg-transparent text-white hover:border-white/30",
};

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

export const MagneticButton = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  MagneticButtonProps
>(function MagneticButton(props, _ref) {
  const {
    variant = "primary",
    strength = 0.25,
    children,
    className,
    ...rest
  } = props;

  const prefersReducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (event: MouseEvent<HTMLSpanElement>) => {
    if (prefersReducedMotion) return;
    const node = wrapperRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const innerClassName = cx(baseClasses, variantClasses[variant], className);

  const motionStyle = prefersReducedMotion
    ? undefined
    : { x: springX, y: springY };

  const sharedMotionProps = {
    whileTap: { scale: 0.95 },
    style: motionStyle,
  };

  return (
    <span
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: "inline-block" }}
    >
      {"href" in props && props.href !== undefined ? (
        <motion.a
          {...(rest as Omit<
            AnchorHTMLAttributes<HTMLAnchorElement>,
            | "onDrag"
            | "onDragEnd"
            | "onDragStart"
            | "onAnimationStart"
            | "onAnimationEnd"
            | "onAnimationIteration"
          >)}
          href={(props as AnchorProps).href}
          ref={_ref as React.Ref<HTMLAnchorElement>}
          className={innerClassName}
          {...sharedMotionProps}
        >
          {children}
        </motion.a>
      ) : (
        <motion.button
          {...(rest as Omit<
            ButtonHTMLAttributes<HTMLButtonElement>,
            | "onDrag"
            | "onDragEnd"
            | "onDragStart"
            | "onAnimationStart"
            | "onAnimationEnd"
            | "onAnimationIteration"
          >)}
          ref={_ref as React.Ref<HTMLButtonElement>}
          className={innerClassName}
          {...sharedMotionProps}
        >
          {children}
        </motion.button>
      )}
    </span>
  );
});
