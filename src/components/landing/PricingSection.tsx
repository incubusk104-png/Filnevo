"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { UpgradeButton } from "@/components/landing/UpgradeButton";
import type { SubscriptionTier } from "@/lib/ai/providers";
import {
  TIERS,
  computeSubscriptionAmountPhp,
  type BillingPeriod,
} from "@/lib/tiers";

// Enterprise has no fixed price — it's the only plan that routes to sales.
const SALES_EMAIL = "sales@filnevo.com";
const SALES_HREF = `mailto:${SALES_EMAIL}`;

function peso(n: number): string {
  return `₱${n.toLocaleString("en-PH")}`;
}

type PlanView = "solo" | "team";

type Cta =
  | { kind: "checkout"; tier: SubscriptionTier; label: string }
  | { kind: "link"; href: string; label: string }
  | { kind: "sales"; label: string };

interface Plan {
  id: string;
  name: string;
  /** Real billing tier — its price/quota drive the card (no drift). */
  tier?: SubscriptionTier;
  /** Shown instead of a price for sales-led plans (Enterprise). */
  priceLabel?: string;
  /** Extra meta line(s) beyond the auto-derived "N scans/mo" (e.g. seats). */
  extraMeta?: string[];
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
    features: ["Mobile doc capture", "BIR deadline widget", "Gemini Flash (free tier)"],
    cta: { kind: "link", href: "/login?mode=signup", label: "Start free" },
  },
  {
    id: "starter",
    name: "Starter",
    tier: "starter",
    features: ["Auto-fill BIR view", "Digest email", "Accountant link", "Referral engine"],
    cta: { kind: "checkout", tier: "starter", label: "Get Starter" },
  },
  {
    id: "business_pro",
    name: "Business Pro",
    tier: "business_pro",
    badge: "Most popular",
    highlight: true,
    features: ["WhatsApp receipt bot", "Ad-spend predictor", "Anti-fraud flag", "Vault links"],
    cta: { kind: "checkout", tier: "business_pro", label: "Get Business Pro" },
  },
  {
    id: "agency_core",
    name: "Agency Core",
    tier: "agency_core",
    extraMeta: ["5 seats"],
    features: ["All Pro features", "Multi-workspace", "Team approvals", "BIR ZIP export + webhooks"],
    cta: { kind: "checkout", tier: "agency_core", label: "Get Agency Core" },
  },
];

const TEAM_PLANS: Plan[] = [
  {
    id: "team_starter",
    name: "Team Starter",
    tier: "team_starter",
    extraMeta: ["Up to 3 seats"],
    features: ["All Starter features", "3 user seats", "Shared ledger view", "Admin role"],
    cta: { kind: "checkout", tier: "team_starter", label: "Get Team Starter" },
  },
  {
    id: "team_pro",
    name: "Team Pro",
    tier: "team_pro",
    badge: "Best value",
    highlight: true,
    extraMeta: ["Up to 5 seats"],
    features: ["All Business Pro features", "5 user seats", "WhatsApp bot", "Anti-fraud flag"],
    cta: { kind: "checkout", tier: "team_pro", label: "Get Team Pro" },
  },
  {
    id: "agency_core_team",
    name: "Agency Core Team",
    tier: "agency_core_team",
    extraMeta: ["5+ seats (expandable)"],
    features: ["All Agency features", "Expandable seats", "Multi-workspace", "BIR ZIP + webhooks"],
    cta: { kind: "checkout", tier: "agency_core_team", label: "Get Agency Core Team" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom",
    extraMeta: ["Unlimited", "Unlimited seats"],
    features: ["Custom scan volume", "Dedicated infra", "SLA + support", "White-label option"],
    cta: { kind: "sales", label: "Contact us" },
  },
];

interface PriceView {
  big: string;
  suffix: string;
  note?: string;
}

// Real-tier prices come from tiers.ts (the same source the QR Ph checkout
// charges from) so the displayed figure can never drift from the amount billed.
// Annual shows the per-month equivalent (total / 12) + the billed-annually note.
function priceView(plan: Plan, period: BillingPeriod): PriceView {
  if (plan.priceLabel) return { big: plan.priceLabel, suffix: "contact us" };

  const monthly = plan.tier ? TIERS[plan.tier].pricePhp : 0;
  if (monthly === 0) return { big: "Free", suffix: "" };

  if (period === "monthly") return { big: peso(monthly), suffix: "/mo" };

  const annualTotal = computeSubscriptionAmountPhp(plan.tier!, 1, "annual");
  const perMonth = Math.round(annualTotal / 12);
  return {
    big: peso(perMonth),
    suffix: "/mo",
    note: `${peso(annualTotal)} billed annually · 2 months free`,
  };
}

function metaLines(plan: Plan): string[] {
  const scans = plan.tier
    ? `${TIERS[plan.tier].monthlyScanQuota.toLocaleString("en-PH")} scans/mo`
    : null;
  return [scans, ...(plan.extraMeta ?? [])].filter((x): x is string => Boolean(x));
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
  const href = cta.kind === "sales" ? SALES_HREF : cta.href;
  return (
    <Button variant="outline" href={href} className="w-full">
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
      <div className="min-h-[1.75rem]">
        {plan.badge && <span className="badge badge-info font-metrics">{plan.badge}</span>}
      </div>
      <h3 className="mt-2 font-metrics text-lg font-semibold text-foreground">{plan.name}</h3>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-metrics text-4xl font-bold text-foreground">{price.big}</span>
        {price.suffix && <span className="text-sm text-text-muted">{price.suffix}</span>}
      </div>
      <p className="mt-1 min-h-[1rem] text-xs text-text-muted">{price.note ?? ""}</p>

      <div className="mt-5 space-y-1 border-t border-neutral-800/40 pt-5">
        {metaLines(plan).map((m) => (
          <p key={m} className="font-metrics text-sm text-foreground">{m}</p>
        ))}
      </div>

      <ul className="mt-5 flex-1 space-y-3 border-t border-neutral-800/40 pt-5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm text-text-muted">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-efficiency-green/60" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <CtaButton plan={plan} period={period} />
      </div>
    </article>
  );
}

interface SegOption<T extends string> {
  value: T;
  label: string;
}

function SegToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center rounded-lg border border-hairline bg-neutral-950/40 p-1"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`btn-anim press-effect relative rounded-md px-6 py-2 text-sm font-medium transition-all duration-200 ${
              active ? "bg-velocity-blue text-neutral-50 shadow-sm" : "text-text-muted hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function PricingSection() {
  const [view, setView] = useState<PlanView>("solo");
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  const plans = view === "solo" ? SOLO_PLANS : TEAM_PLANS;

  return (
    <section id="pricing" className="relative scroll-mt-20 py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><rect width=%2260%22 height=%2260%22 fill=%22none%22/><path d=%22M10 30 Q20 10 30 30 T50 30%22 stroke=%22%231e293b%22 stroke-width=%220.5%22 opacity=%220.06%22 fill=%22none%22/></svg>')]"/>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="eyebrow">Pricing</span>
          <h2 className="mt-5 font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Plans that scale with your <span className="gradient-text">filings</span>
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Flexible pricing for businesses of all sizes. Every plan includes our BIR compliance tools with progressive feature access.
          </p>
        </div>

        {/* Toggles */}
        <div className="mb-12 flex flex-col items-center gap-4">
          <SegToggle<PlanView>
            ariaLabel="Plan type"
            value={view}
            onChange={setView}
            options={[
              { value: "solo", label: "Solo" },
              { value: "team", label: "Team" },
            ]}
          />
          <SegToggle<BillingPeriod>
            ariaLabel="Billing period"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "annual", label: "Annual" },
            ]}
          />
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} period={period} />
          ))}
        </div>

        {/* Footnotes */}
        <p className="mt-10 text-center text-sm text-text-muted">
          Switch to annual to save ~16%. · Rate-lock protects you from future price increases. ·
          {" "}Agency overage: ₱0.50/scan beyond quota. · Enterprise pricing available on request.
        </p>
      </div>
    </section>
  );
}
