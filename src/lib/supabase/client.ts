// Browser-side Supabase access.
//
// `createClient()` returns a real @supabase/ssr browser client when the public
// env is configured; callers in demo mode should avoid invoking it (the auth UI
// checks `isSupabaseConfigured()` first). The legacy mock export is retained for
// backwards compatibility.
import { createBrowserClient } from "@supabase/ssr";

/** True when server-side Supabase env is configured (used by server components). */
export const isSupabaseConfigured = () => {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY;
};

/** True when the public (browser) Supabase env is configured. */
export const isSupabaseConfiguredClient = () => {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

/** Real browser Supabase client (cookie-synced via @supabase/ssr). */
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  );
};

// Legacy mock retained for compatibility (no current importers).
export const createSupabaseClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
  };
};
