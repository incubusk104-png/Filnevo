"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import type { SubscriptionTier } from "@/lib/ai/providers";

interface UpgradeButtonProps {
  tier: SubscriptionTier;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "secondary";
}

// Sends the customer to the QR Ph payment page for `tier`. That page generates
// a PayMongo QR code to pay from GCash / Maya; unauthenticated callers are
// redirected to /login from there.
export function UpgradeButton({ tier, children, variant = "primary" }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  function startPayment() {
    setLoading(true);
    window.location.href = `/billing/pay?tier=${tier}`;
  }

  return (
    <Button
      variant={variant}
      onClick={startPayment}
      disabled={loading}
      className="w-full"
    >
      {loading ? "Opening…" : children}
    </Button>
  );
}
