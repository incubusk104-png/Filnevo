"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { resendCode, verifyEmail, type AuthState } from "./actions";

// Step 2 of manual sign-up: the user enters the 6-digit code Supabase emailed.
// `verifyEmail` confirms it server-side (verifyOtp), which establishes the
// session and redirects home.
export function VerifyForm({ email }: { email: string }) {
  const [verifyState, verifyAction, verifying] = useActionState<AuthState, FormData>(
    verifyEmail,
    null,
  );
  const [resendState, resendAction, resending] = useActionState<AuthState, FormData>(
    resendCode,
    null,
  );

  const error = verifyState?.error ?? resendState?.error;
  const notice = resendState?.notice;
  const busy = verifying || resending;

  return (
    <div className="mt-7 space-y-4">
      <form action={verifyAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <label className="block">
          <span className="font-metrics text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
            Verification code
          </span>
          <input
            name="token"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            autoFocus
            placeholder="••••••"
            className="form-input mt-1.5 text-center font-data text-lg tracking-[0.5em]"
          />
        </label>

        {error && (
          <p className="rounded-md border border-alert-red/40 bg-alert-red/10 px-3 py-2 font-body text-xs text-alert-red">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-md border border-insight-cyan/40 bg-insight-cyan/10 px-3 py-2 font-body text-xs text-insight-cyan">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-velocity-blue px-4 py-2.5 font-metrics text-sm font-semibold text-neutral-50 transition-all hover:bg-velocity-blue/90 active:scale-[0.98] disabled:opacity-50"
        >
          {verifying ? "Verifying…" : "Verify email"}
        </button>
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

      <p className="flex items-center justify-center gap-1.5 pt-1 font-body text-[11px] text-text-faint">
        <Lock className="h-3 w-3" /> Your connection is encrypted.
      </p>
    </div>
  );
}
