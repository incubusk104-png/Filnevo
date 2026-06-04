// NOTE: This repo has no test runner wired (no `test` script / jest binary).
// These specs document the intended contract and are kept type-correct.
const originalEnv = process.env;

describe('supabase client factory', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('createSupabaseClientFactory', () => {
    it('returns the mock supabase client in demo mode', async () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;

      const { createSupabaseClientFactory } = require('../factories');
      const client = await createSupabaseClientFactory();

      // Mock client exposes the auth + query interface the routes rely on.
      expect(client).toBeDefined();
      expect(client).toHaveProperty('auth');
      expect(client).toHaveProperty('from');
      expect(typeof client.auth.getUser).toBe('function');
      expect(typeof client.from).toBe('function');
    });

    it('delegates to the cookie-bound server client in production', async () => {
      // The factory delegates to @/lib/supabase/server `createClient`, which is
      // the cookie-bound @supabase/ssr client in production so `auth.getUser()`
      // resolves the caller's session (instead of a sessionless anon client).
      jest.doMock('@/lib/supabase/server', () => ({
        createClient: jest.fn(async () => ({
          auth: { getUser: async () => ({ data: { user: null }, error: null }) },
          from: () => ({}),
        })),
      }));

      const serverModule = require('@/lib/supabase/server');
      const { createSupabaseClientFactory } = require('../factories');
      const client = await createSupabaseClientFactory();

      expect(serverModule.createClient).toHaveBeenCalled();
      expect(client).toHaveProperty('auth');
      expect(typeof client.auth.getUser).toBe('function');
    });
  });
});
