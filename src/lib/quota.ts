/**
 * In-memory mirror of the Lock 2 `check_and_increment_quota` PL/pgSQL function.
 * Used by the demo when no Supabase database is configured so the UI quota
 * interactions behave identically to the production atomic function.
 */

export interface QuotaResult {
  allowed: boolean;
  quotaUsed: number;
  quotaLimit: number;
  remaining: number;
}

interface TenantQuota {
  used: number;
  limit: number;
}

const DEFAULT_LIMIT = 100;
const tenants = new Map<string, TenantQuota>();

function getTenant(id: string): TenantQuota {
  let t = tenants.get(id);
  if (!t) {
    t = { used: 0, limit: DEFAULT_LIMIT };
    tenants.set(id, t);
  }
  return t;
}

export function checkAndIncrementQuota(
  tenantId: string,
  increment = 1,
): QuotaResult {
  const t = getTenant(tenantId);
  if (t.used + increment > t.limit) {
    return {
      allowed: false,
      quotaUsed: t.used,
      quotaLimit: t.limit,
      remaining: Math.max(t.limit - t.used, 0),
    };
  }
  t.used += increment;
  return {
    allowed: true,
    quotaUsed: t.used,
    quotaLimit: t.limit,
    remaining: t.limit - t.used,
  };
}

export function setTenantUsage(tenantId: string, used: number, limit = DEFAULT_LIMIT) {
  tenants.set(tenantId, { used: Math.min(used, limit), limit });
}

export function peekQuota(tenantId: string): QuotaResult {
  const t = getTenant(tenantId);
  return {
    allowed: t.used < t.limit,
    quotaUsed: t.used,
    quotaLimit: t.limit,
    remaining: Math.max(t.limit - t.used, 0),
  };
}
