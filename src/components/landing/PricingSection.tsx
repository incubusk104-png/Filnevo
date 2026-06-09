"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { UpgradeButton } from "@/components/landing/UpgradeButton";
import type { SubscriptionTier } from "@/lib/ai/providers";
import {
  ANNUAL_MONTHS_CHARGED,
  TIERS,
  computeSubscriptionAmountPhp,
  type BillingPeriod,
} from "@/lib/tiers";

// Where "Contact sales" CTAs point. Agency Core (self-serve checkout removed)
// and the sales-led Team plans route here instead of the QR Ph checkout.
const SALES_EMAIL = "sales@filnevo.com";
const SALES_HREF = `mailto:${SALES_EMAIL}`;

function peso(n: number): string {
  return `₱${n.toLocaleString("en-PH")}`;
}

type Cta =
  | { kind: "checkout"; tier: SubscriptionTier; label: string }
  | { kind: "link"; href: string; label: string; variant?: "primary" | "outline" }
  | { kind: "sales"; label: string };

interface Plan {
  id: string;
  name: string;
  /** Real billing tier whose price is the source of truth, when self-serve. */
  tier?: SubscriptionTier;
  /** Static price (PHP/mo) for sales-led plans without a billing tier. */
  staticPricePhp?: number;
  /** Plans billed on request (Enterprise) show this instead of a number. */
  priceLabel?: string;
  meta: string[];
  features: string[];
  cta: Cta;
  highlight?: boolean;
  badge?: string;
}

const SOLO_PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tier: "free",
    meta: ["5 scans/mo"],
    features: ["Mobile doc capture", "BIR deadline widget", "Gemini Flash (free tier)"],
    cta: { kind: "link", href: "/login?mode=signup", label: "Start free", variant: "outline" },
  },
  {
    id: "starter",
    name: "Starter",
    tier: "starter",
    meta: ["50 scans/mo"],
    features: ["Auto-fill BIR view", "Digest email", "Accountant link", "Referral engine"],
    cta: { kind: "checkout", tier: "starter", label: "Get Starter" },
  },
  {
    id: "business_pro",
    name: "Business Pro",
    tier: "business_pro",
    badge: "Most popular",
    highlight: true,
    meta: ["500 scans/mo"],
    features: ["WhatsApp receipt bot", "Ad-spend predictor", "Anti-fraud flag", "Vault links"],
    cta: { kind: "checkout", tier: "business_pro", label: "Get Business Pro" },
  },
  {
    id: "agency_core",
    name: "Agency Core",
    tier: "agency_core",
    meta: ["5,000 scans/mo"],
    features: ["All Pro features", "Multi-workspace", "Team approvals", "BIR ZIP export + webhooks"],
    // Self-serve checkout removed — Agency Core is sales-led.
    cta: { kind: "sales", label: "Contact sales" },
  },
];

const TEAM_PLANS: Plan[] = [
  {
    id: "team_starter",
    name: "Team Starter",
    staticPricePhp: 799,
    meta: ["150 scans/mo", "Up to 3 seats"],
    features: ["All Starter features", "3 user seats", "Shared ledger view", "Admin role"],
    cta: { kind: "sales", label: "Contact sales" },
  },
  {
    id: "team_pro",
    name: "Team Pro",
    badge: "Best value",
    highlight: true,
    staticPricePhp: 1999,
    meta: ["1,500 scans/mo", "Up to 5 seats"],
    features: ["All Business Pro features", "5 user seats", "WhatsApp bot", "Anti-fraud flag"],
    cta: { kind: "sales", label: "Contact sales" },
  },
  {
    id: "agency_core_team",
    name: "Agency Core Team",
    staticPricePhp: 3999,
    meta: ["5,000 scans/mo", "Up to 10 seats"],
    features: ["All Agency features", "10 seats included", "Multi-workspace", "BIR ZIP + webhooks"],
    cta: { kind: "sales", label: "Contact sales" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom",
    meta: ["Unlimited", "Unlimited seats"],
    features: ["Custom scan volume", "Dedicated infra", "SLA + support", "White-label option"],
    cta: { kind: "sales", label: "Contact us" },
  },
];

interface PriceView {
  big: string;
  /** Suffix beside the price, e.g. "/mo" or "contact us". */
  suffix: string;
  /** Small line beneath the price (annual billing note). */
  note?: string;
}

// Resolve what a card shows for the chosen period. Real-tier prices come from
// tiers.ts (the same source the QR Ph checkout charges from) so the displayed
// figure can never drift from the amount billed. Annual shows the per-month
// equivalent (total / 12) plus the billed-annually note, matching TeamPlanCard.
function priceView(plan: Plan, period: BillingPeriod): PriceView {
  if (plan.priceLabel) return { big: plan.priceLabel, suffix: "contact us" };

  const monthly = plan.tier
    ? TIERS[plan.tier].pricePhp
    : (plan.staticPricePhp ?? 0);

  if (monthly === 0) return { big: "Free", suffix: "" };

  if (period === "monthly") {
    return { big: peso(monthly), suffix: "/mo" };
  }

  // Annual: total is the same 2-months-free math the checkout uses.
  const annualTotal = plan.tier
    ? computeSubscriptionAmountPhp(plan.tier, 1, "annual")
    : monthly * ANNUAL_MONTHS_CHARGED;
  const perMonth = Math.round(annualTotal / 12);
  return {
    big: peso(perMonth),
    suffix: "/mo",
    note: `${peso(annualTotal)} billed annually · 2 months free`,
  };
}

function CtaButton({ plan, period }: { plan: Plan; period: BillingPeriod }) {
  const { cta } = plan;
  if (cta.kind === "checkout") {
    return (
      <UpgradeButton tier={cta.tier} period={period} variant={plan.highlight ? "primary" : "outline"}>
        {cta.label}
      </UpgradeButton>
    );
  }
  if (cta.kind === "sales") {
    return (
      <Button variant="outline" href={SALES_HREF} className="w-full">
        {cta.label}
      </Button>
    );
  }
  return (
    <Button variant={cta.variant ?? "outline"} href={cta.href} className="w-full">
      {cta.label}
    </Button>
  );
}

function PlanCard({ plan, period }: { plan: Plan; period: BillingPeriod }) {
  const price = priceView(plan, period);
  return (
    <article
      className={`data-card flex flex-col p-6 ${
        plan.highlight
          ? "border border-velocity-blue/60 shadow-lg shadow-velocity-blue/15"
          : "border border-neutral-800/40"
      }`}
    >
      {/* Badge + name */}
      <div className="min-h-[1.75rem]">
        {plan.badge && (
          <span className="badge badge-info font-metrics">{plan.badge}</span>
        )}
      </div>
      <h3 className="mt-2 font-metrics text-lg font-semibold text-foreground">
        {plan.name}
      </h3>

      {/* Price */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-metrics text-4xl font-bold text-foreground">
          {price.big}
        </span>
        {price.suffix && (
          <span className="text-sm text-text-muted">{price.suffix}</span>
        )}
      </div>
      <p className="mt-1 min-h-[1rem] text-xs text-text-muted">{price.note ?? ""}</p>

      {/* Quota / seats */}
      <div className="mt-5 space-y-1 border-t border-neutral-800/40 pt-5">
        {plan.meta.map((m) => (
          <p key={m} className="font-metrics text-sm text-foreground">
            {m}
          </p>
        ))}
      </div>

      {/* Features */}
      <ul className="mt-5 flex-1 space-y-3 border-t border-neutral-800/40 pt-5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm text-text-muted">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-efficiency-green/60" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-6">
        <CtaButton plan={plan} period={period} />
      </div>
    </article>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 font-metrics text-xs font-semibold uppercase tracking-[0.18em] text-text-faint">
      {children}
    </h3>
  );
}

export default function PricingSection() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <section id="pricing" className="relative scroll-mt-20 py-20 lg:py-24 overflow-hidden">
      {/* Background - subtle metric chart pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><rect width=%2260%22 height=%2260%22 fill=%22none%22/><path d=%22M10 30 Q20 10 30 30 T50 30%22 stroke=%22%231e293b%22 stroke-width=%220.5%22 opacity=%220.06%22 fill=%22none%22/></svg>')]"/>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="eyebrow">Pricing</span>
          <h2 className="mt-5 font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Plans that scale with your <span className="gradient-text">filings</span>
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Flexible pricing for businesses of all sizes. Every plan includes our BIR compliance tools with progressive feature access.
          </p>
        </div>

        {/* Billing period toggle */}
        <div
          role="group"
          aria-label="Billing period"
          className="mb-12 inline-flex items-center rounded-lg border border-hairline bg-neutral-950/40 p-1"
        >
          {(["monthly", "annual"] as const).map((p) => {
            const active = period === p;
            return (
              <button
                key={p}
                type="button"
                aria-pressed={active}
                onClick={() => setPeriod(p)}
                className={`btn-anim press-effect relative rounded-md px-6 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-velocity-blue text-neutral-50 shadow-sm"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                {p === "monthly" ? "Monthly" : "Annual"}
              </button>
            );
          })}
        </div>

        {/* SOLO PLANS */}
        <SectionLabel>Solo Plans</SectionLabel>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SOLO_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} period={period} />
          ))}
        </div>

        {/* TEAM PLANS */}
        <div className="mt-14">
          <SectionLabel>Team Plans</SectionLabel>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM_PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} period={period} />
            ))}
          </div>
        </div>

        {/* Footnotes */}
        <p className="mt-10 text-sm text-text-muted">
          Switch to annual to save ~16%. · Rate-lock protects you from future price increases. ·
          {" "}Agency overage: ₱0.50/scan beyond quota. · Enterprise pricing available on request.
        </p>
      </div>
    </section>
  );
}
