/**
 * Tiny in-memory Supabase mock for tests.
 *
 * Real Supabase has hundreds of methods; we mock just enough to exercise our
 * routers' query shapes. Each `.from(table)` returns a chainable that records
 * what was called and returns a configured response.
 */
import type { Context } from "./context";

type Response<T> = { data: T | null; error: { message: string } | null };

export type MockCall = {
  table: string;
  op: "select" | "insert" | "update" | "upsert" | "delete";
  payload?: unknown;
};

export function makeMockSupabase(opts?: {
  responses?: Partial<
    Record<
      string,
      Partial<Record<"select" | "insert" | "update" | "upsert" | "delete", unknown>>
    >
  >;
}) {
  const calls: MockCall[] = [];
  const responses = opts?.responses ?? {};

  function makeChain(table: string, op: MockCall["op"], payload?: unknown) {
    const cfg = responses[table]?.[op];
    const result: Response<unknown> = { data: cfg ?? null, error: null };
    const chain = {
      select: (..._args: unknown[]) => chain,
      eq: (..._args: unknown[]) => chain,
      lt: (..._args: unknown[]) => chain,
      gte: (..._args: unknown[]) => chain,
      lte: (..._args: unknown[]) => chain,
      order: (..._args: unknown[]) => chain,
      limit: (_n: number) => chain,
      maybeSingle: async () => {
        const arr = Array.isArray(result.data) ? result.data : null;
        return {
          data: arr ? (arr[0] ?? null) : result.data,
          error: result.error,
        };
      },
      single: async () => result,
      then(resolve: (r: Response<unknown>) => void) {
        resolve(result);
      },
    };
    return chain;
  }

  const supabase = {
    from(table: string) {
      return {
        select: (...args: unknown[]) => {
          calls.push({ table, op: "select" });
          return makeChain(table, "select", args);
        },
        insert: (payload: unknown) => {
          calls.push({ table, op: "insert", payload });
          return makeChain(table, "insert", payload);
        },
        update: (payload: unknown) => {
          calls.push({ table, op: "update", payload });
          return makeChain(table, "update", payload);
        },
        upsert: (payload: unknown, _opts?: unknown) => {
          calls.push({ table, op: "upsert", payload });
          return makeChain(table, "upsert", payload);
        },
        delete: () => {
          calls.push({ table, op: "delete" });
          return makeChain(table, "delete");
        },
      };
    },
    storage: {
      from(_bucket: string) {
        return {
          createSignedUrl: async (_key: string, _ttl: number) => ({
            data: { signedUrl: "https://example.test/signed" },
            error: null,
          }),
          createSignedUploadUrl: async (_key: string) => ({
            data: {
              signedUrl: "https://example.test/upload",
              token: "test-token",
            },
            error: null,
          }),
          list: async (_prefix: string, _opts?: unknown) => ({
            data: [],
            error: null,
          }),
          remove: async (_paths: string[]) => ({ data: [], error: null }),
        };
      },
    },
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  };

  return { supabase, calls };
}

export function makeContext(opts?: { userId?: string | null }): Context {
  const { supabase } = makeMockSupabase();
  return {
    userId: opts?.userId === undefined ? "00000000-0000-0000-0000-0000000000aa" : opts.userId,
    // We cast because the mock is intentionally minimal.
    supabase: supabase as unknown as Context["supabase"],
  };
}
