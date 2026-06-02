import { Button } from "@/components/shared/Button";

export default function FeaturesSection() {
  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      {/* Background - subtle data grid pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><rect width=%2240%22 height=%2240%22 fill=%22none%22/><path d=%22M0 20L40 20M20 0L20 40%22 stroke=%22%231e293b%22 stroke-width=%220.5%22 opacity=%220.08%22/></svg>')]"/>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 tracking-tight">
            Purpose-Built for Service Speed Optimization
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Every feature is designed to measure, analyze, and accelerate service delivery
            through precision analytics and intelligent automation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">

          {/* Feature 1: Real-Time Analytics Dashboard */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-velocity-blue/10 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 13.5a9 9 0 019.236-8.5l3.406 3.406a7.032 7.032 0 009.918-.006l3.406 3.406A9 9 0 0120.5 21.5a9 9 0 01-6.421-2.778l-1.415-1.415A7.032 7.032 0 009.172 15.236l-3.406-3.406A9 9 0 014 13.5z" fill="%233b82f6" opacity="0.2"/>
                  <path d="M9.172 15.236l-1.415-1.415A7.032 7.032 0 004.146 13.821a7 7 0 009.918.006l3.406-3.406a7 7 0 009.918-.006l3.406 3.406A7 7 0 0019.854 10.179l1.415 1.415A9 9 0 0115.421 13.5a9 9 0 01-6.249 1.736z" fill="%233b82f6"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-velocity-blue font-semibold mb-2">
                  Real-Time Analytics Dashboard
                </h3>
                <p className="text-text-muted">
                  Monitor service performance with live metrics, bottleneck identification,
                  and predictive optimization recommendations. Track latency, throughput,
                  and error rates across all service touchpoints.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-info">Live Metrics</span>
                  <span className="badge badge-success">Predictive Analytics</span>
                  <span className="badge badge-info">Custom Dashboards</span>
                </div>
              </div>
            </div>
          </article>

          {/* Feature 2: Automated Workflow Optimizer */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-insight-cyan/10 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7l9 6 9-6" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M3 12l9 6 9-6" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M3 17l9 6 9-6" stroke="%2306b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-insight-cyan font-semibold mb-2">
                  Automated Workflow Optimizer
                </h3>
                <p className="text-text-muted">
                  Intelligently analyze and optimize service workflows by identifying
                  inefficiencies, redundant steps, and automation opportunities.
                  Reduce service delivery time through intelligent process optimization.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-success">Process Mining</span>
                  <span className="badge badge-info">Automation Suggestions</span>
                  <span className="badge badge-success">Bottleneck Detection</span>
                </div>
              </div>
            </div>
          </article>

          {/* Feature 3: Intelligent Load Balancer */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-efficiency-green/10 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4a8 8 0 018 8v8a4 4 0 11-8 0v-4a4 4 0 10-8 0v4a4 4 0 11-8 0V12a8 8 0 018-8z" fill="%2310b981" opacity="0.2"/>
                  <path d="M12 4v12" stroke="%2310b981" stroke-width="2" stroke-linecap="round"/>
                  <path d="M8 12h4" stroke="%2310b981" stroke-width="2" stroke-linecap="round"/>
                  <path d="M16 8h-4" stroke="%2310b981" stroke-width="2" stroke-linecap="round"/>
                  <path d="M12 20h.01" stroke="%2310b981" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-efficiency-green font-semibold mb-2">
                  Intelligent Load Balancer
                </h3>
                <p className="text-text-muted">
                  Dynamically distribute service requests across optimal resources
                  based on real-time performance metrics, ensuring consistent
                  response times and maximum throughput under variable loads.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-warning">Dynamic Routing</span>
                  <span className="badge badge-success">Resource Optimization</span>
                  <span className="badge badge-warning">Traffic Shaping</span>
                </div>
              </div>
            </div>
          </article>

          {/* Feature 4: Service Performance Predictor */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-warning-amber/10 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a2 2 0 00-2 2v1a4 4 0 00-.592 2.5l-.894 1.789a2 2 0 011.489 1.638l1.898.473a2 2 0 002 0l1.898-.473a2 2 0 011.489-1.638l-.894-1.789A4 4 0 0014 4V4a2 2 0 00-2-2z" fill="%23f59e0b" opacity="0.2"/>
                  <path d="M12 2v2" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round"/>
                  <path d="M12 12v2" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round"/>
                  <path d="M4.93 8.93l.707.707" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round"/>
                  <path d="M16.24 12.29l-.707-.707" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round"/>
                  <path d="M5.76 5.76l.707.707" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round"/>
                  <path d="M17.66 15.63l-.707-.707" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-warning-amber font-semibold mb-2">
                  Service Performance Predictor
                </h3>
                <p className="text-text-muted">
                  Forecast service performance trends and capacity needs using
                  machine learning models trained on historical data.
                  Proactively scale resources before performance degradation occurs.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-info">ML Forecasting</span>
                  <span className="badge badge-success">Capacity Planning</span>
                  <span className="badge badge-warning">Trend Analysis</span>
                </div>
              </div>
            </div>
          </article>

          {/* Feature 5: API Gateway & Rate Limiter */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-alert-red/10 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.252a9 9 0 100 18 9 9 0 000-18zm0 2.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13z" fill="%23ef4444" opacity="0.2"/>
                  <path d="M12 8v4l3 3" stroke="%23ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-alert-red font-semibold mb-2">
                  Enterprise API Gateway
                </h3>
                <p className="text-text-muted">
                  Secure, high-performance API gateway with intelligent rate limiting,
                  request/response transformation, and detailed analytics.
                  Protect and optimize all service-to-service communications.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-error">Rate Limiting</span>
                  <span className="badge badge-info">Request Transformation</span>
                  <span className="badge badge-error">Security Policies</span>
                </div>
              </div>
            </div>
          </article>

          {/* Feature 6: Collaborative Service Designer */}
          <article className="data-card p-8 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-neutral-800/30 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 11h2M7 11h2M11 11h2M15 11h2M19 11h2M5 6h2M9 6h2M13 6h2M17 6h2" stroke="%2364748b" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M5 16h2M9 16h2M13 16h2M17 16h2M21 16h-2" stroke="%2364748b" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-metrics text-xl text-neutral-100 font-semibold mb-2">
                  Collaborative Service Designer
                </h3>
                <p className="text-text-muted">
                  Visually design and optimize service workflows with drag-and-drop
                  interface, real-time validation, and team collaboration features.
                  Rapidly prototype and deploy service optimizations.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-info">Drag & Drop</span>
                  <span className="badge badge-success">Real-Time Validation</span>
                  <span className="badge badge-info">Team Collaboration</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Call to Action Section */}
        <div className="mt-20 text-center">
          <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-6">
            Ready to accelerate your service delivery?
          </h3>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">
            Start optimizing your services today with our precision-engineered
            platform designed for maximum speed and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4 sm:gap-6">
            <Button variant="outline" href="#pricing">
              See Pricing Plans
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
