export default function ArchitectureSection() {
  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      {/* Background - subtle circuit/data flow pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><rect width=%2260%22 height=%2260%22 fill=%22none%22/><path d=%22M0 30Q15 20 30 30T60 30%22 stroke=%22%231e293b%22 stroke-width=%220.5%22 opacity=%220.06%22 fill=%22none%22/></svg>')]"/>
        <div className="absolute inset-0 animate-data-flow" aria-hidden="true"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 tracking-tight">
            Precision Architecture for Service Speed
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Every component is engineered for minimal latency, maximum throughput,
            and intelligent optimization—working together to accelerate service delivery.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="relative">
          {/* Main visualization */}
          <div className="relative h-[500px]">
            {/* Background grid */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 vault-grid opacity-[0.08]" />
            </div>

            {/* Data flow connections */}
            <div className="absolute inset-0 pointer-events-none">
              {/* API Gateway to Load Balancer */}
              <div className="absolute left-16 top-20 w-[1px] h-[80px] bg-gradient-to-b from-transparent via-velocity-blue/20 to-velocity-blue" />
              {/* Load Balancer to Service Nodes */}
              <div className="absolute left-16 top-100 w-[1px] h-[120px] bg-gradient-to-b from-transparent via-insight-cyan/20 to-insight-cyan" />
              {/* Service Nodes to Database */}
              <div className="absolute left-16 top-220 w-[1px] h-[80px] bg-gradient-to-b from-transparent via-efficiency-green/20 to-efficiency-green" />
              {/* Analytics Feed */}
              <div className="absolute left-16 top-160 w-[1px] h-[60px] bg-gradient-to-b from-transparent via-warning-amber/20 to-warning-amber" />
              {/* Designer to Workflow Optimizer */}
              <div className="absolute right-16 top-80 w-[1px] h-[100px] bg-gradient-to-b from-transparent via-insight-cyan/20 to-insight-cyan" />
            </div>

            {/* Components */}
            {/* API Gateway */}
            <div className="absolute left-10 top-20">
              <div className="data-card p-6 w-64">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-alert-red/10 rounded-xl flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 2a2 2 0 100 4 2 2 0 000-4zm0 1a1 1 0 110 2 1 1 0 000-2zm4 6a1 1 0 100 2 1 1 0 000-2zm-4 0a1 1 0 100 2 1 1 0 000-2zm2-4a1 1 0 100 2 1 1 0 000-2z" fill="%23ef4444" opacity="0.2"/>
                      <path d="M4 4h8v8H4V4zm1 1H6v6h2V5zm0 4H6v2h2V9z" fill="%23ef4444"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-metrics text-sm text-alert-red font-semibold mb-1">
                      API Gateway
                    </h3>
                    <p className="text-xs text-text-muted">
                      Secure entry point with rate limiting,
                      request transformation, and analytics
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-velocity-blue/80">99.99%</span>
                  <span className="text-velocity-blue">uptime</span>
                </div>
              </div>
            </div>

            {/* Load Balancer */}
            <div className="absolute left-10 top={100}">
              <div className="data-card p-6 w-64">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-insight-cyan/10 rounded-xl flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 2a2 2 0 100 4 2 2 0 000-4zm0 1a1 1 0 110 2 1 1 0 000-2zm4 6a1 1 0 100 0 2 1 1 0 000-2zm-4 0a1 1 0 100 0 2 1 1 0 000-2zm2-4a1 1 0 100 0 2 1 1 0 000-2z" fill="%2306b6d4" opacity="0.2"/>
                      <path d="M4 8h8M4 12h8M8 4v8" stroke="%2306b6d4" stroke-width="1.5"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-metrics text-sm text-insight-cyan font-semibold mb-1">
                      Intelligent Load Balancer
                    </h3>
                    <p className="text-xs text-text-muted">
                      Dynamic routing based on real-time
                      performance and resource utilization
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-insight-cyan/80">2.1ms</span>
                  <span className="text-insight-cyan">avg latency</span>
                </div>
              </div>
            </div>

            {/* Service Nodes */}
            <div className="absolute left-10 top={220}">
              <div className="data-card p-6 w-64">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-efficiency-green/10 rounded-xl flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 8a6 6 0 0112 0a5.989 5.989 0 00-.456-.078A6 6 0 012 8zM8 0a4 4 0 100 8 4 4 0 000-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="%2310b981" opacity="0.2"/>
                      <path d="M4 4h8v4H4V4zm0 4h8v4H4v-4z" fill="%2310b981"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-metrics text-sm text-efficiency-green font-semibold mb-1">
                      Optimized Service Nodes
                    </h3>
                    <p className="text-xs text-text-muted">
                      Auto-scaled compute resources with
                      performance-optimized configurations
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-efficiency-green/80">3x</span>
                  <span className="text-efficiency-green">efficiency</span>
                </div>
              </div>
            </div>

            {/* Database */}
            <div className="absolute left-10 top={300}">
              <div className="data-card p-6 w-64">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-warning-amber/10 rounded-xl flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 0a4 4 0 00-4 4v2a4 4 0 008 0V4a4 4 0 00-4-4zm0 12a4 4 0 100-8 4 4 0 000 8zM8 8a2 2 0 100-4 2 2 0 000 4z" fill="%23f59e0b" opacity="0.2"/>
                      <path d="M4 4h8v4H4V4zm0 4h8v4H4v-4z" fill="%23f59e0b"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-metrics text-sm text-warning-amber font-semibold mb-1">
                      Intelligent Data Layer
                    </h3>
                    <p className="text-xs text-text-muted">
                      Optimized querying with adaptive
                      caching and predictive prefetching
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-warning-amber/80">95%</span>
                  <span className="text-warning-amber">cache hit</span>
                </div>
              </div>
            </div>

            {/* Analytics Engine */}
            <div className="absolute left-10 top={160}">
              <div className="data-card p-6 w-64">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-velocity-blue/10 rounded-xl flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 2a6 6 0 016 6v2a2 2 0 01-4 0v-2a2 2 0 00-4 0v2a2 2 0 01-4 0v-2A6 6 0 018 2zM8 4a2 2 0 100 4 2 2 0 000-4zm0 6a2 2 0 100-4 2 2 0 000 4z" fill="%233b82f6" opacity="0.2"/>
                      <path d="M4 8h8M4 12h8" stroke="%233b82f6" stroke-width="1.5"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-metrics text-sm text-velocity-blue font-semibold mb-1">
                      Real-Time Analytics Engine
                    </h3>
                    <p className="text-xs text-text-muted">
                      Continuous performance monitoring with
                      bottleneck detection and optimization insights
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-velocity-blue/80">1K+</span>
                  <span className="text-velocity-blue">metrics/sec</span>
                </div>
              </div>
            </div>

            {/* Service Designer */}
            <div className="absolute right-10 top={80}">
              <div className="data-card p-6 w-64">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-neutral-800/30 rounded-xl flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 8h12M4 4h8M4 12h8" stroke="%2364748b" stroke-width="1.5"/>
                      <path d="M6 6h4M6 10h4" stroke="%2364748b" stroke-width="1.5"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-metrics text-sm text-neutral-100 font-semibold mb-1">
                      Collaborative Designer
                    </h3>
                    <p className="text-xs text-text-muted">
                      Visual workflow designer with drag-and-drop
                      interface and real-time validation
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-neutral-100/80">5x</span>
                  <span className="text-neutral-100">faster design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
