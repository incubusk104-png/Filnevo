"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import type { SubscriptionTier } from "@/lib/ai/providers";
import type { BillingPeriod } from "@/lib/tiers";
import {
  createClient,
  isSupabaseConfiguredClient,
} from "@/lib/supabase/client";

interface UpgradeButtonProps {
  tier: SubscriptionTier;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "secondary";
  /** Seats to purchase (team tier). Carried into checkout as `?seats=`. */
  seats?: number;
  /** Billing period. Carried into checkout as `?period=`. */
  period?: BillingPeriod;
}

// Sends the customer toward the QR Ph payment page for `tier`. Visitors who
// aren't signed in are routed to /login first (carrying a `next` back to this
// plan) so payment is never shown pre-auth — regardless of Google or email
// sign in. The pay page re-checks auth too, so this is purely to avoid a flash
// of the payment screen before the redirect.
export function UpgradeButton({ tier, children, variant = "primary", seats, period }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function startPayment() {
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
    <div>
      <Button variant={variant} onClick={startPayment} disabled={loading}>
        {loading ? "Opening…" : children}
      </Button>
    </div>
  );
}
