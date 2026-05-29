"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  HelpCircle,
  Home,
  Settings as SettingsIcon,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { openWelcome } from "./welcome-modal";
import { AccountMenu } from "./account-menu";

const items = [
  { href: "/", label: "Today", icon: Home },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

const HIDE_NAV_PATHS = ["/login", "/signup", "/auth"];

export function Nav({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();
  if (HIDE_NAV_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b border-border-subtle">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-semibold tracking-tight"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-bg shadow-glow">
            <Target className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="text-text">Program</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openWelcome}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-bg-card text-text-muted hover:border-accent/40 hover:text-accent-glow transition-colors"
            aria-label="Open help"
            title="How it works"
          >
            <HelpCircle className="h-4 w-4" strokeWidth={2.2} />
          </button>
          <div className="flex items-center gap-1 rounded-full border border-border-subtle bg-bg-card p-1">
            {items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5",
                    "text-[13px] font-medium transition-colors",
                    active ? "text-bg" : "text-text-muted hover:text-text"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-accent shadow-glow"
                    />
                  )}
                  <Icon className="relative h-3.5 w-3.5" strokeWidth={2.5} />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>
          {userEmail && <AccountMenu email={userEmail} />}
        </div>
      </div>
    </nav>
  );
}
