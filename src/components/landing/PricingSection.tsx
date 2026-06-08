import { Button } from "@/components/shared/Button";
import { UpgradeButton } from "@/components/landing/UpgradeButton";

export default function PricingSection() {
  return (
    <section id="pricing" className="relative scroll-mt-20 py-20 lg:py-24 overflow-hidden">
      {/* Background - subtle metric chart pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><rect width=%2260%22 height=%2260%22 fill=%22none%22/><path d=%22M10 30 Q20 10 30 30 T50 30%22 stroke=%22%231e293b%22 stroke-width=%220.5%22 opacity=%220.06%22 fill=%22none%22/></svg>')]"/>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="eyebrow">Pricing</span>
          <h2 className="mt-5 font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Plans that scale with your <span className="gradient-text">filings</span>
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Flexible pricing for businesses of all sizes. Every plan includes our BIR compliance tools with progressive feature access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Free Tier */}
          <article className="data-card p-8 border border-neutral-800/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-neutral-800/20 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 10h12v-2H4v2z" stroke="%2364748b" stroke-width="1.5"/>
                  <circle cx="6" cy="6" r="2" fill="%2364748b"/>
                  <circle cx="14" cy="6" r="2" fill="%2364748b"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-neutral-100 font-semibold mb-2">
                  Free Trial
                </h3>
                <p className="text-text-muted text-sm">
                  Try Filnevo free — no credit card. Be filing-ready in minutes.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>5 Document Scans/month</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Zero-Entry Mobile Capture</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Dynamic BIR Deadline Countdown</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Community Support</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-800/20">
              <div className="flex items-baseline mb-4">
                <span className="font-metrics text-2xl text-foreground font-bold">
                  ₱0
                </span>
                <span className="text-text-muted text-xs ml-2">/ month</span>
              </div>
              <Button variant="outline" href="/login?mode=signup" className="w-full">
                Start Free Trial
              </Button>
            </div>
          </article>

          {/* Starter Tier */}
          <article className="data-card p-8 border border-insight-cyan/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-insight-cyan/10 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 10h12v-2H4v2z" stroke="%2306b6d4" stroke-width="1.5"/>
                  <circle cx="6" cy="6" r="2" fill="%2306b6d4"/>
                  <circle cx="14" cy="6" r="2" fill="%2306b6d4"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-insight-cyan font-semibold mb-2">
                  Starter Tier
                </h3>
                <p className="text-text-muted text-sm">
                  Ideal for freelancers and small businesses
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>50 Document Scans/month</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>All Free Features Included</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>BIR 10-Second Auto-Fill (Unblurred)</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Sunday Night Tax Stress Digest</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Shared Accountant Access Link</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Give 3/Get 3 Referral Engine</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-800/20">
              <div className="flex items-baseline mb-4">
                <span className="font-metrics text-2xl text-foreground font-bold">
                  ₱299
                </span>
                <span className="text-text-muted text-xs ml-2">/ month</span>
              </div>
              <UpgradeButton tier="starter" variant="primary">
                Get Starter
              </UpgradeButton>
            </div>
          </article>

          {/* Business Pro Tier */}
          <article className="data-card p-8 border border-velocity-blue/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-velocity-blue/10 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 10h12v-2H4v2z" stroke="%233b82f6" stroke-width="1.5"/>
                  <circle cx="6" cy="6" r="2" fill="%233b82f6"/>
                  <circle cx="14" cy="6" r="2" fill="%233b82f6"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-velocity-blue font-semibold mb-2">
                  Business Pro
                </h3>
                <p className="text-text-muted text-sm">
                  Built for growing businesses with advanced needs
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>500 Document Scans/month</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>All Starter Features Included</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>WhatsApp Receipt Forwarding Bot</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Multi-Currency Ad-Spend Predictor</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Real-Time Dual-Receipt Anti-Fraud Flag</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Time-Restricted Cryptographic Vault Links</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-800/20">
              <div className="flex items-baseline mb-4">
                <span className="font-metrics text-2xl text-foreground font-bold">
                  ₱799
                </span>
                <span className="text-text-muted text-xs ml-2">/ month</span>
              </div>
              <UpgradeButton tier="business_pro" variant="primary">
                Get Business Pro
              </UpgradeButton>
            </div>
          </article>

          {/* Agency Core Tier */}
          <article className="data-card p-8 border border-warning-amber/30">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-warning-amber/10 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 10h12v-2H4v2z" stroke="%23f59e0b" stroke-width="1.5"/>
                  <circle cx="6" cy="6" r="2" fill="%23f59e0b"/>
                  <circle cx="14" cy="6" r="2" fill="%23f59e0b"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-warning-amber font-semibold mb-2">
                  Agency Core
                </h3>
                <p className="text-text-muted text-sm">
                  For agencies managing multiple client portfolios
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>5,000 Document Scans/month</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>All Business Pro Features Included</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Multi-Workspace Routing & Team Approvals</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Automated BIR Audit ZIP Export & Webhooks</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Role-Based Access Control (Owner/Admin/Buyer/CPA/Viewer)</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Separate Internal Agency vs Client Portfolios</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-800/20">
              <div className="flex items-baseline mb-4">
                <span className="font-metrics text-2xl text-foreground font-bold">
                  ₱2,499
                </span>
                <span className="text-text-muted text-xs ml-2">/ month</span>
              </div>
              <UpgradeButton tier="agency_core" variant="primary">
                Get Agency Core
              </UpgradeButton>
            </div>
          </article>
        </div>

        {/* Comparison Footer */}
        <div className="mt-16 text-center">
          <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-6">
            Ready to automate your BIR tax compliance?
          </h3>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">
            From solo freelancers to enterprise agencies, our platform scales with your needs while keeping your data secure and your filings accurate.
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4 sm:gap-6">
            <Button variant="outline" href="#features">
              Explore All Features
            </Button>
            <Button variant="primary" href="/login?mode=signup">
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}