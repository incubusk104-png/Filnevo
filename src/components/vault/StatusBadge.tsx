import type { ReactNode } from "react";

export type ClearanceLevel = "L1" | "L2" | "L3";

const LEVEL_STYLES: Record<
  ClearanceLevel,
  { ring: string; dot: string; text: string; label: string }
> = {
  // L1 — Brass-Gold
  L1: {
    ring: "border-gold/40 bg-gold/10",
    dot: "bg-gold shadow-[0_0_10px_var(--color-gold)]",
    text: "text-gold-soft",
    label: "L1 · GOLD",
  },
  // L2 — Sapphire
  L2: {
    ring: "border-sapphire/40 bg-sapphire/10",
    dot: "bg-sapphire shadow-[0_0_10px_var(--color-sapphire)]",
    text: "text-sapphire",
    label: "L2 · SAPPHIRE",
  },
  // L3 — Emerald
  L3: {
    ring: "border-emerald/40 bg-emerald/10",
    dot: "bg-emerald shadow-[0_0_10px_var(--color-emerald)]",
    text: "text-emerald",
    label: "L3 · EMERALD",
  },
};

export function StatusBadge({
  level,
  children,
}: {
  level: ClearanceLevel;
  children?: ReactNode;
}) {
  const s = LEVEL_STYLES[level];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-ledger text-[11px] uppercase tracking-[0.18em] ${s.ring} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {children ?? s.label}
    </span>
  );
}
