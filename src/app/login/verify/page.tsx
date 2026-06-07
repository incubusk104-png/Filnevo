import { redirect } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { VerifyForm } from "../VerifyForm";

// Reads searchParams (dynamic) — required to run on Edge for Cloudflare Pages.
export const runtime = "edge";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/login?mode=signup");

  const configured = isSupabaseConfigured();

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
          Verify your email
        </h1>
        <p className="mt-1.5 font-body text-sm text-text-muted">
          Enter the 6-digit code we sent to{" "}
          <span className="text-neutral-200">{email}</span> to activate your free
          trial.
        </p>

        {!configured && (
          <p className="mt-4 flex items-center gap-2 rounded-md border border-hairline bg-neutral-900/50 px-3 py-2 font-body text-xs text-text-muted">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning-amber" />
            Demo mode — any 6-digit code is accepted until Supabase is configured.
          </p>
        )}

        <VerifyForm email={email} />
      </div>
    </main>
  );
}
