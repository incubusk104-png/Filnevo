// Shared "apply a paid upgrade" logic used by both the PayMongo webhook and the
// QR Ph status poll. Centralising it means a customer is upgraded the moment a
// payment is confirmed via *either* path — so access is granted even if the
// webhook is not (yet) registered in the PayMongo dashboard.
//
// Runs on the Edge Runtime (service-role Supabase client over fetch).
import { createAdminClient } from "@/lib/supabase/admin";
import { defaultQuotaForTier } from "@/lib/tiers";
import type { SubscriptionTier } from "@/lib/ai/providers";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { renderCheckoutConfirmationEmail } from "@/lib/email/checkout-confirmation";

/** Add one calendar month to a date (UTC). */
function addOneMonth(from: Date): Date {
  const d = new Date(from);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d;
}

export interface ApplyUpgradeArgs {
  userId: string;
  tier: SubscriptionTier;
  /** Idempotency key for the payments ledger (checkout/intent/payment id). */
  providerRef: string;
  /** Amount paid in PHP (whole pesos), when known. */
  amount?: number;
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
  const now = new Date();
  const periodEnd = addOneMonth(now);
  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("user_profiles")
    .update({
      subscription_tier: tier,
      monthly_scan_quota: defaultQuotaForTier(tier),
      subscription_status: "active",
      scans_used_this_period: 0,
      period_started_at: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    })
    .eq("id", userId)
    .select("email, display_name")
    .maybeSingle();

  if (profileError) {
    throw new Error(`profile_update_failed: ${profileError.message}`);
  }

  // Best-effort confirmation email (Resend). Never fail the upgrade if email is
  // unconfigured or the send errors — the customer is already upgraded.
  if (profile?.email) {
    const appUrl = (process.env.APP_URL ?? "").replace(/\/$/, "");
    const { subject, html } = renderCheckoutConfirmationEmail({
      tier,
      amountPhp: amount,
      periodEnd: periodEnd.toISOString(),
      displayName: profile.display_name,
      appUrl,
    });
    const result = await sendTransactionalEmail({ to: profile.email, subject, html });
    if (!result.sent && !result.skipped) {
      console.error("checkout_email_failed:", result.error);
    }
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

  return { periodEnd: periodEnd.toISOString() };
}
