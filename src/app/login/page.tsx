import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/Logo";
import { LoginForm } from "./LoginForm";

// Reads searchParams (dynamic) — required to run on Edge for Cloudflare Pages.
export const runtime = "edge";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const { error, mode } = await searchParams;
  const configured = isSupabaseConfigured();
  const signupMode = mode === "signup";

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      {/* Atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 grid-mask" />
        <div className="aurora aurora-blue left-1/2 top-[-10%] h-72 w-72 -translate-x-1/2" />
        <div className="aurora aurora-cyan bottom-[-15%] right-[5%] h-64 w-64" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-hairline bg-neutral-950/70 p-8 shadow-2xl backdrop-blur-xl enter">
        <a href="/" className="inline-flex" aria-label="Filnevo home">
          <Logo size={40} withWordmark />
        </a>

        <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight text-foreground">
          {signupMode ? "Start your free trial" : "Welcome to Filnevo"}
        </h1>
        <p className="mt-1.5 font-body text-sm text-text-muted">
          {signupMode
            ? "Create your free account — 5 document scans every month, no credit card required."
            : "Sign in to your account, or create a new one to get started."}
        </p>

        {!configured && (
          <p className="mt-4 flex items-center gap-2 rounded-md border border-hairline bg-neutral-900/50 px-3 py-2 font-body text-xs text-text-muted">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning-amber" />
            Demo mode — sign-in is simulated until Supabase is configured.
          </p>
        )}
        {error === "oauth" && (
          <p className="mt-4 rounded-md border border-alert-red/40 bg-alert-red/10 px-3 py-2 font-body text-xs text-alert-red">
            Google sign-in failed or was cancelled. Please try again.
          </p>
        )}

        <LoginForm signupMode={signupMode} />
      </div>
    </main>
  );
}
