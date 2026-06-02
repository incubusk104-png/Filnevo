// Mock process.env for testing
const originalEnv = process.env;

describe('rate limiter factory', () => {
  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv };
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
      const { createRateLimiter } = require('../factories');
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
      const { createRateLimiter } = require('../factories');
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

describe('supabase client factory', () => {
  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('createSupabaseClientFactory', () => {
    it('returns mock supabase client in demo mode', () => {
      // Arrange - demo mode
      jest.mock('@/lib/mode', () => ({
        isDemoMode: () => true,
        isProductionMode: () => false
      }));
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;

      // Import the factory AFTER setting up mocks
      jest.resetModules(); // Clear module cache
      const { createSupabaseClientFactory } = require('../factories');

      // Act
      const client = createSupabaseClientFactory();

      // Assert - should return an object with auth and from properties (matching mock interface)
      expect(client).toBeDefined();
      expect(client).toHaveProperty('auth');
      expect(client).toHaveProperty('from');
      expect(typeof client.auth.getSession).toBe('function');
      expect(typeof client.from).toBe('function');
    });

    it('returns real supabase client in production mode when env vars are present', () => {
      // Arrange - production mode
      jest.mock('@/lib/mode', () => ({
        isDemoMode: () => false,
        isProductionMode: () => true
      }));
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';

      // Import the factory AFTER setting up mocks
      jest.resetModules(); // Clear module cache
      const { createSupabaseClientFactory } = require('../factories');

      // Act
      const client = createSupabaseClientFactory();

      // Assert - should return an object with auth and from properties
      expect(client).toBeDefined();
      expect(client).toHaveProperty('auth');
      expect(client).toHaveProperty('from');
      // Note: We can't easily test the actual supabase-js client without more complex mocking
      // but we can verify it returns an object with the expected interface
    });

    it('throws an error in production mode when env vars are missing', () => {
      // Arrange - production mode but missing env vars
      jest.mock('@/lib/mode', () => ({
        isDemoMode: () => false,
        isProductionMode: () => true
      }));
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;

      // Import the factory AFTER setting up mocks
      jest.resetModules(); // Clear module cache
      const { createSupabaseClientFactory } = require('../factories');

      // Act & Assert
      expect(() => createSupabaseClientFactory()).toThrow(
        'Missing Supabase environment variables'
      );
    });
  });
});