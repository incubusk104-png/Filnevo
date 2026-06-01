import { Button } from "@/components/shared/Button";

export default function PricingSection() {
  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      {/* Background - subtle metric chart pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><rect width=%2260%22 height=%2260%22 fill=%22none%22/><path d=%22M10 30 Q20 10 30 30 T50 30%22 stroke=%22%231e293b%22 stroke-width=%220.5%22 opacity=%220.06%22 fill=%22none%22/></svg>')]"/>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 tracking-tight">
            Choose Your Service Acceleration Plan
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Flexible pricing for teams of all sizes. Every plan includes our precision
            analytics and automation tools designed to measure and accelerate service delivery.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Free Tier */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300 border border-neutral-800/30">
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
                  Starter
                </h3>
                <p className="text-text-muted text-sm">
                  Perfect for individuals and small teams getting started
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Up to 1K services/month</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Basic analytics dashboard</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Community support</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Email support (3-day response)</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-800/20">
              <div className="flex items-baseline mb-4">
                <span className="font-metrics text-2xl text-foreground font-bold">
                  $0
                </span>
                <span className="text-text-muted text-xs ml-2">/ month</span>
              </div>
              <Button variant="outline" href="#cta">
                Get Started Free
              </Button>
            </div>
          </article>

          {/* Professional Tier */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300 border border-insight-cyan/30">
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
                  Professional
                </h3>
                <p className="text-text-muted text-sm">
                  Ideal for growing businesses and teams
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Up to 10K services/month</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Advanced analytics & predictions</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Automated workflow optimizer</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Priority email support</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>99.9% uptime SLA</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-800/20">
              <div className="flex items-baseline mb-4">
                <span className="font-metrics text-2xl text-foreground font-bold">
                  $49
                </span>
                <span className="text-text-muted text-xs ml-2">/ month</span>
              </div>
              <Button variant="primary" href="#cta">
                Start Free Trial
              </Button>
            </div>
          </article>

          {/* Business Tier */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300 border border-velocity-blue/30">
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
                  Business
                </h3>
                <p className="text-text-muted text-sm">
                  Built for established companies and departments
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Up to 100K services/month</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Intelligent load balancer</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Service performance predictor</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>24/7 priority support</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Dedicated account manager</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Custom integrations & API</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>99.95% uptime SLA</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-800/20">
              <div className="flex items-baseline mb-4">
                <span className="font-metrics text-2xl text-foreground font-bold">
                  $149
                </span>
                <span className="text-text-muted text-xs ml-2">/ month</span>
              </div>
              <Button variant="primary" href="#cta">
                Start Free Trial
              </Button>
            </div>
          </article>

          {/* Enterprise Tier */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300 border border-warning-amber/30">
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
                  Enterprise
                </h3>
                <p className="text-text-muted text-sm">
                  Custom solutions for large organizations
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Unlimited services</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>All features included</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Collaborative service designer</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Enterprise API gateway</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>24/7 dedicated support</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Custom SLAs available</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>On-premise deployment</span>
              </div>
              <div className="flex items-center space-x-3 text-text-muted">
                <div className="w-2 h-2 bg-efficiency-green/50 rounded-full" />
                <span>Advanced security & compliance</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-800/20">
              <div className="flex items-baseline">
                <span className="font-metrics text-xl text-foreground font-bold">
                  Custom
                </span>
                <span className="text-text-muted text-xs ml-2">/ month</span>
              </div>
              <Button variant="outline" href="#cta">
                Contact Sales
              </Button>
            </div>
          </article>
        </div>

        {/* Comparison Footer */}
        <div className="mt-16 text-center">
          <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-6">
            Ready to accelerate your service delivery?
          </h3>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">
            Start optimizing your services today with our precision-engineered
            platform designed for maximum speed and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4 sm:gap-6">
            <Button variant="outline" href="#features">
              Explore All Features
            </Button>
            <Button variant="primary" href="#cta">
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
