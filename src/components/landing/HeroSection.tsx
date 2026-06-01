import { Button } from "@/components/shared/Button";

export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background pattern - subtle data flow visualization */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><rect width=%2260%22 height=%2260%22 fill=%22none%22/><path d=%22M30 0 L0 30 L30 60 L60 30 Z%22 stroke=%22%233b82f6%22 stroke-width=%220.5%22 opacity=%220.05%22/></svg>')]"/>
        <div className="absolute inset-0 animate-data-flow" aria-hidden="true"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-4xl px-6 lg:px-8">
        {/* Logomark with speed indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-velocity-blue/20 to-insight-cyan/20 rounded-xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4h2v2H4V4zm0 6h2v2H4v-2zm0 6h2v2H4v-2zm6-4h2v2h-2V6zm0 2h2v2h-2v-2zm0 2h2v2h-2v-2zm4-8h2v2h-2V6zm0 2h2v2h-2v-2zm0 2h2v2h-2v-2zm0 2h2v2h-2v-2zm-8 4h2v2h-2v-2zm0 2h2v2h-2v-2zm0 2h2v2h-2v-2zm4-6h2v2h-2V6zm0 2h2v2h-2v-2zm0 2h2v2h-2v-2zm0 2h2v2h-2v-2z" fill="%233b82f6" opacity="0.1"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8 8-3.59 8-8 8zM13 10h-2V7h-2v3H7v2h3v3h2v-3h3v-2h-3z" fill="%233b82f6"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              Accelerate Your Business Services
            </h2>
            <p className="mt-2 text-text-muted max-w-lg">
              Purpose-built SaaS platform that helps small and large enterprises
              deliver their services faster through intelligent automation,
              real-time optimization, and seamless workflow orchestration.
            </p>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
          Transform Service Delivery Speed
        </h1>

        {/* Sub-headline with metrics focus */}
        <p className="text-lg text-text-muted max-w-2xl">
          Measure, optimize, and accelerate every aspect of your service delivery
          with precision analytics and automated workflow optimization.
        </p>

        {/* Key Metrics Row */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Services Accelerated */}
          <div className="metrics-container p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-velocity-blue/10 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM10 0a10 10 0 100 20 10 10 0 000-20z" fill="none" stroke="%233b82f6" stroke-width="1.5"/>
                  <path d="M10 6a2 2 0 110 4 2 2 0 010-4z" fill="%233b82f6"/>
                  <path d="M4 10h2" stroke="%233b82f6" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M14 10h2" stroke="%233b82f6" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M10 4v2" stroke="%233b82f6" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M10 14v2" stroke="%233b82f6" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
            <h3 className="font-metrics text-3xl text-velocity-blue font-bold">
              10K+
            </h3>
            <p className="mt-2 text-text-muted text-sm">
              Services Accelerated
            </p>
          </div>

          {/* Time Saved */}
          <div className="metrics-container p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-insight-cyan/10 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="%2306b6d4" stroke-width="1.5"/>
                  <path d="M10 2L10 6" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round"/>
                  <path d="M10 14L10 18" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round"/>
                  <path d="M2 10L6 10" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round"/>
                  <path d="M14 10L18 10" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round"/>
                  <path d="M5.41 5.41L7.5 7.5" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round"/>
                  <path d="M16.5 16.5L14.41 14.41" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round"/>
                  <path d="M7.5 7.5L5.41 5.41" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round"/>
                  <path d="M14.41 14.41L16.5 16.5" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
            <h3 className="font-metrics text-3xl text-insight-cyan font-bold">
              250K+
            </h3>
            <p className="mt-2 text-text-muted text-sm">
              Hours Saved Monthly
            </p>
          </div>

          {/* Efficiency Gain */}
          <div className="metrics-container p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-efficiency-green/10 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10h16M2 10l4 4 6-6" stroke="%2310b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <h3 className="font-metrics text-3xl text-efficiency-green font-bold">
              3x
            </h3>
            <p className="mt-2 text-text-muted text-sm">
              Average Efficiency Gain
            </p>
          </div>

          {/* Uptime */}
          <div className="metrics-container p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-warning-amber/10 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="%23f59e0b" stroke-width="1.5"/>
                  <path d="M12 8v4l2 2" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <h3 className="font-metrics text-3xl text-warning-amber font-bold">
              99.9%
            </h3>
            <p className="mt-2 text-text-muted text-sm">
              Platform Uptime
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 flex flex-col sm:flex-row sm:justify-center gap-4 sm:gap-6">
          <Button variant="outline" href="#features">
            Explore Features
          </Button>
          <Button variant="primary" href="#cta">
            Start Free Trial
          </Button>
        </div>

        {/* Live Data Ticker (subtle motion indicator) */}
        <div className="mt-16 flex items-center justify-center space-x-6 text-text-muted">
          <div className="flex items-center space-x-2 animate-metric-pulse">
            <div className="w-2 h-2 bg-velocity-blue rounded-full" />
            <span className="text-xs font-metrics">Live: Processing 1,247 requests/sec</span>
          </div>
          <div className="w-1 h-[20px] bg-neutral-700/30" />
          <div className="flex items-center space-x-2">
            <span className="text-xs">Last optimized: 2m 14s ago</span>
          </div>
        </div>
      </section>
    </section>
  );
}