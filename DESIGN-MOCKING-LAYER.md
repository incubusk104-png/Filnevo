# Consolidated Mocking Layer Design

## Problem Statement
The current codebase has scattered mock implementations across multiple files with inconsistent approaches:
- `src/lib/rate-limit.ts` - Simple mock with hardcoded values
- `src/lib/supabase/server.ts` - Complex mock Supabase client
- `src/mock/lib/supabase/server.ts` - Alternative mock that creates real client then mocks methods
- Mode detection scattered via `isSupabaseConfigured()` checks throughout API routes

This creates confusion, poor testability, and tight coupling between mocking concerns and business logic.

## Solution Overview
Create a centralized mocking layer that:
1. Centralizes mode detection (demo vs production)
2. Provides factory functions for creating mock vs real implementations
3. Ensures consistent interfaces across all mocked services
4. Eliminates scattered mocking logic throughout the codebase

## Design

### 1. Central Mode Detection
Create a single source of truth for determining application mode:

```typescript
// src/lib/mode.ts
export const isDemoMode = (): boolean => {
  return !(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY
  );
};

export const isProductionMode = (): boolean => {
  return !isDemoMode();
};
```

### 2. Mocking Factories
Create centralized factories for each service type:

```typescript
// src/lib/mocking/factories.ts
import { createClient } from '@supabase/supabase-js';

// Rate Limiting Factory
export const createRateLimiter = () => {
  if (isDemoMode()) {
    return createMockRateLimiter();
  }
  return createRealRateLimiter(); // Would integrate with actual rate limiting service
};

const createMockRateLimiter = () => ({
  limit: () => Promise.resolve({ success: true }),
  remaining: () => 100,
  reset: () => Date.now() + 60000
});

// Supabase Client Factory
export const createSupabaseClientFactory = () => {
  if (isDemoMode()) {
    return createMockSupabaseClient();
  }
  return createRealSupabaseClient();
};

const createMockSupabaseClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null }, error: null }),
    signUp: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null })
      })
    }),
    insert: () => ({
      single: async () => ({ data: null, error: null })
    }),
    update: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null })
      })
    }),
    delete: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null })
      })
    })
  })
});

const createRealSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
};

// Token Handler Factory (for @21st-sdk)
export const createTokenHandlerFactory = (options: any) => {
  if (isDemoMode()) {
    return createMockTokenHandler(options);
  }
  return createRealTokenHandler(options); // Would use actual 21st.sdk
};

const createMockTokenHandler = (options: any) => ({
  POST: async (req: Request) => {
    return new Response(JSON.stringify({ message: 'Token handler mock' }), {
      status: 200
    });
  }
});
```

### 3. Updated Import Patterns
Replace scattered imports with centralized factory usage:

**Before (in process-document/route.ts):**
```typescript
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
```

**After:**
```typescript
import { createRateLimiter } from "@/lib/mocking/factories";
import { createSupabaseClientFactory } from "@/lib/mocking/factories";

// Usage in handler:
const rl = createRateLimiter();
const supabase = createSupabaseClientFactory();
```

### 4. Benefits
- **Locality**: Mode detection and mocking logic centralized in one place
- **Leverage**: Simple interface (`create*TheFactory()`) hides complex implementation details
- **Testability**: Easy to mock the factories themselves for testing
- **Consistency**: All services follow same initialization pattern
- **Maintainability**: Changing mode detection logic requires edit in one place only

## Implementation Plan

### Phase 1: Create Mocking Infrastructure
1. Create `src/lib/mode.ts` for mode detection
2. Create `src/lib/mocking/factories.ts` with all factory functions
3. Update `src/lib/rate-limit.ts` to use factory pattern (or deprecate in favor of direct factory usage)

### Phase 2: Migrate Existing Usage
1. Update `src/app/api/process-document/route.ts` to use factories
2. Update other API routes (workspaces, ledger, audit, webhooks, etc.)
3. Update `src/app/login/actions.ts`
4. Update any other files using mocking implementations

### Phase 3: Cleanup
1. Remove or repurpose obsolete mock files:
   - Consider keeping `src/lib/rate-limit.ts` as thin wrapper or remove entirely
   - Evaluate need for `src/mock/lib/supabase/server.ts` and `src/mock/@21st-sdk/nextjs/server.ts`
2. Update imports throughout codebase to use new factory pattern

### Phase 4: Enhancement Opportunities
1. Add logging/metrics to factories to track mock vs real usage
2. Allow runtime override for testing scenarios
3. Extend pattern to other external services as needed

## Files to Create/Modify

### New Files:
- `src/lib/mode.ts`
- `src/lib/mocking/factories.ts`

### Files to Modify:
- `src/lib/rate-limit.ts` (convert to factory wrapper or deprecate)
- `src/lib/supabase/server.ts` (convert to factory wrapper or deprecate)
- `src/app/api/process-document/route.ts`
- `src/app/api/workspaces/route.ts`
- `src/app/api/ledger/[id]/approve/route.ts`
- `src/app/api/audit/export/route.ts`
- `src/app/api/webhooks/route.ts`
- `src/app/api/an-token/route.ts`
- `src/app/api/quota/route.ts`
- `src/app/login/actions.ts`
- `src/mock/lib/supabase/server.ts` (evaluate for removal/repurposing)
- `src/mock/@21st-sdk/nextjs/server.ts` (evaluate for removal/repurposing)

## Testing Strategy
1. Unit tests for mode detection functions
2. Unit tests for each factory verifying correct mock/real creation
3. Integration tests verifying API routes work with both modes
4. End-to-end tests using real services in production-like environments

## Migration Approach
Strategy: Strangler Pattern
1. Keep existing implementations working during migration
2. Gradually migrate each usage to new factory pattern
3. Once all migrated, remove old implementations
4. Feature flag to enable/disable new mocking layer during transition

## Open Questions
1. Should we keep the existing mock files as backward compatibility wrappers?
2. How should we handle partial configuration (some env vars set but not others)?
3. Do we want to support multiple demo modes (e.g., different mock behaviors for different test scenarios)?
4. Should the factories accept configuration parameters for more flexible mocking?