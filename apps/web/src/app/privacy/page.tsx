import { LegalPage } from "@/components/legal-page";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="May 29, 2026">
      <p>
        This Privacy Policy describes how <strong>Lifestyle Program Tracker</strong>{" "}
        (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) collects, uses, and
        shares information when you use the Lifestyle Program Tracker mobile and
        web applications (the &ldquo;Service&rdquo;). If you have any questions,
        contact us at <strong>privacy@lifestyleprogramtracker.app</strong>.
      </p>

      <blockquote>
        This document is a working draft. Final terms will be reviewed by an
        attorney before public launch. The current content reflects how the app
        actually handles data today.
      </blockquote>

      <h2>1. What we collect</h2>
      <h3>Information you provide directly</h3>
      <ul>
        <li>
          <strong>Account information.</strong> Email address, password (hashed by our
          auth provider), and — if you sign in with Google or Apple — your name
          and profile picture if you choose to share them.
        </li>
        <li>
          <strong>Profile information.</strong> Optional display name and timezone.
        </li>
        <li>
          <strong>Program data.</strong> Your daily task completions, journal entries,
          weight logs, notes, progress photos, and program settings (length,
          task list, etc.).
        </li>
      </ul>

      <h3>Information we collect automatically</h3>
      <ul>
        <li>
          <strong>Device and connection.</strong> IP address, browser type, device
          type, operating system, app version.
        </li>
        <li>
          <strong>Usage events.</strong> Basic interactions (sign-in, screen views,
          error events). Opt out in Settings.
        </li>
        <li>
          <strong>Crash diagnostics.</strong> Stack trace and request ID — never your
          weight, journal, or photo content.
        </li>
      </ul>

      <h3>Information we do NOT collect</h3>
      <ul>
        <li>We do not access your contacts, calendar, location, microphone, or background activity.</li>
        <li>We do not collect biometric identifiers.</li>
        <li>We do not use third-party advertising trackers.</li>
        <li>We do not sell your data to anyone, ever.</li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li><strong>To run the Service.</strong> Create your account, store your data, sync between devices.</li>
        <li><strong>To improve the Service.</strong> Debug bugs, plan features, using aggregated and pseudonymous data.</li>
        <li><strong>To communicate with you.</strong> Transactional emails only — no marketing unless you opt in.</li>
        <li><strong>To protect the Service.</strong> Detect abuse, fraud, and security incidents.</li>
        <li><strong>To comply with the law.</strong> Respond to valid legal requests where required.</li>
      </ul>
      <p>We do <strong>not</strong> use your data to train AI models.</p>

      <h2>3. Who we share data with</h2>
      <p>We share data only with the service providers required to operate the Service:</p>
      <ul>
        <li><strong>Supabase</strong> — database, authentication, file storage</li>
        <li><strong>Vercel</strong> — web hosting</li>
        <li><strong>Expo</strong> — mobile app builds + updates</li>
        <li><strong>Sentry</strong> — error tracking</li>
        <li><strong>Apple / Google</strong> — app-store distribution and push notification delivery</li>
      </ul>
      <p>
        We do not share data with advertisers, data brokers, or marketing
        networks.
      </p>

      <h2>4. How long we keep your data</h2>
      <ul>
        <li>While your account is active.</li>
        <li>
          When you delete your account from Settings, your account and all
          associated data are permanently removed.
        </li>
        <li>Standard database backups are kept for up to 90 days; deleted data is purged from backups too.</li>
        <li>Server logs are kept for up to 30 days; crash reports for up to 90 days.</li>
      </ul>

      <h2>5. Your rights</h2>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Correct inaccurate data.</li>
        <li>Delete your account and all associated data.</li>
        <li>Export your data in a portable JSON format.</li>
        <li>Object to or restrict processing.</li>
        <li>Withdraw consent to optional analytics.</li>
        <li>Lodge a complaint with a data protection authority.</li>
      </ul>
      <p>
        Use the in-app <strong>Settings → Account & data</strong> buttons, or email{" "}
        <strong>privacy@lifestyleprogramtracker.app</strong>. We will respond within 30 days.
      </p>

      <h2>6. Children</h2>
      <p>
        The Service is <strong>not directed to children under 13</strong> (under 16 in
        the EEA). We do not knowingly collect personal information from children.
      </p>

      <h2>7. International transfers</h2>
      <p>
        The Service is hosted in the United States. By using the Service from
        outside the U.S., you consent to the transfer and processing of your
        data in the U.S. We rely on Standard Contractual Clauses (SCCs) where
        applicable for transfers from the EEA, UK, and Switzerland.
      </p>

      <h2>8. Security</h2>
      <ul>
        <li>All connections are encrypted in transit (TLS 1.2+).</li>
        <li>All data is encrypted at rest by our hosting providers.</li>
        <li>Authentication uses tokens with short lifetimes.</li>
        <li>Database row-level security ensures users can only access their own data.</li>
        <li>Service-role credentials are stored only on the server.</li>
      </ul>
      <p>
        No system is perfectly secure. If we discover a data breach that affects
        your information, we will notify you within 72 hours as required by
        applicable law.
      </p>

      <h2>9. Cookies</h2>
      <p>
        The web app uses only <strong>essential cookies</strong>, primarily the
        authentication session cookie. We do not use advertising or third-party
        tracking cookies.
      </p>

      <h2>10. Changes to this Policy</h2>
      <p>
        We may update this Policy from time to time. We will revise the
        &ldquo;Last updated&rdquo; date and — for material changes — notify you
        via email or in-app banner before they take effect.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions, requests, or complaints:{" "}
        <strong>privacy@lifestyleprogramtracker.app</strong>
      </p>
    </LegalPage>
  );
}
