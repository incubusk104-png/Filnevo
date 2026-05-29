import { ShieldCheck, Fingerprint } from "lucide-react";
import { BentoCard } from "./BentoCard";
import { StatusBadge } from "./StatusBadge";
import type { TenantSnapshot } from "@/lib/vault-data";

export function TenantIsolationCard({ tenant }: { tenant: TenantSnapshot }) {
  return (
    <BentoCard
      className="col-span-1"
      eyebrow="Lock 3 · Row Level Security"
      title="Tenant Isolation"
    >
      <div className="flex items-center gap-2 text-emerald">
        <ShieldCheck className="h-4 w-4" />
        <span className="font-nav text-sm">
          {tenant.rlsEnforced ? "RLS ENFORCED" : "RLS DISABLED"}
        </span>
      </div>

      <dl className="mt-5 space-y-3 font-ledger text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">TENANT_ID</dt>
          <dd className="flex items-center gap-1.5 text-ink-dim">
            <Fingerprint className="h-3 w-3 text-sapphire" />
            {tenant.tenantId.slice(0, 13)}…
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">PLAN</dt>
          <dd className="uppercase text-gold-soft">{tenant.plan}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink-faint">REGION</dt>
          <dd className="text-ink-dim">{tenant.region}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusBadge level="L3" />
      </div>
    </BentoCard>
  );
}
