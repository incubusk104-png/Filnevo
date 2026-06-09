import { NextResponse, type NextRequest } from "next/server";
import {
  isPaymongoWebhookConfigured,
  parseWebhookEvent,
  verifyWebhookSignature,
} from "@/lib/billing/paymongo";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyPaidUpgrade } from "@/lib/billing/upgrade";
import { isDemoMode } from "@/lib/mode";
import { clampSeats, isBillingPeriod, isSubscriptionTier, type BillingPeriod } from "@/lib/tiers";

// Required by @cloudflare/next-on-pages: every non-static route runs on Edge.
export const runtime = "edge";

// POST /api/billing/webhook
// PayMongo delivers events here. We verify the `Paymongo-Signature` HMAC, and on
// `payment.paid` upgrade the buyer: set subscription_tier, monthly_scan_quota
// (tier default), subscription_status=active and the new billing period.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 1. Verify signature (skipped only in demo when no secret is configured).
  if (isPaymongoWebhookConfigured()) {
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET as string;
    const signature = req.headers.get("paymongo-signature");
    const valid = await verifyWebhookSignature(rawBody, signature, secret);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "invalid_signature" },
        { status: 401 },
      );
    }
  }

  // 2. Parse the event.
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const event = parseWebhookEvent(payload);

  // We only act on successful payments. Acknowledge everything else (200) so
  // PayMongo does not retry unrelated events.
  if (event.type !== "payment.paid") {
    return NextResponse.json({ ok: true, ignored: event.type || "unknown" });
  }

  // Idempotency key / attribution anchor — QR Ph payments carry a payment
  // intent id, hosted checkout carries a checkout session id.
  const providerRef =
    event.checkoutSessionId ??
    event.paymentIntentId ??
    event.paymentId ??
    `evt_${Date.now()}`;
  const amount = typeof event.amount === "number" ? event.amount / 100 : undefined;

  // Demo mode (no Supabase): acknowledge without DB writes so the path is
  // exercisable without a backend.
  if (isDemoMode()) {
    return NextResponse.json({
      ok: true,
      demo: true,
      tier: event.metadata.tier,
      user_id: event.metadata.user_id,
    });
  }

  // Resolve buyer + tier. QR Ph payments may not echo metadata on the payment,
  // so fall back to the pending ledger row keyed by provider_ref (written at
  // checkout/QR creation).
  let userId = event.metadata.user_id;
  let tier: string | undefined = event.metadata.tier;
  // Seats/period prefer the PayMongo metadata, falling back to the pending row.
  let seats: number | undefined =
    event.metadata.seats !== undefined ? Number(event.metadata.seats) : undefined;
  let period: BillingPeriod | undefined = isBillingPeriod(event.metadata.period)
    ? event.metadata.period
    : undefined;
  if (!userId || !isSubscriptionTier(tier) || seats === undefined || period === undefined) {
    const admin = createAdminClient();
    const { data: pending } = await admin
      .from("payments")
      .select("user_id, tier, seats, billing_period")
      .eq("provider", "paymongo")
      .eq("provider_ref", providerRef)
      .maybeSingle();
    if (pending) {
      userId = userId ?? (pending.user_id as string | undefined);
      tier = isSubscriptionTier(tier) ? tier : (pending.tier as string | undefined);
      if (seats === undefined && typeof pending.seats === "number") seats = pending.seats;
      if (period === undefined && isBillingPeriod(pending.billing_period)) period = pending.billing_period;
    }
  }

  if (!userId || !isSubscriptionTier(tier) || tier === "free") {
    return NextResponse.json(
      { ok: false, error: "invalid_metadata" },
      { status: 400 },
    );
  }

  const finalSeats =
    seats !== undefined && Number.isFinite(seats) ? clampSeats(tier, seats) : undefined;
  const finalPeriod: BillingPeriod = period ?? "monthly";

  // Upgrade the user + settle the ledger (idempotent on provider_ref).
  let periodEnd: string;
  try {
    ({ periodEnd } = await applyPaidUpgrade({
      userId,
      tier,
      providerRef,
      amount,
      seats: finalSeats,
      period: finalPeriod,
    }));
  } catch (err) {
    console.error("webhook_upgrade_failed:", (err as Error).message);
    return NextResponse.json(
      { ok: false, error: "profile_update_failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, tier, current_period_end: periodEnd });
}
