import { Logo } from "@/components/shared/Logo";

export default function Footer() {
  return (
    <footer className="relative border-t border-neutral-800/60 bg-background pt-16 pb-8 overflow-hidden">
      {/* Subtle atmospheric background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="aurora aurora-blue absolute -bottom-32 left-1/2 -translate-x-1/2 h-64 w-96 opacity-20" />
      </div>

      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-12">
          {/* Brand & Tagline */}
          <div className="flex flex-col items-center gap-6">
            <Logo size={40} withWordmark />
            <p className="max-w-md text-base text-text-muted font-body leading-relaxed">
              Automating Document Capture and BIR Tax Compliance for the Philippines.
              Precision, Reliability, and Speed.
            </p>
          </div>

          {/* Navigation Links (Secondary) */}
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            <a href="#features" className="text-sm font-medium text-text-muted hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-text-muted hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium text-text-muted hover:text-foreground transition-colors">Testimonials</a>
            <a href="/login" className="text-sm font-medium text-text-muted hover:text-foreground transition-colors">Sign In</a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-8">
            <a
              href="https://facebook.com/filnevo"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-2 text-text-muted transition-all duration-300 hover:text-velocity-blue"
              aria-label="Follow us on Facebook"
            >
              <div className="absolute inset-0 rounded-full bg-velocity-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a
              href="https://instagram.com/filnevo"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-2 text-text-muted transition-all duration-300 hover:text-insight-cyan"
              aria-label="Follow us on Instagram"
            >
              <div className="absolute inset-0 rounded-full bg-insight-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
          </div>

          {/* Copyright & Divider */}
          <div className="w-full pt-8 mt-4 border-t border-neutral-800/40 flex flex-col items-center gap-4">
            <p className="text-xs text-text-faint font-metrics tracking-widest uppercase">
              &copy; 2026 Filnevo. Precision Document Automation.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
