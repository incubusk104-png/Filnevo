"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Lock, X } from "lucide-react";
import {
  signIn,
  signInWithGoogle,
  signUp,
  type AuthState,
} from "./actions";
import { checkPassword } from "@/lib/auth/password";
import { Notice } from "@/components/ui/Notice";
import { Button } from "@/components/shared/Button";

// Strength meter colours mapped to the Precision Metrics status palette.
const METER_COLORS = [
  "bg-alert-red",
  "bg-alert-red",
  "bg-warning-amber",
  "bg-insight-cyan",
  "bg-efficiency-green",
];

export function LoginForm({
  signupMode = false,
  next = "/",
}: {
  signupMode?: boolean;
  next?: string;
}) {
  const nextQuery = next !== "/" ? `&next=${encodeURIComponent(next)}` : "";
  const [signInState, signInAction, signingIn] = useActionState<AuthState, FormData>(signIn, null);
  const [signUpState, signUpAction, signingUp] = useActionState<AuthState, FormData>(signUp, null);
  const [googleState, googleAction, googlePending] = useActionState<AuthState, FormData>(signInWithGoogle, null);

  const [password, setPassword] = useState("");
  const [showRules, setShowRules] = useState(signupMode);

  // OAuth navigation happens client-side: the server action returns the Google
  // authorization URL (redirecting to an external URL from within a Server
  // Action 500s on the Cloudflare Edge runtime).
  useEffect(() => {
    if (googleState?.redirectTo) {
      window.location.assign(googleState.redirectTo);
    }
  }, [googleState]);

  const error = signInState?.error ?? signUpState?.error ?? googleState?.error;
  const notice = signUpState?.notice;
  const pending = signingIn || signingUp || googlePending;

  const strength = checkPassword(password);
  const showMeter = showRules || password.length > 0;

  return (
    <div className="mt-7 space-y-4">
      {/* Google OAuth */}
      <form action={googleAction}>
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          disabled={pending}
          className="btn-anim flex w-full items-center justify-center gap-2.5 rounded-md border border-neutral-700 bg-neutral-900/40 px-4 py-2.5 font-metrics text-sm font-medium text-neutral-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-600 hover:bg-neutral-800/40 hover:shadow-md hover:shadow-black/30 disabled:pointer-events-none disabled:opacity-50"
        >
          <GoogleIcon />
          {googlePending ? "Connecting…" : "Continue with Google"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="font-metrics text-[10px] uppercase tracking-[0.2em] text-text-faint">
          or continue with email
        </span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <form className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block">
          <span className="font-metrics text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="form-input mt-1.5 text-sm"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="font-metrics text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            autoComplete={signupMode ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setShowRules(true)}
            className="form-input mt-1.5 text-sm"
            placeholder="Enter your password"
          />
        </label>

        {/* Strength meter + rules guidance — steers new sign-ups toward a
            secure password. */}
        {showMeter && (
          <div className="space-y-2 rounded-md border border-hairline bg-neutral-900/40 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`flex-1 rounded-full transition-colors ${
                      i < strength.score ? METER_COLORS[strength.score] : "bg-neutral-700"
                    }`}
                  />
                ))}
              </div>
              <span className="font-metrics text-[10px] uppercase tracking-[0.18em] text-text-muted">
                {strength.label}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
              {strength.rules.map((rule) => (
                <li key={rule.id} className="flex items-center gap-1.5 font-body text-[11px]">
                  {rule.met ? (
                    <Check className="h-3 w-3 shrink-0 text-efficiency-green" />
                  ) : (
                    <X className="h-3 w-3 shrink-0 text-text-faint" />
                  )}
                  <span className={rule.met ? "text-neutral-300" : "text-text-faint"}>
                    {rule.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <Notice key={error} variant="error">
            {error}
          </Notice>
        )}
        {notice && (
          <Notice key={notice} variant="success">
            {notice}
          </Notice>
        )}

        {/* Primary action for the current mode. */}
        <div className="pt-1">
          <Button
            variant="primary"
            formAction={signupMode ? signUpAction : signInAction}
            disabled={pending}
            className="group w-full"
          >
            {signupMode
              ? signingUp
                ? "Creating account…"
                : "Create account"
              : signingIn
                ? "Signing in…"
                : "Sign In"}
            {!pending && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </Button>
        </div>

        {/* Instant mode switch — a client-side <Link> swaps to the other auth
            screen without a full reload, so clicking "Sign in" / "Create an
            account" lands you straight on that screen. */}
        <p className="text-center font-body text-sm text-text-muted">
          {signupMode ? "Already have an account? " : "New to Filnevo? "}
          <Link
            href={
              signupMode
                ? `/login${nextQuery ? `?${nextQuery.slice(1)}` : ""}`
                : `/login?mode=signup${nextQuery}`
            }
            prefetch
            className="auth-toggle-link"
          >
            {signupMode ? "Sign in" : "Create an account"}
          </Link>
        </p>

        <div className="flex flex-col items-center gap-3 pt-1">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 font-metrics text-xs text-text-muted transition-colors hover:text-neutral-200"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>
          <p className="flex items-center justify-center gap-1.5 font-body text-[11px] text-text-faint">
            <Lock className="h-3 w-3" /> Your connection is encrypted.
          </p>
        </div>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
