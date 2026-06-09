"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { TIERS, clampSeats, isBillingPeriod, isSubscriptionTier } from "@/lib/tiers";

// Reads the PayMongo redirect params client-side so the page stays static
// (no Edge function), keeping the Cloudflare Pages Worker bundle small.
export function SuccessContent() {
  const params = useSearchParams();
  const tier = params.get("tier") ?? undefined;
  const demo = params.get("demo") ?? undefined;
  const meta = isSubscriptionTier(tier) ? TIERS[tier] : null;
  const rawSeats = params.get("seats");
  const seats =
    isSubscriptionTier(tier) && rawSeats ? clampSeats(tier, Number(rawSeats)) : null;
  const periodParam = params.get("period");
  const period = isBillingPeriod(periodParam) ? periodParam : null;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="data-card max-w-md w-full p-10 text-center border border-efficiency-green/30">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-efficiency-green/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground mb-3">
          {meta ? `Welcome to ${meta.label}` : "Payment received"}
        </h1>
        <p className="text-text-muted mb-2">
          {meta
            ? `Your ${meta.label} subscription is being activated — ${meta.monthlyScanQuota.toLocaleString()} document scans/month.`
            : "Thanks! Your subscription is being activated."}
        </p>
        {meta?.seatsExpandable && seats !== null && (
          <p className="text-text-muted mb-2 text-sm">
            {seats} team seats{period ? ` · ${period === "annual" ? "annual" : "monthly"} billing` : ""}.
          </p>
        )}
        {demo === "1" && (
          <p className="text-xs text-warning-amber mb-6">
            Demo mode: no real payment was charged.
          </p>
        )}
        <div className="mt-6">
          <Button variant="primary" href="/">
            Go to dashboard
          </Button>
        </div>
        <p className="mt-4 text-xs text-text-muted">
          Questions? <Link href="/#pricing" className="underline">View plans</Link>
        </p>
      </div>
    </main>
  );
}
