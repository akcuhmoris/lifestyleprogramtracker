import type { MetadataRoute } from "next";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

// Static lastModified so Next's build output stays deterministic — bump this
// when you ship a meaningful content change to the public surface.
const LAST_MODIFIED = "2026-06-26";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${APP_URL}/`, lastModified: LAST_MODIFIED, changeFrequency: "weekly", priority: 1.0 },
    { url: `${APP_URL}/about`, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/signup`, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/login`, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${APP_URL}/help`, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${APP_URL}/changelog`, lastModified: LAST_MODIFIED, changeFrequency: "weekly", priority: 0.6 },
    { url: `${APP_URL}/privacy`, lastModified: LAST_MODIFIED, changeFrequency: "yearly", priority: 0.6 },
    { url: `${APP_URL}/terms`, lastModified: LAST_MODIFIED, changeFrequency: "yearly", priority: 0.6 },
  ];
}
