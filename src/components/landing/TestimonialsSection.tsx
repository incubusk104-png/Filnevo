export default function TestimonialsSection() {
  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      {/* Background - subtle metric trend pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><rect width=%2260%22 height=%2260%22 fill=%22none%22/><path d=%22M10 50 Q20 10 30 50 T50 50%22 stroke=%22%231e293b%22 stroke-width=%220.5%22 opacity=%220.06%22 fill=%22none%22/></svg>')]"/>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 tracking-tight">
            See How We Accelerate Service Delivery
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Real customers achieving measurable speed improvements with our precision platform
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">

          {/* Testimonial 1: FinTech Startup */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300 border border-insight-cyan/30">
            <div className="space-y-6">
              {/* Quote icon */}
              <div className="w-8 h-8 text-insight-cyan/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 11a2 2 0 100 4H1m0 4a2 2 0 100 4H1m11-8a2 2 0 100 4h4M11 15a2 2 0 100 4h4" stroke="%2306b6d4" stroke-width="1.5"/>
                </svg>
              </div>

              {/* Testimonial text */}
              <p className="text-text-muted italic">
                "Our service deployment time dropped from 45 minutes to under 3 minutes after implementing the workflow optimizer and intelligent load balancer."
              </p>

              {/* Metric badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className="badge badge-success">8x</span>
                <span className="text-xs font-metrics text-insight-cyan">faster deployment</span>
              </div>

              {/* Customer info */}
              <div className="mt-6 pt-3 border-t border-neutral-800/20 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-insight-cyan/10 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-insight-cyan/20 rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 0a4 4 0 100 4 4 4 0 000-4zM6 10a2 2 0 100-4 2 2 0 000 4z" fill="%2306b6d4"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-metrics text-sm text-neutral-100 font-semibold mb-1">
                    Alex Rivera
                  </h3>
                  <p className="text-xs text-text-muted">
                    CTO, FinTech Startup
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Testimonial 2: E-commerce Platform */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300 border border-velocity-blue/30">
            <div className="space-y-6">
              {/* Quote icon */}
              <div className="w-8 h-8 text-velocity-blue/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 11a2 2 0 100 4H1m0 4a2 2 0 100 4H1m11-8a2 2 0 1000 4h4M11 15a2 2 0 1000 4h4" stroke="%233b82f6" stroke-width="1.5"/>
                </svg>
              </div>

              {/* Testimonial text */}
              <p className="text-text-muted italic">
                "During peak holiday traffic, our API response times improved by 65% thanks to the intelligent load balancer and real-time autoscaling."
              </p>

              {/* Metric badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className="badge badge-info">65%</span>
                <span className="text-xs font-metrics text-velocity-blue">faster response</span>
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
                    Dr. Samantha Chen
                  </h3>
                  <p className="text-xs text-text-muted">
                    VP Engineering, E-commerce Platform
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Testimonial 3: Healthcare SaaS */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300 border border-efficiency-green/30">
            <div className="space-y-6">
              {/* Quote icon */}
              <div className="w-8 h-8 text-efficiency-green/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 11a2 2 0 100 4H1m0 4a2 2 0 100 4H1m11-8a2 2 0 1000 4h4M11 15a2 2 0 1000 4h4" stroke="%2310b981" stroke-width="1.5"/>
                </svg>
              </div>

              {/* Testimonial text */}
              <p className="text-text-muted italic">
                "Patient data processing workflows now complete in seconds instead of minutes, allowing us to serve 3x more patients daily."
              </p>

              {/* Metric badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className="badge badge-warning">3x</span>
                <span className="text-xs font-metrics text-efficiency-green">patient throughput</span>
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
                    Marcus Johnson
                  </h3>
                  <p className="text-xs text-text-muted">
                    CTO, Healthcare SaaS Provider
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Testimonial 4: Logistics Company */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300 border border-warning-amber/30">
            <div className="space-y-6">
              {/* Quote icon */}
              <div className="w-8 h-8 text-warning-amber/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 11a2 2 0 100 4H1m0 4a2 2 0 100 4H1m11-8a2 2 0 1000 4h4M11 15a2 2 0 1000 4h4" stroke="%23f59e0b" stroke-width="1.5"/>
                </svg>
              </div>

              {/* Testimonial text */}
              <p className="text-text-muted italic">
                "Route optimization calculations that used to take 20 minutes now return in under 30 seconds, enabling real-time delivery adjustments."
              </p>

              {/* Metric badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className="badge badge-error">40x</span>
                <span className="text-xs font-metrics text-warning-amber">faster routing</span>
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
                    Elena Rodriguez
                  </h3>
                  <p className="text-xs text-text-muted">
                    Director of Ops, Global Logistics Co
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-6">
            Ready to measure and accelerate your service delivery?
          </h3>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">
            Join hundreds of businesses already seeing measurable speed improvements
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4 sm:gap-6">
            <Button variant="outline" href="#features">
              Explore Features
            </Button>
            <Button variant="primary" href="#cta">
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>
    );
}
