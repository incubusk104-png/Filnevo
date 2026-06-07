"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { createClient, isSupabaseConfiguredClient } from "@/lib/supabase/client";

// Auth-aware navbar control. Keeps the landing page static while reflecting the
// signed-in session client-side: logged-out visitors see Sign In / Sign Up, a
// signed-in user sees their account with a Sign out menu.
export default function NavAuth() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSupabaseConfiguredClient()) return;
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) setEmail(data.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
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
