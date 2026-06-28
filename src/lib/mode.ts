/**
 * Mode detection utility to distinguish between demo and production mode.
 * Demo mode is active when Supabase credentials are not configured.
 */

export function isDemoMode(): boolean {
  // Server-side check
  const hasServerKeys =
    typeof process !== 'undefined' &&
    process.env &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_ANON_KEY;

  // Client-side (public) check
  const hasPublicKeys =
    typeof process !== 'undefined' &&
    process.env &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // In Next.js Edge Runtime, process.env might be partially populated.
  // We also check for global variables that might be injected.
  const hasGlobalPublicKeys =
    // @ts-ignore
    (typeof NEXT_PUBLIC_SUPABASE_URL !== 'undefined' && !!NEXT_PUBLIC_SUPABASE_URL) ||
    // @ts-ignore
    (typeof NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'undefined' && !!NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return !(hasServerKeys || hasPublicKeys || hasGlobalPublicKeys);
}

export function isProductionMode(): boolean {
  return !isDemoMode();
}
