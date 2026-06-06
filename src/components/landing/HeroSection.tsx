import type { CSSProperties } from "react";
import { Button } from "@/components/shared/Button";
import AnimatedCounter from "./AnimatedCounter";

const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as CSSProperties;

const trust = [
  "No credit card required",
  "BIR 1701Q · 2550M · 0605",
  "RLS-secured workspaces",
];

const metrics = [
  { value: 50, suffix: "K+", label: "Documents processed / month", color: "text-velocity-blue" },
  { value: 10, suffix: "K+", label: "Hours saved on tax prep / month", color: "text-insight-cyan" },
  { value: 99.9, suffix: "%", decimals: 1, label: "Extraction accuracy", color: "text-efficiency-green" },
  { value: 99.95, suffix: "%", decimals: 2, label: "Platform uptime", color: "text-warning-amber" },
];

const formRows = [
  { label: "Taxpayer TIN", value: "009-461-228-000" },
  { label: "Return period", value: "May 2026" },
  { label: "Gross sales", value: "₱1,284,500.00" },
  { label: "Output VAT", value: "₱154,140.00" },
];

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-mask absolute inset-0" />
        <div className="aurora aurora-blue absolute -left-24 -top-32 h-[440px] w-[440px]" />
        <div className="aurora aurora-cyan absolute -right-20 top-24 h-[400px] w-[400px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-28 lg:pt-28">
        {/* Left — copy */}
        <div>
          <span className="eyebrow enter" style={delay(0)}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-insight-cyan opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-insight-cyan" />
            </span>
            BIR-ready tax automation
          </span>

          <h1
            className="enter mt-6 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]"
            style={delay(80)}
          >
            Automate your{" "}
            <span className="text-shimmer">BIR tax compliance</span>{" "}
            end&nbsp;to&nbsp;end
          </h1>

          <p
            className="enter mt-6 max-w-xl text-lg leading-relaxed text-text-muted"
            style={delay(160)}
          >
            From zero-entry document capture to automated BIR form filling, Filnevo
            delivers accurate, on-time filings — saving your team hours every month.
          </p>

          <div className="enter mt-9 flex flex-col gap-4 sm:flex-row" style={delay(240)}>
            <Button variant="primary" size="lg" href="/login?mode=signup" className="shadow-lg shadow-velocity-blue/20">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" href="#features">
              Explore Features
            </Button>
          </div>

          <ul className="enter mt-10 flex flex-wrap items-center gap-x-6 gap-y-3" style={delay(320)}>
            {trust.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-text-faint">
                <svg className="h-4 w-4 flex-shrink-0 text-efficiency-green" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — floating BIR auto-fill mock */}
        <div className="enter relative" style={delay(260)}>
          {/* glow ring */}
          <div className="pointer-events-none absolute -inset-10 -z-10 opacity-60">
            <div className="spin-slow absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.25),transparent_40%,rgba(6,182,212,0.25),transparent)]" />
          </div>

          <div className="gradient-border float-slow rounded-2xl">
            <div className="rounded-2xl bg-neutral-950/70 p-6 backdrop-blur-xl">
              {/* window chrome */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-alert-red/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning-amber/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-efficiency-green/70" />
                </div>
                <span className="badge badge-success">Filed in 8.2s</span>
              </div>

              <p className="font-data text-xs uppercase tracking-widest text-text-faint">
                Form 2550M · Monthly VAT
              </p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">
                Auto-filled from 14 receipts
              </h3>

              <div className="mt-5 space-y-3">
                {formRows.map((row, i) => (
                  <div
                    key={row.label}
                    className="enter flex items-center justify-between rounded-lg border border-neutral-800/60 bg-neutral-900/40 px-4 py-3"
                    style={delay(500 + i * 120)}
                  >
                    <span className="text-sm text-text-muted">{row.label}</span>
                    <span className="font-metrics text-sm font-semibold tabular-nums text-foreground">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* mini bar chart */}
              <div className="mt-6 flex items-end gap-1.5" aria-hidden="true">
                {[38, 62, 45, 78, 56, 90, 70, 84, 60, 96].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-velocity-blue/30 to-insight-cyan/80"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* floating mini cards */}
          <div className="float-slower absolute -left-6 bottom-10 hidden rounded-xl border border-neutral-800/70 bg-neutral-950/80 px-4 py-3 backdrop-blur-xl sm:block">
            <p className="font-metrics text-xl font-bold text-efficiency-green">99.9%</p>
            <p className="text-xs text-text-faint">accuracy</p>
          </div>
          <div className="float-slow absolute -right-4 -top-4 hidden rounded-xl border border-neutral-800/70 bg-neutral-950/80 px-4 py-3 backdrop-blur-xl sm:block">
            <p className="font-metrics text-xl font-bold text-insight-cyan">10s</p>
            <p className="text-xs text-text-faint">auto-fill</p>
          </div>
        </div>
      </div>

      {/* Metrics band */}
      <div className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="metrics-container p-6 text-center">
              <AnimatedCounter
                value={m.value}
                suffix={m.suffix}
                decimals={m.decimals ?? 0}
                className={`font-metrics text-3xl font-bold tabular-nums ${m.color}`}
              />
              <p className="mt-2 text-sm text-text-muted">{m.label}</p>
            </div>
          ))}
        </div>

        {/* live ticker */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-text-faint">
          <span className="flex items-center gap-2 text-xs font-metrics">
            <span className="h-2 w-2 animate-pulse rounded-full bg-velocity-blue" />
            Live · processing 1,247 receipts/sec
          </span>
          <span className="hidden h-4 w-px bg-neutral-700/50 sm:block" />
          <span className="text-xs">Last filing 2m 14s ago</span>
        </div>
      </div>
    </section>
  );
}
