import { Button } from "@/components/shared/Button";
import { Logo } from "@/components/shared/Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/60 bg-background/70 backdrop-blur-xl">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8"
      >
        {/* Brand */}
        <a href="#top" className="flex items-center" aria-label="Filnevo home">
          <Logo size={32} withWordmark />
        </a>

        {/* In-page nav links (anchors exist on the landing page) */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="font-metrics text-sm text-text-muted transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="font-metrics text-sm text-text-muted transition-colors hover:text-foreground"
          >
            Pricing
          </a>
          <a
            href="#testimonials"
            className="font-metrics text-sm text-text-muted transition-colors hover:text-foreground"
          >
            Testimonials
          </a>
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" href="/login">
            Sign In
          </Button>
          <Button variant="primary" size="sm" href="/login?mode=signup">
            Sign Up
          </Button>
        </div>
      </nav>
    </header>
  );
}
