import { NextResponse, type NextRequest } from "next/server";
import { resolveBillingUser } from "@/lib/billing/auth";
import { appBaseUrl, createCheckoutSession } from "@/lib/billing/paymongo";
import { createAdminClient } from "@/lib/supabase/admin";
import { TIERS, isSubscriptionTier } from "@/lib/tiers";

// Required by @cloudflare/next-on-pages: every non-static route runs on Edge.
export const runtime = "edge";

interface CheckoutBody {
  tier?: string;
}

// POST /api/billing/checkout
// Cookie-authed. Creates a PayMongo Checkout Session for the chosen (paid) tier
// and returns the hosted `checkout_url` for the client to redirect to. The
// session metadata carries user_id + tier so the webhook can attribute payment.
export async function POST(req: NextRequest) {
  const auth = await resolveBillingUser(req);
  if (auth instanceof NextResponse) return auth;

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const tier = body.tier;
  if (!isSubscriptionTier(tier)) {
    return NextResponse.json({ ok: false, error: "invalid_tier" }, { status: 400 });
  }
  if (tier === "free") {
    // Free needs no checkout — there is nothing to charge.
    return NextResponse.json({ ok: false, error: "free_tier_not_billable" }, { status: 400 });
  }

  let session;
  try {
    session = await createCheckoutSession({
      tier,
      userId: auth.userId,
      email: auth.email,
      // Resolve the live origin from the request so deployed checkouts return
      // to the real site instead of localhost when APP_URL is unset.
      baseUrl: appBaseUrl(req.headers),
    });
  } catch (err) {
    console.error("checkout_create_failed:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "checkout_create_failed" }, { status: 502 });
  }

  // Record a pending ledger row in production so the payment is traceable even
  // before the webhook lands. Best-effort: the webhook upserts by provider_ref,
  // so a failure here is non-fatal.
  if (!auth.demo) {
    try {
      const admin = createAdminClient();
      await admin.from("payments").upsert(
        {
          user_id: auth.userId,
          provider: "paymongo",
          provider_ref: session.id,
          amount: TIERS[tier].pricePhp,
          currency: "PHP",
          status: "pending",
          tier,
        },
        { onConflict: "provider,provider_ref" },
      );
    } catch (err) {
      console.error("payment_record_failed:", (err as Error).message);
    }
  }

  return NextResponse.json({
    ok: true,
    demo: session.demo,
    checkout_url: session.checkoutUrl,
    session_id: session.id,
  });
}
