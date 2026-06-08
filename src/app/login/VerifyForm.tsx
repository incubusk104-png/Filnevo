"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { Turnstile } from "@/components/captcha/Turnstile";
import { Notice } from "@/components/ui/Notice";
import { Button } from "@/components/shared/Button";
import { resendCode, verifyEmail, type AuthState } from "./actions";

// Step 2 of manual sign-up: the user enters the 6-digit code Supabase emailed.
// Order is enforced — the CAPTCHA must pass FIRST, which unlocks the code field
// and the submit. `verifyEmail` then re-checks the token server-side (and runs
// verifyOtp), establishing the session and redirecting home.
function StepBadge({ n, done }: { n: number; done?: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-metrics text-[10px] font-semibold transition-colors ${
        done
          ? "bg-efficiency-green/20 text-efficiency-green"
          : "bg-velocity-blue/15 text-velocity-blue"
      }`}
    >
      {n}
    </span>
  );
}

export function VerifyForm({ email }: { email: string }) {
  const [verifyState, verifyAction, verifying] = useActionState<AuthState, FormData>(
    verifyEmail,
    null,
  );
  const [resendState, resendAction, resending] = useActionState<AuthState, FormData>(
    resendCode,
    null,
  );

  const [captchaOk, setCaptchaOk] = useState(false);
  const error = verifyState?.error ?? resendState?.error;
  const notice = resendState?.notice;
  const busy = verifying || resending;

  return (
    <div className="mt-7 space-y-4">
      <form action={verifyAction} className="space-y-5">
        <input type="hidden" name="email" value={email} />

        {/* Step 1 — human verification (must pass before the code is accepted) */}
        <div className="space-y-2">
          <span className="flex items-center gap-2 font-metrics text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
            <StepBadge n={1} done={captchaOk} /> Verify you&apos;re human
          </span>
          <Turnstile
            action="signup-verify"
            onVerify={() => setCaptchaOk(true)}
            onExpire={() => setCaptchaOk(false)}
          />
        </div>

        {/* Step 2 — enter the emailed code (locked until step 1 passes) */}
        <label
          className={`block transition-opacity ${captchaOk ? "opacity-100" : "opacity-50"}`}
        >
          <span className="flex items-center gap-2 font-metrics text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
            <StepBadge n={2} /> Verification code
          </span>
          <input
            name="token"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            disabled={!captchaOk}
            placeholder="••••••"
            className="form-input mt-1.5 text-center font-data text-lg tracking-[0.5em] disabled:cursor-not-allowed"
          />
        </label>

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

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={busy || !captchaOk}
          className="w-full"
        >
          {verifying ? "Verifying…" : captchaOk ? "Verify email" : "Complete verification first"}
        </Button>
      </form>

      <div className="flex items-center justify-between font-body text-[11px] text-text-muted">
        <form action={resendAction}>
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            disabled={busy}
            className="font-metrics uppercase tracking-[0.14em] text-insight-cyan transition-colors hover:text-insight-cyan/80 disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </form>
        <a
          href="/login?mode=signup"
          className="transition-colors hover:text-neutral-200"
        >
          Use a different email
        </a>
      </div>

      <a
        href="/"
        className="group flex w-full items-center justify-center gap-1.5 rounded-md px-4 py-2 font-metrics text-xs font-medium text-text-muted transition-colors hover:text-neutral-200"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to home
      </a>

      <p className="flex items-center justify-center gap-1.5 pt-1 font-body text-[11px] text-text-faint">
        <Lock className="h-3 w-3" /> Your connection is encrypted.
      </p>
    </div>
  );
}
