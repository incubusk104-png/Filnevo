"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { QrPayment } from "./QrPayment";
import { Logo } from "@/components/shared/Logo";
import { TIERS, clampSeats, isBillingPeriod, isSubscriptionTier, type BillingPeriod } from "@/lib/tiers";
import {
  createClient,
  isSupabaseConfiguredClient,
} from "@/lib/supabase/client";

type AuthStatus = "checking" | "authed" | "guest";

// Reads `?tier=` client-side so the page stays static (no Edge function),
// keeping the Cloudflare Pages Worker bundle small. The QR itself is created by
// the `/api/billing/qrph` Edge route invoked from `QrPayment`.
export function PayContent() {
  const params = useSearchParams();
  const rawTier = params.get("tier") ?? undefined;
  // Narrow to a real, billable tier (type guard) so `QrPayment` gets a typed
  // `SubscriptionTier` rather than a loose string.
  const tier =
    isSubscriptionTier(rawTier) && rawTier !== "free" ? rawTier : null;
  const valid = tier !== null;

  // Seats/period ride along for the team tier. Seats are clamped to the tier's
  // valid range; period defaults to monthly. The qrph route re-validates both
  // server-side, so this is just for a correct preview + request payload.
  const rawSeats = params.get("seats");
  const seats = tier ? clampSeats(tier, Number(rawSeats ?? TIERS[tier].baseSeats)) : 1;
  const periodParam = params.get("period");
  const period: BillingPeriod = isBillingPeriod(periodParam) ? periodParam : "monthly";

  // Auth gate: payment (and the QR) must never be shown to a visitor who isn't
  // signed in. We resolve the Supabase session in the browser and, if there's
  // no user, bounce to the login screen carrying a `next` back to this exact
  // plan so they return here automatically after Google or email sign in.
  // (The `/api/billing/qrph` route is also cookie-authed server-side, so this
  // is defence-in-depth rather than the only line of protection.)
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    if (!valid) return;

    // Demo mode (no Supabase) has no real sessions to check; let the flow run
    // so local/demo previews still work. In production this branch is inactive.
    if (!isSupabaseConfiguredClient()) {
      setAuthStatus("authed");
      return;
    }

    let active = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data.user) {
        setAuthStatus("authed");
        return;
      }
      setAuthStatus("guest");
      const nextQs = new URLSearchParams({ tier: tier ?? "" });
      if (rawSeats) nextQs.set("seats", String(seats));
      nextQs.set("period", period);
      const next = `/billing/pay?${nextQs.toString()}`;
      window.location.replace(
        `/login?mode=signin&next=${encodeURIComponent(next)}`,
      );
    });

    return () => {
      active = false;
    };
  }, [valid, tier]);

  return (
    <main className="min-h-screen px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Filnevo home">
            <Logo />
          </Link>
        </div>

        {!valid ? (
          <div className="data-card border border-hairline p-8 text-center">
            <h1 className="font-heading text-xl font-bold text-foreground">
              Choose a plan first
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              We couldn&apos;t tell which plan you want to pay for.
            </p>
            <Link
              href="/#pricing"
              className="btn-anim press-effect mt-6 inline-block rounded-md bg-velocity-blue px-4 py-2 text-sm font-medium text-neutral-50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-velocity-blue/90 hover:shadow-lg hover:shadow-velocity-blue/30"
            >
              View plans
            </Link>
          </div>
        ) : authStatus === "authed" && tier ? (
          <QrPayment tier={tier} label={TIERS[tier].label} seats={seats} period={period} />
        ) : (
          // "checking" or "guest" (mid-redirect) — never reveal the QR here.
          <div className="data-card flex flex-col items-center gap-3 border border-hairline p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-velocity-blue" />
            <p className="font-body text-sm text-text-muted">
              {authStatus === "guest"
                ? "Please sign in to continue to payment…"
                : "Confirming your session…"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
