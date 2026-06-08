import { Button } from "@/components/shared/Button";

export default function CTASection() {
  return (
    <section id="cta" className="relative scroll-mt-20 py-20 lg:py-24 overflow-hidden">
      {/* Background - subtle data visualization pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><rect width=%2260%22 height=%2260%22 fill=%22none%22/><path d=%22M10 10 Q20 30 30 10 T50 10%22 stroke=%22%231e293b%22 stroke-width=%220.5%22 opacity=%220.06%22 fill=%22none%22/></svg>')]"/>
        <div className="absolute inset-0 animate-data-flow" aria-hidden="true"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
       <div className="gradient-border overflow-hidden rounded-3xl">
        <div className="relative rounded-3xl bg-neutral-950/70 px-6 py-16 text-center backdrop-blur-xl sm:px-12">
          {/* atmospheric blobs inside the panel */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="aurora aurora-blue absolute -left-10 -top-16 h-64 w-64" />
            <div className="aurora aurora-cyan absolute -right-10 -bottom-16 h-64 w-64" />
          </div>

          <span className="eyebrow">Get started</span>
          <h2 className="mt-5 font-heading text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Ready to file your <span className="gradient-text">next BIR return</span> in minutes?
          </h2>

        {/* Sub-headline */}
        <p className="mt-6 text-lg text-text-muted max-w-2xl mx-auto mb-10">
          Join businesses measuring, optimizing, and accelerating their BIR tax compliance with precision automation and intelligent document capture.
        </p>

        {/* Live metrics ticker */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-text-muted">
          <div className="flex items-center space-x-2 animate-metric-pulse">
            <div className="w-2 h-2 bg-velocity-blue rounded-full" />
            <span className="text-xs font-metrics">Live: 1,247 req/sec</span>
          </div>
          <div className="hidden sm:block w-1 h-[20px] bg-neutral-700/30" />
          <div className="flex items-center space-x-2">
            <span className="text-xs">Avg response: 89ms</span>
          </div>
          <div className="hidden sm:block w-1 h-[20px] bg-neutral-700/30" />
          <div className="flex items-center space-x-2">
            <span className="text-xs">Uptime: 99.95%</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row sm:justify-center gap-4 sm:gap-6">
          <Button variant="outline" href="#features">
            Explore All Features
          </Button>
          <Button variant="primary" href="/login?mode=signup">
            Start Free Trial
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-text-muted">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-efficiency-green/20 rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6h4l2 2 4-4" stroke="%2310b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span className="text-xs">Trusted by 500+ businesses</span>
          </div>
          <div className="hidden sm:block w-1 h-[24px] bg-neutral-700/30" />
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-insight-cyan/20 rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6h4l2 2 4-4" stroke="%2306b6d4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span className="text-xs">98% customer satisfaction</span>
          </div>
          <div className="hidden sm:block w-1 h-[24px] bg-neutral-700/30" />
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-velocity-blue/20 rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6h4l2 2 4-4" stroke="%233b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span className="text-xs">24/7 expert support</span>
          </div>
        </div>
       </div>
      </div>
      </div>
    </section>
  );
}
