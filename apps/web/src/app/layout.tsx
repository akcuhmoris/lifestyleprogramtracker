import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Nav } from "@/components/nav";
import { WelcomeModal } from "@/components/welcome-modal";
import { TrpcProvider } from "@/lib/trpc/provider";
import { createClient } from "@/lib/supabase/server";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Program — Lifestyle tracker",
    template: "%s · Program",
  },
  description:
    "Track any lifestyle program — your tasks, your length, your rules. 75 Hard, 100 Hard, or your own routine.",
  applicationName: "Program",
  keywords: [
    "habit tracker",
    "75 hard",
    "100 hard",
    "lifestyle program",
    "accountability",
    "fitness",
    "journal",
  ],
  openGraph: {
    type: "website",
    title: "Program — Track any lifestyle program",
    description:
      "75 Hard, 100 Hard, or your own routine — your tasks, your length, your rules.",
    siteName: "Program",
  },
  twitter: {
    card: "summary_large_image",
    title: "Program — Track any lifestyle program",
    description:
      "75 Hard, 100 Hard, or your own routine — your tasks, your length, your rules.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userEmail = data.user?.email ?? null;

  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          sans.variable,
          mono.variable,
          "min-h-screen bg-bg text-text font-sans antialiased"
        )}
      >
        <TrpcProvider>
          <Nav userEmail={userEmail} />
          {children}
          <WelcomeModal />
        </TrpcProvider>
      </body>
    </html>
  );
}
