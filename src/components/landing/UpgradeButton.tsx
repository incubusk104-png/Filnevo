"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import type { SubscriptionTier } from "@/lib/ai/providers";
import {
  createClient,
  isSupabaseConfiguredClient,
} from "@/lib/supabase/client";

interface UpgradeButtonProps {
  tier: SubscriptionTier;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "secondary";
}

// Sends the customer toward the QR Ph payment page for `tier`. Visitors who
// aren't signed in are routed to /login first (carrying a `next` back to this
// plan) so payment is never shown pre-auth — regardless of Google or email
// sign in. The pay page re-checks auth too, so this is purely to avoid a flash
// of the payment screen before the redirect.
export function UpgradeButton({ tier, children, variant = "primary" }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function startPayment() {
    setLoading(true);
    const payUrl = `/billing/pay?tier=${tier}`;

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
