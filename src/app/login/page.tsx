import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/auth/next";
import { Logo } from "@/components/shared/Logo";
import { LoginForm } from "./LoginForm";
import { VerifyForm } from "./VerifyForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

const assuranceItems = [
    "Email verification is required before account access.",
    "Google sign-in returns you to the landing page or selected plan.",
    "Once signed in, plan checkout will not ask you to log in again.",
];

// Reads searchParams (dynamic) — required to run on Edge for Cloudflare Pages.
export const runtime = "edge";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{
        error?: string;
        mode?: string;
        step?: string;
        email?: string;
        next?: string;
    }>;
}) {
    const { error, mode, step, email, next } = await searchParams;
    const configured = isSupabaseConfigured();
    const signupMode = mode === "signup";
    const verificationError = error === "verification";
    // Post-auth destination (e.g. the plan the visitor tried to pay for before
    // being asked to sign in). Sanitized again server-side in the auth actions.
    const safeNext = safeNextPath(next);

    // The email verification step is rendered on this same route (rather than a
    // dedicated /login/verify page) so the auth flow ships as a single Edge
    // function — keeping the Cloudflare Worker bundle under the size limit.
    const verifyMode = step === "verify";
    if (verifyMode && !email) redirect("/login?mode=signup");

    // Password recovery shares this route too (same single-Edge-function reason),
    // split into two steps: request a code (`forgot`) then set a new one (`reset`).
    const forgotMode = step === "forgot";
    const resetMode = step === "reset";
    if (resetMode && !email) redirect("/login?step=forgot");

    return (
        <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
            {/* Atmosphere */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 grid-mask" />
                <div className="aurora aurora-blue left-1/2 top-[-10%] h-72 w-72 -translate-x-1/2" />
                <div className="aurora aurora-cyan bottom-[-15%] right-[5%] h-64 w-64" />
            </div>

            <div className="relative grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,28rem)_minmax(20rem,1fr)]">
                <div className="w-full rounded-2xl border border-hairline bg-neutral-950/70 p-8 shadow-2xl backdrop-blur-xl enter">
                    <a
                        href="/"
                        className="inline-flex"
                        aria-label="Filnevo home"
                    >
                        <Logo size={40} withWordmark />
                    </a>

                    {verifyMode ? (
                        <>
                            <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight text-foreground">
                                Verify your email
                            </h1>
                            <p className="mt-1.5 font-body text-sm text-text-muted">
                                Enter the 6-digit code we sent to{" "}
                                <span className="text-neutral-200">
                                    {email}
                                </span>{" "}
                                to activate your free trial.
                            </p>

                            {!configured && (
                                <p className="mt-4 flex items-center gap-2 rounded-md border border-hairline bg-neutral-900/50 px-3 py-2 font-body text-xs text-text-muted">
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning-amber" />
                                    Demo mode — any 6-digit code is accepted
                                    until Supabase is configured.
                                </p>
                            )}

                            <VerifyForm
                                email={email as string}
                                next={safeNext}
                            />
                        </>
                    ) : forgotMode ? (
                        <>
                            <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight text-foreground">
                                Reset your password
                            </h1>
                            <p className="mt-1.5 font-body text-sm text-text-muted">
                                Enter your account email and we&apos;ll send a
                                6-digit verification code to reset your
                                password.
                            </p>

                            {!configured && (
                                <p className="mt-4 flex items-center gap-2 rounded-md border border-hairline bg-neutral-900/50 px-3 py-2 font-body text-xs text-text-muted">
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning-amber" />
                                    Demo mode — password reset is simulated
                                    until Supabase is configured.
                                </p>
                            )}

                            <ForgotPasswordForm next={safeNext} />
                        </>
                    ) : resetMode ? (
                        <>
                            <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight text-foreground">
                                Set a new password
                            </h1>
                            <p className="mt-1.5 font-body text-sm text-text-muted">
                                Enter the 6-digit code we sent to{" "}
                                <span className="text-neutral-200">
                                    {email}
                                </span>{" "}
                                and choose a new password for your account.
                            </p>

                            {!configured && (
                                <p className="mt-4 flex items-center gap-2 rounded-md border border-hairline bg-neutral-900/50 px-3 py-2 font-body text-xs text-text-muted">
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning-amber" />
                                    Demo mode — any 6-digit code is accepted
                                    until Supabase is configured.
                                </p>
                            )}

                            <ResetPasswordForm
                                email={email as string}
                                next={safeNext}
                            />
                        </>
                    ) : (
                        <>
                            <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight text-foreground">
                                {signupMode
                                    ? "Start your free trial"
                                    : "Welcome to Filnevo"}
                            </h1>
                            <p className="mt-1.5 font-body text-sm text-text-muted">
                                {signupMode
                                    ? "Create your free account — 5 document scans every month, no credit card required."
                                    : "Sign in to your account, or create a new one to get started."}
                            </p>

                            {!configured && (
                                <p className="mt-4 flex items-center gap-2 rounded-md border border-hairline bg-neutral-900/50 px-3 py-2 font-body text-xs text-text-muted">
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning-amber" />
                                    Demo mode — sign-in is simulated until
                                    Supabase is configured.
                                </p>
                            )}
                            {error === "oauth" && (
                                <p className="mt-4 rounded-md border border-alert-red/40 bg-alert-red/10 px-3 py-2 font-body text-xs text-alert-red">
                                    Google sign-in failed or was cancelled.
                                    Please try again.
                                </p>
                            )}
                            {verificationError && (
                                <p className="mt-4 rounded-md border border-warning-amber/40 bg-warning-amber/10 px-3 py-2 font-body text-xs text-warning-amber">
                                    We could not confirm this email. Please use
                                    the verification code flow or sign in with a
                                    verified Google account.
                                </p>
                            )}

                            <LoginForm
                                signupMode={signupMode}
                                next={safeNext}
                            />
                        </>
                    )}
                </div>

                <aside className="rounded-2xl border border-hairline bg-neutral-950/50 p-6 shadow-2xl backdrop-blur-xl lg:p-8">
                    <p className="font-metrics text-[11px] font-semibold uppercase tracking-[0.22em] text-insight-cyan">
                        Customer assurance
                    </p>
                    <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight text-foreground">
                        Verify once. Then choose your plan without repeating
                        login.
                    </h2>
                    <p className="mt-3 font-body text-sm leading-6 text-text-muted">
                        Filnevo keeps signup strict, then keeps checkout smooth:
                        verified customers return to the landing page or the
                        exact plan they selected.
                    </p>
                    <ul className="mt-6 space-y-3">
                        {assuranceItems.map((item) => (
                            <li
                                key={item}
                                className="flex gap-3 font-body text-sm text-neutral-300"
                            >
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-efficiency-green" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <a
                        href="/#pricing"
                        className="btn-anim mt-7 inline-flex min-h-11 items-center rounded-md border border-neutral-700 px-4 py-2 font-metrics text-sm font-medium text-neutral-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-insight-cyan/60 hover:text-insight-cyan"
                    >
                        View plans after sign-in
                    </a>
                </aside>
            </div>
        </main>
    );
}
