import { BentoCard } from "./BentoCard";
import type { LedgerEntry, LedgerStatus } from "@/lib/vault-data";

const STATUS_STYLE: Record<LedgerStatus, string> = {
  verified: "text-emerald border-emerald/40 bg-emerald/10",
  pending: "text-sapphire border-sapphire/40 bg-sapphire/10",
  failed: "text-ruby border-ruby/40 bg-ruby/10",
};

export function TransactionalLedger({ entries }: { entries: LedgerEntry[] }) {
  return (
    <BentoCard
      className="col-span-1 md:col-span-3"
      eyebrow="ai_processing_ledger · append-only"
      title="Transactional Ledger"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] font-ledger text-xs">
          <thead>
            <tr className="border-b border-hairline text-left text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              <th className="py-2 pr-4 font-medium">TX_ID</th>
              <th className="py-2 pr-4 font-medium">Document</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 text-right font-medium">Latency</th>
              <th className="py-2 pr-4 text-right font-medium">Tokens</th>
              <th className="py-2 text-right font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr
                key={e.id}
                className="border-b border-hairline/50 text-ink-dim transition-colors hover:bg-obsidian-600/60"
              >
                <td className="py-2.5 pr-4 text-gold-soft">{e.id}</td>
                <td className="py-2.5 pr-4 text-ink">{e.document}</td>
                <td className="py-2.5 pr-4">
                  <span
                    className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_STYLE[e.status]}`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-right">{e.latencyMs.toFixed(2)}ms</td>
                <td className="py-2.5 pr-4 text-right">{e.tokens.toLocaleString()}</td>
                <td className="py-2.5 text-right text-ink-faint">{e.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BentoCard>
  );
}
