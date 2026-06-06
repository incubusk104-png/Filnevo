import { Button } from "@/components/shared/Button";

export default function FeaturesSection() {
  return (
    <section id="features" className="relative scroll-mt-20 py-20 lg:py-24 overflow-hidden">
      {/* Background - subtle data grid pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%20viewBox=%220 0 40 40%22><rect width=%2240%22 height=%2240%22 fill=%22none%22/><path d=%22M0 20L40 20M20 0L20 40%22 stroke=%22%231e293b%22 stroke-width=%220.5%22 opacity=%220.08%22/></svg>')]"/>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="eyebrow">Capabilities</span>
          <h2 className="mt-5 font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Everything you need for <span className="gradient-text">BIR compliance</span>
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Every feature is designed to automate your BIR tax filing, ensure accuracy,
            and save you time on tax preparation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">

          {/* Feature 1: Zero-Entry Mobile Document Capture */}
          <article className="data-card p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-velocity-blue/10 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm2 1H8V8h12v13z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-velocity-blue font-semibold mb-2">
                  Zero-Entry Mobile Document Capture
                </h3>
                <p className="text-text-muted">
                  Simply take a photo of any receipt or document with your mobile device.
                  Our AI automatically extracts all relevant data - vendor, date, amount,
                  tax information - eliminating manual data entry entirely.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-info">AI Data Extraction</span>
                  <span className="badge badge-success">Multi-format Support</span>
                  <span className="badge badge-info">Mobile Optimized</span>
                </div>
              </div>
            </div>
          </article>

          {/* Feature 2: BIR 10-Second Auto-Fill */}
          <article className="data-card p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-insight-cyan/10 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H5v-2h14v2z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-insight-cyan font-semibold mb-2">
                  BIR 10-Second Auto-Fill
                </h3>
                <p className="text-text-muted">
                  Extract data from your documents and automatically populate BIR tax forms
                  (1701Q, 1702, 2550M, 2550Q, 0605E, etc.) in under 10 seconds. No more
                  manual form filling - just review and submit.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-success">Form Auto-population</span>
                  <span className="badge badge-info">Multiple BIR Forms</span>
                  <span className="badge badge-success">10-Second Processing</span>
                </div>
              </div>
            </div>
          </article>

          {/* Feature 3: Dynamic BIR Deadline Countdown */}
          <article className="data-card p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-efficiency-green/10 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="%2310b981" stroke-width="2"/>
                  <path d="M12 6v2l4 4" stroke="%2310b981" stroke-width="2" stroke-linecap="round"/>
                  <path d="M12 14v4" stroke="%2310b981" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-efficiency-green font-semibold mb-2">
                  Dynamic BIR Deadline Countdown
                </h3>
                <p className="text-text-muted">
                  Never miss a BIR deadline again with real-time countdown timers for
                  all tax filing due dates (monthly, quarterly, annual). Get automated
                  reminders via email and push notifications as deadlines approach.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-warning">Real-time Countdown</span>
                  <span className="badge badge-success">Automated Reminders</span>
                  <span className="badge badge-warning">All Tax Types Covered</span>
                </div>
              </div>
            </div>
          </article>

          {/* Feature 4: WhatsApp Receipt Forwarding Bot */}
          <article className="data-card p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-warning-amber/10 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8zm2 4h6v3h2v-6h-2v-2H8v2h2v3zm3.5-6.5l1.5 1.5L18 8l-1.5-1.5z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-warning-amber font-semibold mb-2">
                  WhatsApp Receipt Forwarding Bot
                </h3>
                <p className="text-text-muted">
                  Forward receipts directly to our dedicated WhatsApp number and our AI
                  bot will automatically process them, extract data, and add them to
                  your tax records. Perfect for on-the-go expense tracking.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-info">WhatsApp Integration</span>
                  <span className="badge badge-success">Instant Processing</span>
                  <span className="badge badge-info">No App Required</span>
                </div>
              </div>
            </div>
          </article>

          {/* Feature 5: Multi-Currency Ad-Spend Predictor */}
          <article className="data-card p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-alert-red/10 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V5h10v2z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-alert-red font-semibold mb-2">
                  Multi-Currency Tax Predictor
                </h3>
                <p className="text-text-muted">
                  For businesses with international transactions, our AI predicts your
                  tax liabilities in multiple currencies (USD, EUR, SGD, etc.) based on
                  your income and expense patterns, helping you set aside the right
                  amount for tax payments.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-success">Multi-currency Support</span>
                  <span className="badge badge-info">AI Tax Prediction</span>
                  <span className="badge badge-success">Expense Pattern Analysis</span>
                </div>
              </div>
            </div>
          </article>

          {/* Feature 6: Real-Time Dual-Receipt Anti-Fraud Flag */}
          <article className="data-card p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-neutral-800/20 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-neutral-100 font-semibold mb-2">
                  Real-Time Duplicate Detection
                </h3>
                <p className="text-text-muted">
                  Our system automatically flags potential duplicate receipts or
                  inconsistent entries in real-time, preventing accidental double
                  claiming and ensuring clean, audit-ready tax records.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-warning">Duplicate Detection</span>
                  <span className="badge badge-success">Real-time Alerts</span>
                  <span className="badge badge-warning">Audit Prevention</span>
                </div>
              </div>
            </div>
          </article>

        </div>

        {/* Call to Action Section */}
        <div className="mt-20 text-center">
          <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-6">
            Ready to automate your BIR tax compliance?
          </h3>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">
            From zero-entry document capture to automated form filling, our platform
            ensures accurate, on-time BIR tax filings while saving you hours each month.
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4 sm:gap-6">
            <Button variant="outline" href="#pricing">
              See Pricing Plans
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