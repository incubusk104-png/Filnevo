// Supabase client (browser).
import { createBrowserClient } from "@supabase/ssr";

export const isSupabaseConfigured = () => {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY;
};

/**
 * Real browser client for client components that need the session directly.
 * Uses NEXT_PUBLIC_* vars (the only Supabase config exposed to the browser).
 * The session lives in cookies, kept in sync with the @supabase/ssr server
 * client, so same-origin API requests are authenticated automatically.
 */
export const createBrowserSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient(url, anonKey);
};

export const createSupabaseClient = () => {
  // Return a mock client
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null })
    }
  };
};