// Platform-admin Supabase access.
//
// Admin endpoints run with the service-role key (server-side only) so they can
// read/write across tenants, bypassing RLS. The CALLER is still authenticated
// via their @supabase/ssr session cookie and must have
// user_profiles.is_platform_admin = true. Never expose the service-role key.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode } from "@/lib/mode";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Service-role client (full access, RLS-bypassing). Production only. */
export function createAdminClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface AdminContext {
  /** True when Supabase is not configured (demo mode). */
  demo: boolean;
  /** Authenticated caller id (undefined in demo mode). */
  userId?: string;
  /** Service-role client (undefined in demo mode). */
  admin?: SupabaseClient;
}

/**
 * Authenticate the caller (via the @supabase/ssr cookie session) and confirm
 * they are a platform admin. Returns an AdminContext on success, or a
 * NextResponse to return on failure. In demo mode it short-circuits to a demo
 * context so the dashboard renders on sample data.
 */
export async function requirePlatformAdmin(
  _req: NextRequest,
): Promise<AdminContext | NextResponse> {
  if (isDemoMode()) {
    return { demo: true };
  }

  // Resolve the caller from their session cookie.
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();
  if (error || !user) {
    return NextResponse.json(
      { ok: false, error: "unauthenticated" },
      { status: 401 },
    );
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("user_profiles")
    .select("is_platform_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_platform_admin) {
    return NextResponse.json(
      { ok: false, error: "forbidden" },
      { status: 403 },
    );
  }

  return { demo: false, userId: user.id, admin };
}
