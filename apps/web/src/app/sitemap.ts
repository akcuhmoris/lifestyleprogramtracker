import type { MetadataRoute } from "next";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${APP_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${APP_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${APP_URL}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${APP_URL}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/changelog`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${APP_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${APP_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}
