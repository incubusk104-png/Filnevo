// Platform-admin Supabase access.
//
// Admin endpoints run with the service-role key (server-side only) so they can
// read/write across tenants, bypassing RLS. The CALLER is still authenticated
// with their own bearer token and must have user_profiles.is_platform_admin =
// true. Never expose the service-role key to the client.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode } from "@/lib/mode";

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

function getBearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
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
 * Authenticate the caller and confirm they are a platform admin.
 * Returns an AdminContext on success, or a NextResponse to return on failure.
 * In demo mode it short-circuits to a demo context so the dashboard renders.
 */
export async function requirePlatformAdmin(
  req: NextRequest,
): Promise<AdminContext | NextResponse> {
  if (isDemoMode()) {
    return { demo: true };
  }

  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "unauthenticated" },
      { status: 401 },
    );
  }

  const url = process.env.SUPABASE_URL as string;
  const anonKey = process.env.SUPABASE_ANON_KEY as string;
  // Token-bound client: validates the caller's JWT and resolves their user.
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

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
