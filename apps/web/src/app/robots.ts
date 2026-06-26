import type { MetadataRoute } from "next";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/privacy",
          "/terms",
          "/help",
          "/changelog",
          "/login",
          "/signup",
        ],
        disallow: [
          "/api/",
          "/auth/",
          "/today",
          "/character",
          "/stats",
          "/calendar",
          "/settings",
          "/account",
          "/onboarding",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
