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

export const metadata: Metadata = {
  title: "Program — Lifestyle tracker",
  description: "Track any lifestyle program — your tasks, your length, your rules.",
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
