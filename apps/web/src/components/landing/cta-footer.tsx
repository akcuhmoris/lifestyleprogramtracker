"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { AnimatedHeading } from "./animated-heading";
import { MagneticButton } from "./magnetic-button";

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  heading: string;
  links: FooterLink[];
};

const columns: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Help", href: "/help" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    heading: "About",
    links: [{ label: "About", href: "/about" }],
  },
];

export function CtaFooter() {
  return (
    <>
      <section className="relative py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <AnimatedHeading
            as="h2"
            className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl"
          >
            Today is day one.
          </AnimatedHeading>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto mt-6 max-w-2xl text-lg font-normal leading-relaxed text-zinc-400 sm:text-xl"
          >
            Or day fourteen. Or day seventy. The clock starts when you do.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <MagneticButton variant="primary" href="/signup">
              Start your journey
            </MagneticButton>
            <MagneticButton variant="ghost" href="/login">
              I already have an account
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.heading} className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  {column.heading}
                </h3>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-normal text-zinc-400 transition-colors duration-200 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-white/[0.06] pt-8">
            <p className="text-sm font-normal text-zinc-400">
              © 2026 Lifestyle Program Tracker
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default CtaFooter;
