"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Mail } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { createClient, isSupabaseConfiguredClient } from "@/lib/supabase/client";

// Multi-colour Google "G" so a Google-authenticated session is recognisable at
// a glance (lucide ships no brand mark for Google).
function GoogleGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className={className}>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

// Human-readable label + icon for the auth method behind the session, derived
// from Supabase `app_metadata.provider` ("google", "email", …).
function providerMeta(provider: string | null) {
  if (provider === "google") {
    return { label: "Google account", icon: <GoogleGlyph className="h-3.5 w-3.5" /> };
  }
  return { label: "Email & password", icon: <Mail className="h-3.5 w-3.5 text-text-muted" /> };
}

// Auth-aware navbar control. Keeps the landing page static while reflecting the
// signed-in session client-side: logged-out visitors see Sign In / Sign Up, a
// signed-in user sees their account (and how they signed in) with a Sign out
// menu.
export default function NavAuth() {
  const [email, setEmail] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSupabaseConfiguredClient()) return;
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setEmail(data.user?.email ?? null);
      setProvider(data.user?.app_metadata?.provider ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setProvider(session?.user?.app_metadata?.provider ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    if (isSupabaseConfiguredClient()) {
      await createClient().auth.signOut();
    }
    window.location.assign("/");
  }

  // Default (and while the session resolves): the public auth actions.
  if (!email) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" href="/login">
          Sign In
        </Button>
        <Button variant="primary" size="sm" href="/login?mode=signup">
          Sign Up
        </Button>
      </div>
    );
  }

  const initial = email.trim().charAt(0).toUpperCase() || "U";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="group flex items-center gap-2 rounded-full border border-neutral-800/80 bg-neutral-900/40 py-1 pl-1 pr-2.5 transition-colors hover:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velocity-blue/50"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-velocity-blue to-insight-cyan font-metrics text-xs font-semibold text-neutral-50">
          {initial}
        </span>
        <span className="hidden max-w-[11rem] truncate font-metrics text-sm text-neutral-200 sm:block">
          {email}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="enter absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-hairline bg-neutral-950/95 shadow-2xl backdrop-blur-xl"
        >
          <div className="border-b border-hairline px-4 py-3">
            <p className="font-metrics text-[10px] uppercase tracking-[0.18em] text-text-faint">
              Signed in as
            </p>
            <p className="mt-1 truncate font-body text-sm text-neutral-200">
              {email}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-neutral-900/50 px-2 py-0.5 font-metrics text-[11px] text-text-muted">
              {providerMeta(provider).icon}
              {providerMeta(provider).label}
            </span>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left font-metrics text-sm text-neutral-200 transition-colors hover:bg-neutral-900/70 hover:text-alert-red disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
