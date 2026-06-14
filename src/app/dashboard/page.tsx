"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  ArrowUpRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { Button } from "@/components/shared/Button";

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  trend?: {
    value: string;
    isUp: boolean;
  };
}

function MetricCard({ label, value, subValue, icon: Icon, trend }: MetricCardProps) {
  return (
    <div className="data-card p-6 border border-neutral-800/30">
      <div className="flex items-center justify-between">
        <span className="font-data text-xs uppercase tracking-wider text-text-muted">{label}</span>
        <div className="rounded-lg bg-neutral-900/50 p-2 text-velocity-blue">
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-3">
        <h3 className="font-metrics text-3xl font-semibold text-foreground">{value}</h3>
        {trend && (
          <span className={`flex items-center text-xs font-medium ${trend.isUp ? 'text-efficiency-green' : 'text-alert-red'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      {subValue && <p className="mt-1 text-xs text-text-muted">{subValue}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else if (hour >= 17) setGreeting("Good evening");
  }, []);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            {greeting}, User
          </h1>
          <p className="mt-1 text-text-muted">
            Here&apos;s what&apos;s happening with your tax compliance today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Clock size={16} className="mr-2" />
            History
          </Button>
          <Button variant="primary" size="sm">
            <Plus size={16} className="mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Documents Scanned"
          value="12"
          subValue="5 scans remaining this month"
          icon={FileText}
          trend={{ value: "24%", isUp: true }}
        />
        <MetricCard
          label="Compliance Score"
          value="98%"
          subValue="Excellent standing"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Pending Tasks"
          value="3"
          subValue="2 require immediate action"
          icon={AlertCircle}
        />
        <MetricCard
          label="Next Deadline"
          value="Oct 25"
          subValue="BIR Form 2551Q"
          icon={Calendar}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-semibold text-foreground">Recent Documents</h2>
            <Link href="/dashboard/documents" className="text-sm font-medium text-insight-cyan hover:underline inline-flex items-center">
              View all <ArrowUpRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-800/30 bg-neutral-950/20">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-800/30 bg-neutral-900/40 text-[10px] uppercase tracking-[0.1em] text-text-faint">
                  <th className="px-6 py-3 font-semibold">Document</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/30">
                {[
                  { name: "Receipt-7742.pdf", date: "2 hours ago", status: "Processed", amount: "₱1,250.00" },
                  { name: "Invoice_Client_A.png", date: "Yesterday", status: "Reviewing", amount: "₱15,000.00" },
                  { name: "Utility_Bill_Sept.pdf", date: "Oct 12, 2023", status: "Processed", amount: "₱3,420.50" },
                  { name: "BIR_Form_1701Q.pdf", date: "Oct 10, 2023", status: "Filed", amount: "—" },
                ].map((doc, i) => (
                  <tr key={i} className="group hover:bg-neutral-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded bg-neutral-900 p-2 text-text-muted group-hover:text-velocity-blue transition-colors">
                          <FileText size={16} />
                        </div>
                        <span className="text-sm font-medium text-neutral-200">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted">{doc.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        doc.status === 'Processed' ? 'bg-efficiency-green/10 text-efficiency-green' :
                        doc.status === 'Reviewing' ? 'bg-warning-amber/10 text-warning-amber' :
                        'bg-insight-cyan/10 text-insight-cyan'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-metrics text-neutral-200">{doc.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Center */}
        <div className="space-y-6">
          <h2 className="font-heading text-xl font-semibold text-foreground">Action Center</h2>
          <div className="space-y-4">
            <div className="data-card p-5 border border-alert-red/20 bg-alert-red/5">
              <div className="flex gap-4">
                <div className="mt-0.5 text-alert-red">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Missing Info</h4>
                  <p className="mt-1 text-xs text-text-muted leading-relaxed">
                    Invoice #4412 is missing a TIN for the supplier. This will block your next filing.
                  </p>
                  <button className="mt-3 text-xs font-bold text-alert-red hover:underline">Fix now</button>
                </div>
              </div>
            </div>

            <div className="data-card p-5 border border-insight-cyan/20 bg-insight-cyan/5">
              <div className="flex gap-4">
                <div className="mt-0.5 text-insight-cyan">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Quarterly Filing</h4>
                  <p className="mt-1 text-xs text-text-muted leading-relaxed">
                    Your Q3 Percentage Tax return is ready for review. Deadline in 12 days.
                  </p>
                  <button className="mt-3 text-xs font-bold text-insight-cyan hover:underline">Review Return</button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-hairline bg-neutral-900/30 p-6 text-center">
              <h4 className="text-sm font-semibold text-foreground">Need help?</h4>
              <p className="mt-1 text-xs text-text-muted">Our tax experts are available for a quick consult.</p>
              <Button variant="outline" size="sm" className="mt-4 w-full text-xs">
                Chat with Expert
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
