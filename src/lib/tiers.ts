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
  /**
   * Team seats included with the tier (one accepted member = one seat). Only
   * `agency_core_team` can expand beyond this by purchasing additional seats;
   * every other tier is pinned to its included allowance. Mirrors the SQL
   * functions tier_base_seats / tier_seat_limit.
   */
  baseSeats: number;
  /** Whether the tier supports buying extra seats beyond `baseSeats`. */
  seatsExpandable: boolean;
  /**
   * Monthly PHP price of each seat purchased beyond `baseSeats`. Only meaningful
   * for an expandable tier; `0` everywhere else. `pricePhp` already covers the
   * first `baseSeats` seats.
   */
  pricePerExtraSeatPhp: number;
}

export const TIERS: Record<SubscriptionTier, TierMeta> = {
  free: { tier: "free", label: "Free Trial", pricePhp: 0, monthlyScanQuota: 5, baseSeats: 1, seatsExpandable: false, pricePerExtraSeatPhp: 0 },
  starter: { tier: "starter", label: "Starter", pricePhp: 299, monthlyScanQuota: 50, baseSeats: 1, seatsExpandable: false, pricePerExtraSeatPhp: 0 },
  business_pro: { tier: "business_pro", label: "Business Pro", pricePhp: 799, monthlyScanQuota: 500, baseSeats: 3, seatsExpandable: false, pricePerExtraSeatPhp: 0 },
  agency_core: { tier: "agency_core", label: "Agency Core", pricePhp: 2499, monthlyScanQuota: 5000, baseSeats: 5, seatsExpandable: false, pricePerExtraSeatPhp: 0 },
  agency_core_team: { tier: "agency_core_team", label: "Agency Core Team", pricePhp: 4999, monthlyScanQuota: 10000, baseSeats: 5, seatsExpandable: true, pricePerExtraSeatPhp: 799 },
};

/** Hard ceiling on purchasable seats (defensive bound for inputs/checkout). */
export const MAX_SEATS = 100;

export type BillingPeriod = "monthly" | "annual";

/**
 * Months charged for an annual subscription. Billing 10 months for a 12-month
 * term is the "2 months free" annual discount surfaced on the pricing page.
 */
export const ANNUAL_MONTHS_CHARGED = 10;

export function isBillingPeriod(value: unknown): value is BillingPeriod {
  return value === "monthly" || value === "annual";
}

/** Clamp an arbitrary seat input to the valid [baseSeats, MAX_SEATS] range. */
export function clampSeats(tier: SubscriptionTier, seats: number): number {
  const min = TIERS[tier].baseSeats;
  if (!Number.isFinite(seats)) return min;
  return Math.min(MAX_SEATS, Math.max(min, Math.trunc(seats)));
}

export const TIER_KEYS = Object.keys(TIERS) as SubscriptionTier[];

export function isSubscriptionTier(value: unknown): value is SubscriptionTier {
  return typeof value === "string" && (TIER_KEYS as string[]).includes(value);
}

/** Default monthly quota for a tier (used when an admin changes a user's tier). */
export function defaultQuotaForTier(tier: SubscriptionTier): number {
  return TIERS[tier].monthlyScanQuota;
}

/**
 * Effective seat allowance for a tier, given the number of seats purchased.
 * Mirrors the SQL `tier_seat_limit(tier, seats)`: only the expandable team tier
 * can grow beyond its included seats; all other tiers are pinned to `baseSeats`.
 */
export function seatLimitForTier(
  tier: SubscriptionTier,
  purchasedSeats = 1,
): number {
  const { baseSeats, seatsExpandable } = TIERS[tier];
  return seatsExpandable
    ? Math.max(baseSeats, Math.max(1, Math.trunc(purchasedSeats)))
    : baseSeats;
}

/**
 * Total PHP charged for `tier` given the seats purchased and the billing period.
 * Single source of truth shared by the pricing UI and the checkout API so the
 * displayed price and the amount charged can never drift.
 *
 *   monthlyBase = pricePhp + max(0, seats - baseSeats) * pricePerExtraSeatPhp
 *   monthly  -> monthlyBase
 *   annual   -> monthlyBase * ANNUAL_MONTHS_CHARGED   (2 months free)
 */
export function computeSubscriptionAmountPhp(
  tier: SubscriptionTier,
  seats = 1,
  period: BillingPeriod = "monthly",
): number {
  const meta = TIERS[tier];
  const effectiveSeats = clampSeats(tier, seats);
  const extraSeats = meta.seatsExpandable
    ? Math.max(0, effectiveSeats - meta.baseSeats)
    : 0;
  const monthlyBase = meta.pricePhp + extraSeats * meta.pricePerExtraSeatPhp;
  return period === "annual" ? monthlyBase * ANNUAL_MONTHS_CHARGED : monthlyBase;
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
