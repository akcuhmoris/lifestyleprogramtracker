/**
 * Shared outer chrome for every auth page (login, signup, forgot-password,
 * reset-password). Forces the Midnight palette via `data-theme="midnight"` so
 * the auth flow always feels cinematic regardless of the user's saved theme
 * cookie.
 *
 * Renders the brand lockup at the top of the column and slots `children` below.
 * Server component — keep it state-free so individual pages (which are client
 * components) can compose it cleanly.
 */

import type { ReactNode } from "react";

import { BrandLockup } from "./brand-lockup";

type Props = {
  children: ReactNode;
};

export function AuthShell({ children }: Props) {
  return (
    <div
      data-theme="midnight"
      className="relative min-h-screen overflow-hidden bg-[#14141d] text-[#f5f5f7]"
    >
      <main className="relative min-h-screen flex flex-col items-center px-6 py-12">
        <BrandLockup />

        <div className="mx-auto mt-14 w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
