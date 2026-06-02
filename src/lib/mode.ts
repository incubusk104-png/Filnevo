/**
 * Mode detection utility to distinguish between demo and production mode.
 * Demo mode is active when Supabase credentials are not configured.
 */

export function isDemoMode(): boolean {
  return !(
    typeof process !== 'undefined' &&
    process.env !== undefined &&
    !!process.env.SUPABASE_URL &&
    !!process.env.SUPABASE_ANON_KEY
  );
}

export function isProductionMode(): boolean {
  return !isDemoMode();
}