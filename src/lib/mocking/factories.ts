// Request-scoped client factory for API route handlers.
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Supabase client used by API route handlers.
 *
 * - Demo mode: mock client (renders without Supabase env).
 * - Production: the cookie-bound `@supabase/ssr` server client, so
 *   `auth.getUser()` resolves the caller's session and queries run under the
 *   user's RLS context. Previously this returned a sessionless
 *   `@supabase/supabase-js` client, which made `getUser()` always null and
 *   forced every authenticated route to 401 in production.
 */
export const createSupabaseClientFactory = () => {
  return createServerSupabaseClient();
};
