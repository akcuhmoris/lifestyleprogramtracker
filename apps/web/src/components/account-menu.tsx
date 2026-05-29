"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Settings as SettingsIcon, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/auth/actions";

type Props = { email: string };

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.slice(0, 2).toUpperCase();
}

export function AccountMenu({ email }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onEscape);
    }
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full",
          "border bg-bg-card text-[11px] font-bold tracking-wider transition-colors",
          open
            ? "border-accent text-accent-glow shadow-glow"
            : "border-border-subtle text-text-muted hover:border-accent/40 hover:text-accent-glow"
        )}
      >
        {initialsFromEmail(email)}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute right-0 top-full mt-2 w-64 z-50",
              "rounded-xl border border-border bg-bg-card shadow-card overflow-hidden"
            )}
            role="menu"
          >
            <div className="px-4 py-3 border-b border-border-subtle">
              <div className="text-[10.5px] uppercase tracking-[0.18em] text-text-dim">
                Signed in as
              </div>
              <div className="mt-1 text-[13px] font-medium text-text truncate">
                {email}
              </div>
            </div>

            <div className="py-1">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[13.5px] text-text hover:bg-bg-hover hover:text-accent-glow transition-colors"
                role="menuitem"
              >
                <SettingsIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
                Settings
              </Link>

              <Link
                href="/settings#danger-zone"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[13.5px] text-text hover:bg-bg-hover hover:text-accent-glow transition-colors"
                role="menuitem"
              >
                <UserIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
                Account & data
              </Link>
            </div>

            <div className="border-t border-border-subtle py-1">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13.5px] text-text-muted hover:bg-state-miss/10 hover:text-state-miss transition-colors"
                  role="menuitem"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Sign out
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
