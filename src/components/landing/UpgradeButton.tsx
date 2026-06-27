"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import type { SubscriptionTier } from "@/lib/ai/providers";
import type { BillingPeriod } from "@/lib/tiers";
import {
  createClient,
  isSupabaseConfiguredClient,
} from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/mode";

interface UpgradeButtonProps {
  tier: SubscriptionTier;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "secondary";
  /** Seats to purchase (team tier). Carried into checkout as `?seats=`. */
  seats?: number;
  /** Billing period. Carried into checkout as `?period=`. */
  period?: BillingPeriod;
  /** Extra classes forwarded to the underlying Button (e.g. `w-full`). */
  className?: string;
}

// Sends the customer toward the QR Ph payment page for `tier`. Visitors who
// aren't signed in are routed to /login first (carrying a `next` back to this
// plan) so payment is never shown pre-auth — regardless of Google or email
// sign in. The pay page re-checks auth too, so this is purely to avoid a flash
// of the payment screen before the redirect.
export function UpgradeButton({ tier, children, variant = "primary", seats, period, className = "" }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function startPayment() {
    // In demo mode, we always go to the dashboard if a mock session is intended.
    if (isDemoMode()) {
      window.location.href = "/dashboard";
      return;
    }

    // Free tier doesn't go to payment; it goes to the dashboard if signed in,
    // or signup if guest.
    if (tier === "free") {
      if (isSupabaseConfiguredClient()) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          window.location.href = "/dashboard";
          return;
        }
      }
      window.location.href = "/login?mode=signup";
      return;
    }

    setLoading(true);
    const qs = new URLSearchParams({ tier });
    if (seats !== undefined) qs.set("seats", String(seats));
    if (period !== undefined) qs.set("period", period);
    const payUrl = `/billing/pay?${qs.toString()}`;

    if (isSupabaseConfiguredClient()) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = `/login?mode=signin&next=${encodeURIComponent(payUrl)}`;
        return;
      }
    }

    window.location.href = payUrl;
  }

  return (
    <Button variant={variant} onClick={startPayment} disabled={loading} className={className}>
      {loading ? "Opening…" : children}
    </Button>
  );
}
