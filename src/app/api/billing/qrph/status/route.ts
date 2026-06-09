import { NextResponse, type NextRequest } from "next/server";
import { resolveBillingUser } from "@/lib/billing/auth";
import { getPaymentIntentStatus } from "@/lib/billing/paymongo";
import { applyPaidUpgrade } from "@/lib/billing/upgrade";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeSubscriptionAmountPhp, isBillingPeriod, isSubscriptionTier, type BillingPeriod } from "@/lib/tiers";

// Required by @cloudflare/next-on-pages: every non-static route runs on Edge.
export const runtime = "edge";

// GET /api/billing/qrph/status?id=<payment_intent_id>
// Cookie-authed. Polls the PayMongo Payment Intent status for a QR Ph payment.
// When the payment has succeeded, the buyer is upgraded here too (idempotent),
// so access is granted even if the PayMongo webhook is not registered.
export async function GET(req: NextRequest) {
  const auth = await resolveBillingUser(req);
  if (auth instanceof NextResponse) return auth;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });
  }

  // Demo mode: nothing real to poll.
  if (auth.demo) {
    return NextResponse.json({ ok: true, demo: true, status: "awaiting_next_action", paid: false });
  }

  // Verify the caller owns this payment (via the pending ledger row).
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("payments")
    .select("user_id, tier, status, seats, billing_period")
    .eq("provider", "paymongo")
    .eq("provider_ref", id)
    .maybeSingle();

  if (!row || row.user_id !== auth.userId) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const tier = row.tier as string | undefined;

  // Already settled by the webhook → report paid without re-polling PayMongo.
  if (row.status === "paid") {
    return NextResponse.json({ ok: true, status: "succeeded", paid: true, tier });
  }

  let status: string;
  try {
    ({ status } = await getPaymentIntentStatus(id));
  } catch (err) {
    console.error("qrph_status_failed:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "status_failed" }, { status: 502 });
  }

  const paid = status === "succeeded";
  if (paid && isSubscriptionTier(tier) && tier !== "free") {
    const seats = typeof row.seats === "number" ? row.seats : undefined;
    const period: BillingPeriod = isBillingPeriod(row.billing_period)
      ? row.billing_period
      : "monthly";
    try {
      await applyPaidUpgrade({
        userId: auth.userId,
        tier,
        providerRef: id,
        amount: computeSubscriptionAmountPhp(tier, seats ?? 0, period),
        seats,
        period,
      });
    } catch (err) {
      console.error("qrph_status_upgrade_failed:", (err as Error).message);
    }
  }

  return NextResponse.json({ ok: true, status, paid, tier });
}
