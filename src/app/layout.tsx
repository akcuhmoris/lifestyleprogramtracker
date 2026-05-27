import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Nav } from "@/components/nav";

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
  title: "100 Hard",
  description: "100 days. 12 tasks. No shortcuts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          sans.variable,
          mono.variable,
          "min-h-screen bg-bg text-text font-sans antialiased"
        )}
      >
        <Nav />
        {children}
      </body>
    </html>
  );
}
