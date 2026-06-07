// Server-side Supabase access.
//
// In production (Supabase configured) this returns a real @supabase/ssr client
// bound to the request cookies, so server actions / route handlers operate on
// the caller's live session. In demo mode (no Supabase env) it returns the mock
// client below so the app still renders and the auth UI degrades gracefully.
import { cookies } from "next/headers";
import {
  createServerClient,
  type CookieMethodsServer,
} from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/mode";

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
    signInWithOAuth: (...args: any[]) => Promise<{ data: { url: string | null }; error: any }>;
    verifyOtp: (...args: any[]) => Promise<MockResponse>;
    resend: (...args: any[]) => Promise<MockResponse>;
    exchangeCodeForSession: (...args: any[]) => Promise<MockResponse>;
    signOut: (...args: any[]) => Promise<{ error: any }>;
    getUser: (...args: any[]) => Promise<{ data: { user: any }; error: any }>;
  };
  from: (...args: any[]) => MockQueryBuilder;
  rpc: (...args: any[]) => Promise<MockResponse>;
}

export const createMockSupabaseClient = (): MockSupabaseClient => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signInWithOAuth: async () => ({ data: { url: null }, error: null }),
      // Demo mode accepts any code so the verification step is demoable.
      verifyOtp: async () => ({ data: { user: null, session: null }, error: null }),
      resend: async () => ({ data: {}, error: null }),
      exchangeCodeForSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
      // Demo mode has no real session; surface a stable demo user so
      // authenticated API routes return demo data instead of 401.
      getUser: async () => ({
        data: { user: { id: "demo-user", email: "demo@filnevo.com" } },
        error: null,
      }),
    },
    from: () => createQueryBuilder(),
    rpc: async () => ({ data: null, error: null }),
  };
};

/**
 * Server Supabase client. Real (cookie-bound) when configured, mock in demo.
 * Cookie writes are wrapped in try/catch so this is also safe to call from
 * Server Components (where the cookie store is read-only).
 */
export async function createClient(): Promise<SupabaseClient> {
  if (isDemoMode()) {
    return createMockSupabaseClient() as unknown as SupabaseClient;
  }

  const url = process.env.SUPABASE_URL as string;
  const anonKey = process.env.SUPABASE_ANON_KEY as string;
  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      } catch {
        // Called from a Server Component — cookie writes are handled by the
        // session-refresh middleware instead. Safe to ignore.
      }
    },
  };

  return createServerClient(url, anonKey, { cookies: cookieMethods });
}
