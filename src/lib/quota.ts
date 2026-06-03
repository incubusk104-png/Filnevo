// Mock quota implementation for Edge Runtime compatibility
export type QuotaResult = {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
};

const quotas: Record<string, { used: number; limit: number }> = {};

export const peekQuota = (tenantId: string): QuotaResult => {
  const quota = quotas[tenantId] || { used: 0, limit: 100 };
  return {
    allowed: quota.used < quota.limit,
    used: quota.used,
    limit: quota.limit,
    remaining: Math.max(0, quota.limit - quota.used)
  };
};

export const setTenantUsage = (tenantId: string, used: number, limit?: number) => {
  if (!quotas[tenantId]) {
    quotas[tenantId] = { used: 0, limit: 100 };
  }
  quotas[tenantId].used = used;
  if (limit !== undefined) {
    quotas[tenantId].limit = limit;
  }
};

export const checkAndIncrementQuota = (tenantId: string, increment: number = 1): QuotaResult => {
  if (!quotas[tenantId]) {
    quotas[tenantId] = { used: 0, limit: 100 };
  }

  const quota = quotas[tenantId];
  const newUsed = quota.used + increment;
  const allowed = newUsed <= quota.limit;

  if (allowed) {
    quota.used = newUsed;
  }

  return {
    allowed,
    used: quota.used,
    limit: quota.limit,
    remaining: Math.max(0, quota.limit - quota.used)
  };
};