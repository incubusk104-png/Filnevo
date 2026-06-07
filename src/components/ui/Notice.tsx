import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

// Reusable inline notification used across the auth flows. Springy entrance +
// a growing accent bar (see `.notice-in` in globals.css). To replay the
// animation when the message changes, mount it with a `key` set to the text:
//   {error && <Notice key={error} variant="error">{error}</Notice>}

export type NoticeVariant = "error" | "success" | "info" | "warning";

const VARIANTS: Record<
  NoticeVariant,
  { wrap: string; Icon: typeof Info; label: string }
> = {
  error: {
    wrap: "border-alert-red/40 bg-alert-red/10 text-alert-red",
    Icon: XCircle,
    label: "Error",
  },
  success: {
    wrap: "border-efficiency-green/40 bg-efficiency-green/10 text-efficiency-green",
    Icon: CheckCircle2,
    label: "Success",
  },
  info: {
    wrap: "border-insight-cyan/40 bg-insight-cyan/10 text-insight-cyan",
    Icon: Info,
    label: "Notice",
  },
  warning: {
    wrap: "border-warning-amber/40 bg-warning-amber/10 text-warning-amber",
    Icon: AlertTriangle,
    label: "Warning",
  },
};

export function Notice({
  variant = "info",
  children,
  className,
}: {
  variant?: NoticeVariant;
  children: ReactNode;
  className?: string;
}) {
  const { wrap, Icon, label } = VARIANTS[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={`notice-in relative flex items-start gap-2.5 overflow-hidden rounded-md border py-2.5 pl-4 pr-3 font-body text-xs leading-relaxed ${wrap} ${className ?? ""}`}
    >
      <Icon className="mt-px h-4 w-4 shrink-0" aria-hidden />
      <span className="sr-only">{label}: </span>
      <span>{children}</span>
    </div>
  );
}
