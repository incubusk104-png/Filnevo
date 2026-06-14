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
                className="text-sm font-medium text-text-muted transition-colors hover:text-foreground"
              >
                Facebook
              </a>
              <a
                href="https://instagram.com/filnevo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-text-muted transition-colors hover:text-foreground"
              >
                Instagram
              </a>
            </div>

            <p className="text-xs text-text-faint font-metrics">
              &copy; {new Date().getFullYear()} Filnevo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
