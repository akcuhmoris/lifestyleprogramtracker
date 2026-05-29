import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@program/api";
import { createClient } from "@/lib/supabase/server";
import type { Context } from "@program/api";

async function createContext(): Promise<Context> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return {
    userId: data.user?.id ?? null,
    supabase,
  };
}

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`tRPC error on ${path}:`, error.code, error.message);
    },
  });
}

export { handler as GET, handler as POST };
