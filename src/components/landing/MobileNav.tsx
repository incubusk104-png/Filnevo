"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
];

// Compact hamburger menu for narrow viewports. The in-page anchor links are
// hidden on mobile in the desktop nav; this surfaces them behind a toggle so
// the navigation stays reachable on phones without crowding the bar.
export default function MobileNav() {
  const [open, setOpen] = useState(false);

  // Close on Escape and lock body scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="grid h-10 w-10 place-items-center rounded-lg border border-neutral-800/80 bg-neutral-900/40 text-neutral-200 transition-colors hover:border-neutral-700 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velocity-blue/50"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          {/* Click-away backdrop */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-16 z-40 cursor-default bg-background/60 backdrop-blur-sm"
          />
          <div
            id="mobile-nav-panel"
            className="enter absolute inset-x-0 top-16 z-50 origin-top border-b border-neutral-800/60 bg-background/95 px-6 py-4 shadow-2xl backdrop-blur-xl"
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 font-metrics text-base text-text-muted transition-colors hover:bg-neutral-900/60 hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
