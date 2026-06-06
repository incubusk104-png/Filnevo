import { Button } from "@/components/shared/Button";

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative scroll-mt-20 py-20 lg:py-24 overflow-hidden">
      {/* Background - subtle metric trend pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><rect width=%2260%22 height=%2260%22 fill=%22none%22/><path d=%22M10 50 Q20 10 30 50 T50 50%22 stroke=%22%231e293b%22 stroke-width=%220.5%22 opacity=%220.06%22 fill=%22none%22/></svg>')]"/>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="eyebrow">Customer stories</span>
          <h2 className="mt-5 font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            See how we transform <span className="gradient-text">BIR compliance</span>
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Real businesses achieving measurable time savings and accuracy improvements with our BIR tax automation platform
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">

          {/* Testimonial 1: Freelance Consultant */}
          <article className="data-card p-8 border border-insight-cyan/30">
            <div className="space-y-6">
              {/* Quote icon */}
              <div className="w-8 h-8 text-insight-cyan/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 11a2 2 0 100 4H1m0 4a2 2 0 1000 4H1m11-8a2 2 0 1000 4h4M11 15a2 2 0 1000 4h4" stroke="%2306b6d4" stroke-width="1.5"/>
                </svg>
              </div>

              {/* Testimonial text */}
              <p className="text-text-muted italic">
                "As a freelance consultant juggling multiple clients, I used to spend 8 hours every quarter on BIR forms. Now I complete everything in under 30 minutes with zero entry errors."
              </p>

              {/* Metric badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className="badge badge-success">96%</span>
                <span className="text-xs font-metrics text-insight-cyan">time saved</span>
              </div>

              {/* Customer info */}
              <div className="mt-6 pt-3 border-t border-neutral-800/20 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-insight-cyan/10 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-insight-cyan/20 rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 0a4 4 0 1000 4 4 4 0 000-4zM6 10a2 2 0 1000-4 2 2 0 000 4z" fill="%2306b6d4"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-metrics text-sm text-neutral-100 font-semibold mb-1">
                    Maria Santos
                  </h3>
                  <p className="text-xs text-text-muted">
                    Independent Business Consultant
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Testimonial 2: Small Retail Business */}
          <article className="data-card p-8 border border-velocity-blue/30">
            <div className="space-y-6">
              {/* Quote icon */}
              <div className="w-8 h-8 text-velocity-blue/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 11a2 2 0 100 4H1m0 4a2 2 0 1000 4H1m11-8a2 2 0 1000 4h4M11 15a2 2 0 1000 4h4" stroke="%233b82f6" stroke-width="1.5"/>
                </svg>
              </div>

              {/* Testimonial text */}
              <p className="text-text-muted italic">
                "Running a small boutique with daily sales, I used to dread BIR deadlines. Now with WhatsApp forwarding and auto-fill, my monthly filings take 15 minutes instead of 3 hours."
              </p>

              {/* Metric badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className="badge badge-info">92%</span>
                <span className="text-xs font-metrics text-velocity-blue">time reduction</span>
              </div>

              {/* Customer info */}
              <div className="mt-6 pt-3 border-t border-neutral-800/20 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-velocity-blue/10 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-velocity-blue/20 rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 0a4 4 0 1000 4 4 4 0 000-4zM6 10a2 2 0 1000-4 2 2 0 000 4z" fill="%233b82f6"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-metrics text-sm text-neutral-100 font-semibold mb-1">
                    Juan dela Cruz
                  </h3>
                  <p className="text-xs text-text-muted">
                    Owner, Dagupan Boutique Store
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Testimonial 3: Marketing Agency */}
          <article className="data-card p-8 border border-efficiency-green/30">
            <div className="space-y-6">
              {/* Quote icon */}
              <div className="w-8 h-8 text-efficiency-green/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 11a2 2 0 100 4H1m0 4a2 2 0 1000 4H1m11-8a2 2 0 1000 4h4M11 15a2 2 0 1000 4h4" stroke="%2310b981" stroke-width="1.5"/>
                </svg>
              </div>

              {/* Testimonial text */}
              <p className="text-text-muted italic">
                "Managing tax compliance for 15+ client businesses was a nightmare. With the multi-workspace routing and team approvals, we've cut our processing time by 70% and eliminated filing errors completely."
              </p>

              {/* Metric badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className="badge badge-warning">70%</span>
                <span className="text-xs font-metrics text-efficiency-green">efficiency gain</span>
              </div>

              {/* Customer info */}
              <div className="mt-6 pt-3 border-t border-neutral-800/20 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-efficiency-green/10 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-efficiency-green/20 rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 0a4 4 0 1000 4 4 4 0 000-4zM6 10a2 2 0 1000-4 2 2 0 000 4z" fill="%2310b981"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-metrics text-sm text-neutral-100 font-semibold mb-1">
                    Atty. Rafael Lim
                  </h3>
                  <p className="text-xs text-text-muted">
                    Managing Director, TaxPro Agency
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Testimonial 4: Restaurant Chain */}
          <article className="data-card p-8 border border-warning-amber/30">
            <div className="space-y-6">
              {/* Quote icon */}
              <div className="w-8 h-8 text-warning-amber/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 11a2 2 0 100 4H1m0 4a2 2 0 1000 4H1m11-8a2 2 0 1000 4h4M11 15a2 2 0 1000 4h4" stroke="%23f59e0b" stroke-width="1.5"/>
                </svg>
              </div>

              {/* Testimonial text */}
              <p className="text-text-muted italic">
                "With 12 restaurant locations processing thousands of receipts monthly, the duplicate detection and multi-currency predictor have saved us from costly BIR penalties and improved our tax accuracy to 99.8%."
              </p>

              {/* Metric badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className="badge badge-error">99.8%</span>
                <span className="text-xs font-metrics text-warning-amber">accuracy rate</span>
              </div>

              {/* Customer info */}
              <div className="mt-6 pt-3 border-t border-neutral-800/20 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-warning-amber/10 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-warning-amber/20 rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 0a4 4 0 1000 4 4 4 0 000-4zM6 10a2 2 0 1000-4 2 2 0 000 4z" fill="%23f59e0b"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-metrics text-sm text-neutral-100 font-semibold mb-1">
                    Gladys Reyes
                  </h3>
                  <p className="text-xs text-text-muted">
                    Finance Director, Manila Restaurant Group
                  </p>
                </div>
              </div>
            </div>
          </article>

        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-6">
            Ready to transform your BIR tax compliance?
          </h3>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">
            Join thousands of Filipino businesses already saving hours on tax preparation every month
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4 sm:gap-6">
            <Button variant="outline" href="#features">
              Explore Features
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