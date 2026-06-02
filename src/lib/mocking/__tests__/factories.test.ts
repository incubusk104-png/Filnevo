import { createRateLimiter } from '../factories';
import { isDemoMode, isProductionMode } from '@/lib/mode';

// Mock process.env for testing
const originalEnv = process.env;

describe('rate limiter factory', () => {
  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv };
    jest.resetModules(); // Clear module cache to pick up new env vars
  });

  afterAll(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('createRateLimiter', () => {
    it('should return mock rate limiter in demo mode', () => {
      // Arrange - demo mode
      delete process.env.SUPABASE_URL;
      process.env.SUPABASE_ANON_KEY = 'test-key';

      // Act
      const rateLimiter = createRateLimiter('test-id');

      // Assert
      expect(rateLimiter).toHaveProperty('allowed');
      expect(rateLimiter).toHaveProperty('limit');
      expect(rateLimiter).toHaveProperty('remaining');
      expect(rateLimiter).toHaveProperty('resetMs');
      expect(rateLimiter.allowed).toBe(true);
      expect(typeof rateLimiter.limit).toBe('number');
      expect(typeof rateLimiter.remaining).toBe('number');
      expect(typeof rateLimiter.resetMs).toBe('number');
    });

    it('should return mock rate limiter in production mode (placeholder)', () => {
      // Arrange - production mode
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';

      // Act
      const rateLimiter = createRateLimiter('test-id');

      // Assert
      expect(rateLimiter).toHaveProperty('allowed');
      expect(rateLimiter).toHaveProperty('limit');
      expect(rateLimiter).toHaveProperty('remaining');
      expect(rateLimiter).toHaveProperty('resetMs');
      expect(rateLimiter.allowed).toBe(true);
      expect(typeof rateLimiter.limit).toBe('number');
      expect(typeof rateLimiter.remaining).toBe('number');
      expect(typeof rateLimiter.resetMs).toBe('number');
    });
  });
});