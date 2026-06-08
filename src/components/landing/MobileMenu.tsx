"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
];

// Compact nav for small screens: the in-page section links are hidden on mobile
// in the main bar, so this hamburger reveals them in a dropdown sheet. Hidden
// from `md` up, where the inline links take over.
export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the sheet is open and close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
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
        className="press-effect grid h-10 w-10 place-items-center rounded-lg border border-neutral-800/80 bg-neutral-900/40 text-neutral-200 transition-all duration-200 hover:border-velocity-blue/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velocity-blue/50"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-16 z-40 cursor-default bg-background/60 backdrop-blur-sm"
          />
          <div
            role="menu"
            className="enter absolute inset-x-0 top-16 z-50 border-b border-neutral-800/60 bg-background/95 px-6 py-4 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-6xl flex-col">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="press-effect rounded-lg px-3 py-3 font-metrics text-sm text-text-muted transition-colors hover:bg-neutral-900/60 hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
