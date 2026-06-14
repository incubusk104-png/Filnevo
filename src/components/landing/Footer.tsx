import { Logo } from "@/components/shared/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800/60 bg-background py-12">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo size={32} withWordmark />
            <p className="text-sm text-text-muted">
              Automating BIR tax compliance for modern businesses.
            </p>
          </div>

          {/* Social & Legal */}
          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex items-center gap-6">
              <a
                href="https://facebook.com/filnevo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted transition-colors hover:text-velocity-blue"
                aria-label="Follow us on Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com/filnevo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted transition-colors hover:text-insight-cyan"
                aria-label="Follow us on Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
            </div>

            <p className="text-xs text-text-faint font-metrics">
              &copy; 2026 Filnevo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
