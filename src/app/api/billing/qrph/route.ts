import { NextResponse, type NextRequest } from "next/server";
import { resolveBillingUser } from "@/lib/billing/auth";
import { createQrphPayment } from "@/lib/billing/paymongo";
import { createAdminClient } from "@/lib/supabase/admin";
import { TIERS, isSubscriptionTier } from "@/lib/tiers";
import { verifyTurnstile } from "@/lib/captcha/turnstile";

// Required by @cloudflare/next-on-pages: every non-static route runs on Edge.
export const runtime = "edge";

interface QrphBody {
  tier?: string;
  captcha_token?: string;
}

// POST /api/billing/qrph
// Cookie-authed. Generates a dynamic QR Ph code for the chosen (paid) tier via
// PayMongo and returns the QR image (base64 data URI) + amount + expiry. The
// payment intent metadata carries user_id + tier so the webhook can attribute
// payment; a pending ledger row is written so the status poll can recover
// attribution and so the payment is traceable before confirmation.
export async function POST(req: NextRequest) {
  const auth = await resolveBillingUser(req);
  if (auth instanceof NextResponse) return auth;

  let body: QrphBody;
  try {
    body = (await req.json()) as QrphBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Human-verification gate (Cloudflare Turnstile). No-ops in demo mode.
  const captchaOk = await verifyTurnstile(
    body.captcha_token,
    req.headers.get("cf-connecting-ip"),
  );
  if (!captchaOk) {
    return NextResponse.json({ ok: false, error: "captcha_failed" }, { status: 400 });
  }

  const tier = body.tier;
  if (!isSubscriptionTier(tier)) {
    return NextResponse.json({ ok: false, error: "invalid_tier" }, { status: 400 });
  }
  if (tier === "free") {
    return NextResponse.json({ ok: false, error: "free_tier_not_billable" }, { status: 400 });
  }

  let qr;
  try {
    qr = await createQrphPayment({ tier, userId: auth.userId, email: auth.email });
  } catch (err) {
    console.error("qrph_create_failed:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "qrph_create_failed" }, { status: 502 });
  }

  // Pending ledger row (production only) — keyed by the payment intent id so the
  // webhook / status poll can recover the buyer + tier on confirmation.
  if (!auth.demo) {
    try {
      const admin = createAdminClient();
      await admin.from("payments").upsert(
        {
          user_id: auth.userId,
          provider: "paymongo",
          provider_ref: qr.paymentIntentId,
          amount: TIERS[tier].pricePhp,
          currency: "PHP",
          status: "pending",
          tier,
        },
        { onConflict: "provider,provider_ref" },
      );
    } catch (err) {
      console.error("qrph_payment_record_failed:", (err as Error).message);
    }
  }

  return NextResponse.json({
    ok: true,
    demo: qr.demo,
    payment_intent_id: qr.paymentIntentId,
    qr_image_url: qr.qrImageUrl,
    amount: qr.amount,
    tier,
    expires_at: qr.expiresAt,
  });
}
