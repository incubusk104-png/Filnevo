import type { ReactNode } from "react";
import { BentoCard } from "./BentoCard";

export function MetricCard({
  label,
  value,
  unit,
  accent,
  icon,
  footnote,
}: {
  label: string;
  value: string;
  unit?: string;
  accent: "gold" | "sapphire" | "emerald";
  icon: ReactNode;
  footnote?: string;
}) {
  const accentText = {
    gold: "text-gold-soft",
    sapphire: "text-sapphire",
    emerald: "text-emerald",
  }[accent];

  return (
    <BentoCard className="col-span-1">
      <div className="flex items-start justify-between">
        <p className="font-nav text-xs uppercase tracking-[0.22em] text-ink-dim">
          {label}
        </p>
        <span className={accentText}>{icon}</span>
      </div>
      <div className="mt-6 flex items-baseline gap-2">
        <span className={`font-serif-display text-4xl ${accentText}`}>
          {value}
        </span>
        {unit && (
          <span className="font-ledger text-xs uppercase tracking-widest text-ink-faint">
            {unit}
          </span>
        )}
      </div>
      {footnote && (
        <p className="mt-3 font-ledger text-[11px] text-ink-faint">{footnote}</p>
      )}
    </BentoCard>
  );
}
