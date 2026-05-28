/**
 * Placeholder. The tRPC router and Supabase-backed procedures will land here
 * once the Supabase project exists and we have its URL + anon key.
 *
 * Planned structure (see plan/02-backend.md):
 *
 *   src/
 *     trpc.ts          — initTRPC, context, middleware
 *     router.ts        — appRouter combining the per-domain routers
 *     routers/
 *       tasks.ts
 *       entries.ts
 *       media.ts
 *       stats.ts
 *       settings.ts
 *       account.ts     — delete-my-account, export-my-data
 *
 * Until that exists, the web app continues to use Server Actions against
 * better-sqlite3 — totally fine for now.
 */
export const PLACEHOLDER = true;
