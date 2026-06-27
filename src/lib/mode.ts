/**
 * Mode detection utility to distinguish between demo and production mode.
 * Demo mode is active when Supabase credentials are not configured.
 *
 * Checks both server-side and client-side (public) environment variables
 * to ensure consistent behavior across SSR and browser environments.
 */

export function isDemoMode(): boolean {
  // Server-side check
  const hasServerVars =
    typeof process !== 'undefined' &&
    process.env !== undefined &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_ANON_KEY;

  // Client-side (public) check
  const hasPublicVars =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return !(hasServerVars || hasPublicVars);
}

export function isProductionMode(): boolean {
  return !isDemoMode();
}
