/** @type {import('next').NextConfig} */

import { createRequire } from "node:module";

// Security headers applied to every response.
// CSP is intentionally left out until we add third-party origins (Supabase,
// Sentry, etc.). Once we do, add it here with specific allowlists.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Strict-Transport-Security is added only in production where HTTPS is real.
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
    // Tree-shake large libraries more aggressively. Both pull a lot of
    // sub-modules that are otherwise included as one big chunk on any page
    // that touches a single icon or motion primitive.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// Wrap with Sentry's Next.js plugin if the package is installed. The plugin
// uploads source maps at build time and injects the SDK initialization. We
// require it lazily so the build still works before the user runs
// `npm install @sentry/nextjs`.
let exportedConfig = nextConfig;
try {
  const require = createRequire(import.meta.url);
  const { withSentryConfig } = require("@sentry/nextjs");
  exportedConfig = withSentryConfig(nextConfig, {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: "lifestyleprogramtracker-web",
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  });
} catch {
  // @sentry/nextjs not installed yet — ship the plain config.
}

export default exportedConfig;
