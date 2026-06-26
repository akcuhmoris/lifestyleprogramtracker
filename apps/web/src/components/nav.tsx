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
  UserCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { openWelcome } from "./welcome-modal";
import { AccountMenu } from "./account-menu";

const items = [
  { href: "/today", label: "Today", icon: Home },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/character", label: "Hero", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

const HIDE_NAV_PATHS = [
  "/",
  "/login",
  "/signup",
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
];

export function Nav({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();
  if (HIDE_NAV_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  return (
    <nav
      className={cn(
        "sticky top-0 z-30 w-full",
        "backdrop-blur-md",
        "border-b"
      )}
      style={{
        backgroundColor: "color-mix(in srgb, var(--surface) 70%, transparent)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-semibold tracking-tight"
          aria-label="Lifestyle Program Tracker — home"
        >
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              boxShadow: "0 6px 18px -8px var(--accent-glow)",
            }}
          >
            <Target className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          {/* Full name on desktop, icon-only on phones. */}
          <span
            className="hidden font-sans text-base font-bold tracking-tight sm:inline"
            style={{ color: "var(--text)" }}
          >
            Forge
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openWelcome}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.04]"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: "var(--text-muted)",
            }}
            aria-label="Open help"
            title="How it works"
          >
            <HelpCircle className="h-4 w-4" strokeWidth={2.2} />
          </button>
          <div
            className="flex items-center gap-1 rounded-xl p-1"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
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
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5",
                    "rounded-lg px-3 py-2 min-h-[44px] min-w-[44px] transition-colors duration-150",
                    "font-sans text-[11px] font-medium"
                  )}
                  style={{
                    color: active ? "var(--text)" : "var(--text-muted)",
                  }}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background:
                          "color-mix(in srgb, var(--accent) 8%, transparent)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "relative h-4 w-4 transition-transform"
                    )}
                    strokeWidth={2}
                  />
                  <span className="relative hidden sm:inline">{item.label}</span>
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
