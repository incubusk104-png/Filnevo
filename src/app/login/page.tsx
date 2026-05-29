import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  // In demo mode (no Supabase) there is no auth gate — go straight to the console.
  if (!isSupabaseConfigured()) redirect("/");

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-hairline bg-obsidian-700/70 p-8 backdrop-blur">
        <p className="font-ledger text-[11px] uppercase tracking-[0.32em] text-gold/80">
          Caveat · Triple-Lock Vault
        </p>
        <h1 className="mt-1 font-serif-display text-3xl text-ink text-glow-gold">
          Secure Access
        </h1>
        <p className="mt-2 font-nav text-sm text-ink-dim">
          Authenticate to enter the security console.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
