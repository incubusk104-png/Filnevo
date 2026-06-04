// Subscription tier metadata — single source of truth for prices and monthly
// scan quotas. Mirrors the 12-feature pricing matrix on the landing page and the
// defaults assumed by the quota function.
import type { SubscriptionTier } from "@/lib/ai/providers";

export interface TierMeta {
  tier: SubscriptionTier;
  label: string;
  /** Price in PHP per month. */
  pricePhp: number;
  /** Included document scans per billing period. */
  monthlyScanQuota: number;
}

export const TIERS: Record<SubscriptionTier, TierMeta> = {
  free: { tier: "free", label: "Free Sandbox", pricePhp: 0, monthlyScanQuota: 5 },
  starter: { tier: "starter", label: "Starter", pricePhp: 299, monthlyScanQuota: 50 },
  business_pro: { tier: "business_pro", label: "Business Pro", pricePhp: 799, monthlyScanQuota: 500 },
  agency_core: { tier: "agency_core", label: "Agency Core", pricePhp: 2499, monthlyScanQuota: 5000 },
};

export const TIER_KEYS = Object.keys(TIERS) as SubscriptionTier[];

export function isSubscriptionTier(value: unknown): value is SubscriptionTier {
  return typeof value === "string" && (TIER_KEYS as string[]).includes(value);
}

/** Default monthly quota for a tier (used when an admin changes a user's tier). */
export function defaultQuotaForTier(tier: SubscriptionTier): number {
  return TIERS[tier].monthlyScanQuota;
}

export const SUBSCRIPTION_STATUSES = [
  "active",
  "past_due",
  "canceled",
  "suspended",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export function isSubscriptionStatus(value: unknown): value is SubscriptionStatus {
  return typeof value === "string" && (SUBSCRIPTION_STATUSES as readonly string[]).includes(value);
}
