import { isSupabaseConfigured } from "@/lib/supabase/client";
import { LoginForm } from "./LoginForm";

// Reads searchParams (dynamic) — required to run on Edge for Cloudflare Pages.
export const runtime = "edge";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-hairline bg-obsidian-700/70 p-8 backdrop-blur">
        <p className="font-ledger text-[11px] uppercase tracking-[0.32em] text-gold/80">
          Filnevo · Secure Access
        </p>
        <h1 className="mt-1 font-serif-display text-3xl text-ink text-glow-gold">
          Secure Access
        </h1>
        <p className="mt-2 font-nav text-sm text-ink-dim">
          Authenticate to enter the compliance console.
        </p>

        {!configured && (
          <p className="mt-4 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 font-ledger text-xs text-amber-300">
            Demo mode — Supabase isn’t configured, so authentication is simulated.
            Set the Supabase env vars to enable live sign in / sign up.
          </p>
        )}
        {error === "oauth" && (
          <p className="mt-4 rounded-md border border-ruby/50 bg-ruby/10 px-3 py-2 font-ledger text-xs text-ruby">
            Google sign-in failed or was cancelled. Please try again.
          </p>
        )}

        <LoginForm />
      </div>
    </main>
  );
}
