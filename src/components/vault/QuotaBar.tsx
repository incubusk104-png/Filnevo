"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Activity, ShieldAlert } from "lucide-react";
import { BentoCard, type AlertState } from "./BentoCard";

export function quotaAlertState(used: number, limit: number): AlertState {
  if (used >= limit) return "breach";
  if (used / limit >= 0.75) return "warning";
  return "active";
}

const ALERT_META: Record<
  AlertState,
  { label: string; bar: string; text: string; icon: React.ReactNode }
> = {
  active: {
    label: "ALL SYSTEMS ACTIVE",
    bar: "bg-emerald",
    text: "text-emerald",
    icon: <Activity className="h-4 w-4" />,
  },
  warning: {
    label: "QUOTA WARNING",
    bar: "bg-amber",
    text: "text-amber",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  breach: {
    label: "RUBY ALARM · LOCK BREACH",
    bar: "bg-ruby",
    text: "text-ruby",
    icon: <ShieldAlert className="h-4 w-4" />,
  },
};

export function QuotaBar({
  tenantId,
  initialUsed,
  limit,
  onAlertChange,
}: {
  tenantId: string;
  initialUsed: number;
  limit: number;
  onAlertChange?: (state: AlertState) => void;
}) {
  const [used, setUsed] = useState(initialUsed);
  const [syncing, setSyncing] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const alert = quotaAlertState(used, limit);
  const meta = ALERT_META[alert];
  const pct = Math.min((used / limit) * 100, 100);
  const remaining = Math.max(limit - used, 0);

  useEffect(() => {
    onAlertChange?.(alert);
  }, [alert, onAlertChange]);

  // Query Lock 2 (check_and_increment_quota mirror) whenever the operator
  // drags the slider, then transition colors based on remaining quota.
  const syncQuota = useCallback(
    (nextUsed: number) => {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(async () => {
        setSyncing(true);
        try {
          await fetch("/api/quota", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ tenantId, used: nextUsed, limit }),
          });
        } catch {
          // keep optimistic UI on network failure
        } finally {
          setSyncing(false);
        }
      }, 180);
    },
    [tenantId, limit],
  );

  return (
    <BentoCard
      className="col-span-1 md:col-span-2"
      alert={alert}
      eyebrow="Lock 2 · check_and_increment_quota()"
      title="Quota Utilization"
    >
      <div className={`flex items-center gap-2 ${meta.text}`}>
        {meta.icon}
        <span className="font-nav text-sm tracking-wide">{meta.label}</span>
        {syncing && (
          <span className="font-ledger text-[10px] text-ink-faint">syncing…</span>
        )}
      </div>

      <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-obsidian-500">
        <div
          className={`h-full rounded-full transition-all duration-500 ${meta.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between font-ledger text-xs">
        <span className="text-ink-dim">
          {used} / {limit} units
        </span>
        <span className={meta.text}>{remaining} remaining</span>
      </div>

      <label className="mt-6 block">
        <span className="font-ledger text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Simulate consumption
        </span>
        <input
          type="range"
          min={0}
          max={limit}
          value={used}
          onChange={(e) => {
            const next = Number(e.target.value);
            setUsed(next);
            syncQuota(next);
          }}
          className="mt-2 w-full accent-gold"
          aria-label="Quota consumption"
        />
      </label>
    </BentoCard>
  );
}
