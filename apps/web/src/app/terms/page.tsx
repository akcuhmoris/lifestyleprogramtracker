import Link from "next/link";
import { Target } from "lucide-react";

import { AnimatedHeading } from "@/components/landing/animated-heading";
import { HudPanel } from "@/components/hud/hud-panel";

export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div
      data-theme="midnight"
      className="relative min-h-screen overflow-hidden bg-[#14141d] text-[#f5f5f7]"
    >
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-12 sm:px-8 lg:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white"
        >
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              boxShadow: "0 0 24px -8px var(--accent-glow)",
            }}
          >
            <Target className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span>Lifestyle Program Tracker</span>
        </Link>

        <header className="mt-10">
          <AnimatedHeading
            as="h1"
            className="text-balance font-[Inter,sans-serif] text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            Terms
          </AnimatedHeading>
          <p className="mt-3 text-sm text-white/60">
            Last updated: May 29, 2026
          </p>
        </header>

        <HudPanel className="legal-prose mt-10 p-6 text-white/80 sm:p-10">
          <p>
            These Terms of Service (the &ldquo;Terms&rdquo;) govern your use of
            the <strong>Lifestyle Program Tracker</strong> web and mobile
            applications (the &ldquo;Service&rdquo;). By creating an account or
            otherwise using the Service, you agree to these Terms. If you do not
            agree, do not use the Service.
          </p>

          <blockquote>
            This document is a working draft. Final terms will be reviewed by an
            attorney before public launch. The current content reflects how the
            Service operates today.
          </blockquote>

          <h2>1. The Service</h2>
          <p>
            Lifestyle Program Tracker is a personal habit tracker for lifestyle programs. It allows
            you to define daily tasks, check them off, log notes and weight, upload
            progress photos, and review your history.
          </p>
          <p>
            The Service is <strong>not medical advice</strong>, <strong>not fitness
            coaching</strong>, and <strong>not nutritional guidance</strong>. Consult
            a qualified professional before starting any health or fitness program.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least <strong>13 years old</strong> (16 in the EEA) to
            create an account.
          </p>

          <h2>3. Your account</h2>
          <ul>
            <li>You are responsible for keeping your account credentials confidential.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>One person, one account.</li>
            <li>
              If you suspect unauthorized access, notify us at{" "}
              <strong>security@program.app</strong>.
            </li>
          </ul>

          <h2>4. Your content</h2>
          <p>
            You retain all rights to the data you upload to the Service. By using
            the Service, you grant us a <strong>limited, non-exclusive,
            royalty-free license</strong> to host, store, transmit, and display Your
            Content solely for the purpose of providing the Service to you. We do
            not use Your Content for any other purpose. We do not use Your Content
            to train AI models.
          </p>

          <h2>5. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose.</li>
            <li>Attempt to gain unauthorized access to any portion of the Service.</li>
            <li>Reverse engineer, decompile, or derive source code from the Service.</li>
            <li>Use automated means to access the Service without our written permission.</li>
            <li>Interfere with or disrupt the Service.</li>
            <li>Resell, sublicense, or commercially exploit the Service.</li>
            <li>Use the Service to send spam, harass others, or transmit malware.</li>
          </ul>

          <h2>6. Intellectual property</h2>
          <p>
            The Service, including the software, design, trademarks, and content
            other than Your Content, is owned by us or our licensors. We grant you a
            limited, non-transferable, non-sublicensable license to use the Service
            in accordance with these Terms.
          </p>

          <h2>7. Pricing</h2>
          <p>
            The Service is offered <strong>free of charge</strong> as of May 29,
            2026. If we introduce paid features in the future, the relevant terms
            will be presented before you sign up for them.
          </p>

          <h2>8. Account termination</h2>
          <p>
            You may delete your account at any time from{" "}
            <strong>Settings → Account & data → Delete account</strong>. Deletion is
            permanent.
          </p>
          <p>
            We may suspend or terminate your account if you violate these Terms.
          </p>

          <h2>9. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE,&rdquo;
            WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WITHOUT
            LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, NON-INFRINGEMENT, OR THAT THE SERVICE WILL BE UNINTERRUPTED OR
            ERROR-FREE.
          </p>
          <p>
            THE SERVICE IS NOT A MEDICAL DEVICE. IT IS NOT INTENDED TO DIAGNOSE,
            TREAT, CURE, OR PREVENT ANY DISEASE.
          </p>

          <h2>10. Limitation of liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROGRAM SHALL NOT BE LIABLE FOR
            ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
            OR ANY LOSS OF PROFITS, REVENUE, DATA, USE, GOODWILL, OR OTHER
            INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF OR INABILITY TO USE THE
            SERVICE.
          </p>
          <p>
            Our total liability under these Terms shall not exceed the greater of
            (a) the amount you paid us in the 12 months before the event giving rise
            to the claim, or (b) USD 50.
          </p>

          <h2>11. Governing law and disputes</h2>
          <p>
            These Terms are governed by the laws of the State of Delaware, USA,
            without regard to its conflict-of-law principles.
          </p>

          <h2>12. Changes to these Terms</h2>
          <p>
            We may modify these Terms from time to time. For material changes we
            will notify you via email or in-app banner at least 14 days before they
            take effect.
          </p>

          <h2>13. Contact</h2>
          <p>
            For questions about these Terms:{" "}
            <strong>support@program.app</strong>
          </p>
        </HudPanel>

        <footer className="mx-auto mt-16 flex max-w-3xl flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-6 text-xs text-white/50">
          <Link href="/about" className="transition-colors hover:text-white">
            About
          </Link>
          <Link href="/help" className="transition-colors hover:text-white">
            Help
          </Link>
          <Link href="/changelog" className="transition-colors hover:text-white">
            Changelog
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-white">
            Terms
          </Link>
        </footer>
      </main>
    </div>
  );
}
