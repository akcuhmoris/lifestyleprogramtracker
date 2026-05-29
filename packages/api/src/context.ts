import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Context shape passed into every procedure.
 *
 * `supabase` is already authenticated as the current user — the web app
 * supplies an SSR-cookie-authed client, mobile supplies a bearer-token-authed
 * client. Either way, RLS scopes every query.
 *
 * `userId` is the resolved user id (auth.uid()) or null for unauth requests.
 */
export type Context = {
  userId: string | null;
  // We keep the Supabase client type loose so we can also use the mobile SDK
  // without forcing the same package version everywhere.
  supabase: SupabaseClient<any, any, any>;
};
