// Rate Limiting Factory
import { isDemoMode } from '@/lib/mode';

// Mock rate limiter that matches the interface expected by existing code
// Based on route usage analysis: allowed: boolean, limit: number, remaining: number, resetMs: number
const createMockRateLimiter = (id?: string) => {
  return {
    allowed: true,
    limit: 100,
    remaining: 100,
    resetMs: Date.now() + 60000
  };
};

// For now, return mock in both modes as placeholder (to be replaced with real implementation later)
export const createRateLimiter = (id?: string) => {
  if (isDemoMode()) {
    return createMockRateLimiter(id);
  }
  return createMockRateLimiter(id); // Placeholder - will be replaced with real implementation later
};

// Supabase Client Factory
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createMockSupabaseClient } from '@/lib/supabase/server';

/**
 * Factory function that returns appropriate Supabase client based on mode
 * @returns Supabase client (mock in demo mode, real in production mode)
 */
export const createSupabaseClientFactory = () => {
  if (isDemoMode()) {
    return createMockSupabaseClient();
  }

  // Production mode - return real Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};