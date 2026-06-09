"use client";

import { useState } from "react";
import { UpgradeButton } from "@/components/landing/UpgradeButton";
import {
  ANNUAL_MONTHS_CHARGED,
  MAX_SEATS,
  TIERS,
  clampSeats,
  computeSubscriptionAmountPhp,
  type BillingPeriod,
} from "@/lib/tiers";

const TIER = "agency_core_team" as const;
const META = TIERS[TIER];

const FEATURES = [
  "10,000 Document Scans/month (shared team pool)",
  "Everything in Agency Core, for your whole team",
  "Expandable seats — add teammates as you grow",
  "Per-seat roles & workspace assignment",
  "Overage metering at ₱0.50/scan (capped at ₱2,000)",
  "Priority support & onboarding",
];

function peso(n: number): string {
  return `₱${n.toLocaleString("en-PH")}`;
}

// Featured, full-width team plan card with a billing-period toggle and a seat
// selector. Price is computed from the single source of truth in tiers.ts so it
// can never drift from what checkout charges; the chosen seats + period flow
// into the QR Ph checkout (and on to `payments.seats` / `billing_period`).
export function TeamPlanCard() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [seats, setSeats] = useState<number>(META.baseSeats);

  const setSeatsSafe = (next: number) => setSeats(clampSeats(TIER, next));

  const total = computeSubscriptionAmountPhp(TIER, seats, period);
  // Equivalent monthly figure for the annual plan (total / 12) so buyers can
  // compare against the monthly price at a glance.
  const perMonthEquivalent =
    period === "annual" ? Math.round(total / 12) : total;
  const extraSeats = Math.max(0, seats - META.baseSeats);
  const atMin = seats <= META.baseSeats;
  const atMax = seats >= MAX_SEATS;

  return (
    <article
      data-testid="team-plan-card"
      className="data-card relative mt-10 overflow-hidden border border-velocity-blue/40 p-8 lg:p-10"
    >
      <div className="pointer-events-none absolute right-6 top-6">
        <span className="rounded-full border border-velocity-blue/40 bg-velocity-blue/10 px-3 py-1 font-metrics text-xs font-semibold text-velocity-blue">
          Most flexible
        </span>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        {/* Left: identity + features */}
        <div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-velocity-blue/10">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="2.5" stroke="%232563eb" strokeWidth="1.5" />
                <circle cx="14" cy="8" r="2" stroke="%232563eb" strokeWidth="1.5" />
                <path d="M2.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M12 16c0-1.8 1.2-3.2 3-3.5" stroke="%232563eb" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="font-metrics text-xl font-semibold text-velocity-blue">
                {META.label}
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                For growing agencies that need to add teammates as they scale —
                {" "}
                {META.baseSeats} seats included, expand any time.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3 text-text-muted">
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-efficiency-green/60" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: configurator */}
        <div className="rounded-xl border border-hairline bg-neutral-900/30 p-6">
          {/* Billing period toggle */}
          <div
            role="group"
            aria-label="Billing period"
            className="flex items-center rounded-lg border border-hairline bg-neutral-950/40 p-1"
          >
            {(["monthly", "annual"] as const).map((p) => {
              const active = period === p;
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPeriod(p)}
                  className={`btn-anim relative flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-velocity-blue text-neutral-50 shadow-sm"
                      : "text-text-muted hover:text-foreground"
                  }`}
                >
                  {p === "monthly" ? "Monthly" : "Annual"}
                  {p === "annual" && (
                    <span className="ml-1.5 text-xs text-efficiency-green">
                      2 mo free
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Seat selector */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="font-metrics text-sm font-medium text-foreground">
                Team seats
              </label>
              <span className="text-xs text-text-muted">
                {META.baseSeats} included · {peso(META.pricePerExtraSeatPhp)}/seat/mo extra
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                aria-label="Remove a seat"
                onClick={() => setSeatsSafe(seats - 1)}
                disabled={atMin}
                className="btn-anim press-effect flex h-11 w-11 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900/40 text-lg text-foreground transition-all duration-200 hover:border-velocity-blue/50 disabled:opacity-40 disabled:hover:border-neutral-700"
              >
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                aria-label="Number of team seats"
                min={META.baseSeats}
                max={MAX_SEATS}
                value={seats}
                onChange={(e) => setSeatsSafe(Number(e.target.value))}
                className="h-11 w-20 rounded-md border border-neutral-700 bg-neutral-950/40 text-center font-metrics text-lg text-foreground outline-none focus:border-velocity-blue/60"
              />
              <button
                type="button"
                aria-label="Add a seat"
                onClick={() => setSeatsSafe(seats + 1)}
                disabled={atMax}
                className="btn-anim press-effect flex h-11 w-11 items-center justify-center rounded-md border border-neutral-700 bg-neutral-900/40 text-lg text-foreground transition-all duration-200 hover:border-velocity-blue/50 disabled:opacity-40 disabled:hover:border-neutral-700"
              >
                +
              </button>
              <span className="ml-1 text-sm text-text-muted">
                {seats} seats
                {extraSeats > 0 ? ` (+${extraSeats} extra)` : ""}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mt-6 border-t border-neutral-800/40 pt-5">
            <div className="flex items-baseline gap-2">
              <span
                data-testid="team-plan-price"
                className="font-metrics text-3xl font-bold text-foreground"
              >
                {peso(total)}
              </span>
              <span className="text-sm text-text-muted">
                {period === "annual" ? "/ year" : "/ month"}
              </span>
            </div>
            {period === "annual" && (
              <p className="mt-1 text-xs text-text-muted">
                ≈ {peso(perMonthEquivalent)}/mo · billed annually
                {" "}({ANNUAL_MONTHS_CHARGED} months — 2 free)
              </p>
            )}
            {extraSeats > 0 && (
              <p className="mt-1 text-xs text-text-muted">
                {peso(META.pricePhp)} base + {extraSeats} ×{" "}
                {peso(META.pricePerExtraSeatPhp)}
                {period === "annual" ? " × 10" : ""}
              </p>
            )}
          </div>

          <div className="mt-5">
            <UpgradeButton tier={TIER} seats={seats} period={period} variant="primary">
              Get {META.label}
            </UpgradeButton>
          </div>
        </div>
      </div>
    </article>
  );
}
