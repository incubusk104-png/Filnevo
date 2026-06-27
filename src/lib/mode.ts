/**
 * Mode detection utility to distinguish between demo and production mode.
 * Demo mode is active when Supabase credentials are not configured.
 */

export function isDemoMode(): boolean {
  // Use a simpler, more robust check for environment variables.
  // We prioritize the presence of ANY of the required Supabase keys.
  const hasServerKeys =
    typeof process !== 'undefined' &&
    process.env &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_ANON_KEY;

  const hasPublicKeys =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return !(hasServerKeys || hasPublicKeys);
}

export function isProductionMode(): boolean {
  return !isDemoMode();
}
