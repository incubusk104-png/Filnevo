// Mock supabase server implementation.
// Provides a chainable, awaitable query builder that mirrors the subset of the
// PostgREST/supabase-js surface used across the API routes. All operations
// resolve to { data: null, error: null } in demo mode.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

type MockResponse = { data: any; error: any };

interface MockQueryBuilder extends PromiseLike<MockResponse> {
  select: (...args: any[]) => MockQueryBuilder;
  insert: (...args: any[]) => MockQueryBuilder;
  update: (...args: any[]) => MockQueryBuilder;
  upsert: (...args: any[]) => MockQueryBuilder;
  delete: (...args: any[]) => MockQueryBuilder;
  eq: (...args: any[]) => MockQueryBuilder;
  neq: (...args: any[]) => MockQueryBuilder;
  or: (...args: any[]) => MockQueryBuilder;
  gte: (...args: any[]) => MockQueryBuilder;
  lte: (...args: any[]) => MockQueryBuilder;
  order: (...args: any[]) => MockQueryBuilder;
  limit: (...args: any[]) => MockQueryBuilder;
  single: () => Promise<MockResponse>;
  maybeSingle: () => Promise<MockResponse>;
}

const createQueryBuilder = (): MockQueryBuilder => {
  const result: MockResponse = { data: null, error: null };
  const resolved = Promise.resolve(result);
  const builder = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    upsert: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    or: () => builder,
    gte: () => builder,
    lte: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => resolved,
    maybeSingle: () => resolved,
    then: resolved.then.bind(resolved),
  } as MockQueryBuilder;
  return builder;
};

interface MockSupabaseClient {
  auth: {
    getSession: (...args: any[]) => Promise<MockResponse>;
    signInWithPassword: (...args: any[]) => Promise<MockResponse>;
    signUp: (...args: any[]) => Promise<MockResponse>;
    signOut: (...args: any[]) => Promise<{ error: any }>;
    getUser: (...args: any[]) => Promise<{ data: { user: any }; error: any }>;
  };
  from: (...args: any[]) => MockQueryBuilder;
  rpc: (...args: any[]) => Promise<MockResponse>;
}

export const createClient = (): MockSupabaseClient => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => createQueryBuilder(),
    rpc: async () => ({ data: null, error: null }),
  };
};

// For backward compatibility
export const createMockSupabaseClient = createClient;

// ---------------------------------------------------------------------------
// Real cookie-bound server client (@supabase/ssr).
// Reads/writes the session via Next's cookie store so login persists and API
// routes / server components can resolve the authenticated user. Edge-safe
// (no Node built-ins). Only call in production mode (Supabase configured).
// ---------------------------------------------------------------------------
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll called from a Server Component (read-only cookie store).
          // Token refresh persistence is handled in route handlers / actions.
        }
      },
    },
  });
}
