"use client";

import { useState } from "react";
import { FileText, BadgeCheck, Gauge, Lock, LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { MetricCard } from "./MetricCard";
import { QuotaBar } from "./QuotaBar";
import { TenantIsolationCard } from "./TenantIsolationCard";
import { TransactionalLedger } from "./TransactionalLedger";
import { StatusBadge } from "./StatusBadge";
import type { AlertState } from "./BentoCard";
import {
  DEMO_LEDGER,
  DEMO_METRICS,
  DEMO_QUOTA,
  DEMO_TENANT,
  DEMO_TENANT_ID,
  type LedgerEntry,
  type TenantSnapshot,
  type VaultMetrics,
} from "@/lib/vault-data";

const FRAME_ALERT: Record<AlertState, string> = {
  active: "ring-emerald/30",
  warning: "ring-amber/50",
  breach: "ring-ruby/70 animate-ruby",
};

export function VaultDashboard({
  metrics = DEMO_METRICS,
  ledger = DEMO_LEDGER,
  tenant = DEMO_TENANT,
  quota = DEMO_QUOTA,
  tenantId = DEMO_TENANT_ID,
  email = null,
  live = false,
}: {
  metrics?: VaultMetrics;
  ledger?: LedgerEntry[];
  tenant?: TenantSnapshot;
  quota?: { used: number; limit: number };
  tenantId?: string;
  email?: string | null;
  live?: boolean;
}) {
  const [alert, setAlert] = useState<AlertState>("active");

  return (
    <main className="min-h-dvh px-4 py-8 sm:px-8 lg:px-12">
      <div
        className={`mx-auto max-w-7xl rounded-3xl p-1 ring-1 transition-all duration-500 ${FRAME_ALERT[alert]}`}
      >
        <div className="rounded-[1.4rem] bg-obsidian-700/40 p-4 sm:p-6">
          {/* Header / Nav */}
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-ledger text-[11px] uppercase tracking-[0.32em] text-gold/80">
                Caveat · Triple-Lock Vault {live ? "· LIVE" : "· DEMO"}
              </p>
              <h1 className="font-serif-display text-3xl text-ink text-glow-gold sm:text-4xl">
                Security Console
              </h1>
              {email && (
                <p className="mt-1 font-ledger text-[11px] text-ink-faint">
                  {email}
                </p>
              )}
            </div>
            <nav className="flex flex-wrap items-center gap-2">
              <StatusBadge level="L1">L1 · Edge Limiter</StatusBadge>
              <StatusBadge level="L2">L2 · Quota Lock</StatusBadge>
              <StatusBadge level="L3">L3 · RLS</StatusBadge>
              {live && (
                <form action={signOut}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1 font-ledger text-[11px] uppercase tracking-[0.18em] text-ink-dim transition-colors hover:border-ruby/50 hover:text-ruby"
                  >
                    <LogOut className="h-3 w-3" /> Sign out
                  </button>
                </form>
              )}
            </nav>
          </header>

          {/* Bento grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* Top: metrics */}
            <MetricCard
              label="Documents Processed"
              value={metrics.documentsProcessed.toLocaleString()}
              accent="gold"
              icon={<FileText className="h-4 w-4" />}
              footnote="ai_processing_ledger · lifetime"
            />
            <MetricCard
              label="Verified Rate"
              value={metrics.verifiedRatePct.toFixed(1)}
              unit="%"
              accent="emerald"
              icon={<BadgeCheck className="h-4 w-4" />}
              footnote="verified ÷ total transactions"
            />
            <MetricCard
              label="Avg Latency"
              value={metrics.avgLatencyMs.toFixed(2)}
              unit="ms"
              accent="sapphire"
              icon={<Gauge className="h-4 w-4" />}
              footnote="auth.uid() indexed · sub-ms"
            />

            {/* Middle: quota (2 col) + tenant (1 col) */}
            <QuotaBar
              tenantId={tenantId}
              initialUsed={quota.used}
              limit={quota.limit}
              onAlertChange={setAlert}
            />
            <TenantIsolationCard tenant={tenant} />

            {/* Bottom: full-width ledger */}
            <TransactionalLedger entries={ledger} />
          </div>

          <footer className="mt-6 flex items-center gap-2 font-ledger text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            <Lock className="h-3 w-3" />
            Triple-Lock enforced · Edge → Quota → RLS
          </footer>
        </div>
      </div>
    </main>
  );
}
