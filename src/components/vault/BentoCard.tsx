import type { ReactNode } from "react";

export type AlertState = "active" | "warning" | "breach";

const ALERT_BORDER: Record<AlertState, string> = {
  active: "border-emerald/30",
  warning: "border-amber/50",
  breach: "border-ruby/70 animate-ruby",
};

/**
 * Obsidian bento panel. The `alert` prop drives the border treatment:
 * Emerald (all active), Amber (quota warning), Ruby (lock breach / alarm).
 */
export function BentoCard({
  children,
  className = "",
  alert = "active",
  eyebrow,
  title,
}: {
  children?: ReactNode;
  className?: string;
  alert?: AlertState;
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border bg-obsidian-700/70 p-5 backdrop-blur-sm transition-colors duration-500 ${ALERT_BORDER[alert]} ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 vault-grid opacity-[0.18]" />
      <div className="relative">
        {(eyebrow || title) && (
          <header className="mb-4">
            {eyebrow && (
              <p className="font-ledger text-[10px] uppercase tracking-[0.28em] text-ink-faint">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-serif-display text-xl text-ink">{title}</h2>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
