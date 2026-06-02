import { isDemoMode, isProductionMode } from '../mode';

// Mock process.env for testing
const originalEnv = process.env;

describe('mode utilities', () => {
  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('isDemoMode', () => {
    it('should return true when SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      process.env.SUPABASE_ANON_KEY = 'test-key';
      expect(isDemoMode()).toBe(true);
    });

    it('should return true when SUPABASE_ANON_KEY is missing', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.SUPABASE_ANON_KEY;
      expect(isDemoMode()).toBe(true);
    });

    it('should return true when both are missing', () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;
      expect(isDemoMode()).toBe(true);
    });

    it('should return false when both are present', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';
      expect(isDemoMode()).toBe(false);
    });

    it('should handle undefined process.env gracefully', () => {
      // @ts-ignore - temporarily override for test
      process.env = undefined;
      expect(isDemoMode()).toBe(true);
    });
  });

  describe('isProductionMode', () => {
    it('should return opposite of isDemoMode', () => {
      // When demo mode
      delete process.env.SUPABASE_URL;
      process.env.SUPABASE_ANON_KEY = 'test-key';
      expect(isDemoMode()).toBe(true);
      expect(isProductionMode()).toBe(false);

      // When production mode
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';
      expect(isDemoMode()).toBe(false);
      expect(isProductionMode()).toBe(true);
    });
  });
});