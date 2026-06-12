// Shared "apply a paid upgrade" logic used by both the PayMongo webhook and the
// QR Ph status poll. Centralising it means a customer is upgraded the moment a
// payment is confirmed via *either* path — so access is granted even if the
// webhook is not (yet) registered in the PayMongo dashboard.
//
// Runs on the Edge Runtime (service-role Supabase client over fetch).
import { createAdminClient } from "@/lib/supabase/admin";
import {
  defaultQuotaForTier,
  clampSeats,
  TIERS,
  type BillingPeriod,
} from "@/lib/tiers";
import type { SubscriptionTier } from "@/lib/ai/providers";

/** Add `n` calendar months to a date (UTC). */
function addMonths(from: Date, n: number): Date {
  const d = new Date(from);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d;
}

export interface ApplyUpgradeArgs {
  userId: string;
  tier: SubscriptionTier;
  /** Idempotency key for the payments ledger (checkout/intent/payment id). */
  providerRef: string;
  /** Amount paid in PHP (whole pesos), when known. */
  amount?: number;
  /** Seats purchased (team tier). Clamped to the tier's valid range. */
  seats?: number;
  /** Billing period — annual grants a 12-month window, monthly one month. */
  period?: BillingPeriod;
}

/**
 * Upgrade a user to `tier`: set subscription tier, quota, active status and a
 * fresh billing period, then upsert a settled `paid` row into the payments
 * ledger (idempotent on provider + provider_ref). Throws on profile-update
 * failure so callers can return an error status.
 */
export async function applyPaidUpgrade(
  args: ApplyUpgradeArgs,
): Promise<{ periodEnd: string }> {
  const { userId, tier, providerRef, amount } = args;
  const period: BillingPeriod = args.period ?? "monthly";
  const seats = clampSeats(tier, args.seats ?? TIERS[tier].baseSeats);
  const now = new Date();
  const periodEnd = addMonths(now, period === "annual" ? 12 : 1);
  const admin = createAdminClient();

  const { error: profileError } = await admin
    .from("user_profiles")
    .update({
      subscription_tier: tier,
      monthly_scan_quota: defaultQuotaForTier(tier),
      seats,
      subscription_status: "active",
      scans_used_this_period: 0,
      period_started_at: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(`profile_update_failed: ${profileError.message}`);
  }

  const { error: ledgerError } = await admin.from("payments").upsert(
    {
      user_id: userId,
      provider: "paymongo",
      provider_ref: providerRef,
      ...(amount !== undefined ? { amount } : {}),
      currency: "PHP",
      status: "paid",
      tier,
      seats,
      billing_period: period,
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
    },
    { onConflict: "provider,provider_ref" },
  );

  if (ledgerError) {
    // The profile is already upgraded; a ledger write failure is non-fatal but
    // worth logging for reconciliation.
    console.error("apply_upgrade_ledger_failed:", ledgerError.message);
  }

  const { error: purchaseError } = await admin.from("purchases").upsert(
    {
      user_id: userId,
      provider: "paymongo",
      provider_ref: providerRef,
      product_name: `${TIERS[tier].label} plan`,
      ...(amount !== undefined ? { amount } : {}),
      currency: "PHP",
      status: "completed",
      metadata: {
        tier,
        seats,
        billing_period: period,
        period_end: periodEnd.toISOString(),
      },
    },
    { onConflict: "provider,provider_ref", ignoreDuplicates: true },
  );

  if (purchaseError) {
    // Email dispatch is event-driven through the purchases webhook. A purchase
    // event failure should not roll back access, but it must be visible for
    // reconciliation and manual resend.
    console.error("purchase_event_insert_failed:", purchaseError.message);
  }

  return { periodEnd: periodEnd.toISOString() };
}
