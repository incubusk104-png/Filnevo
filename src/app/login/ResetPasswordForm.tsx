"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, Check, Lock, X } from "lucide-react";
import { Turnstile } from "@/components/captcha/Turnstile";
import { Notice } from "@/components/ui/Notice";
import { Button } from "@/components/shared/Button";
import { checkPassword } from "@/lib/auth/password";
import { resendResetCode, resetPassword, type AuthState } from "./actions";

// Strength meter colours mapped to the Precision Metrics status palette.
const METER_COLORS = [
  "bg-alert-red",
  "bg-alert-red",
  "bg-warning-amber",
  "bg-insight-cyan",
  "bg-efficiency-green",
];

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

// Final step of password recovery. Order is enforced: the CAPTCHA must pass
// first, which unlocks the code + new-password fields. `resetPassword` then
// re-checks everything server-side, runs verifyOtp({ type: "recovery" }) and
// updateUser to set the new password, establishing the session.
export function ResetPasswordForm({
  email,
  next = "/",
}: {
  email: string;
  next?: string;
}) {
  const [resetState, resetAction, resetting] = useActionState<AuthState, FormData>(
    resetPassword,
    null,
  );
  const [resendState, resendAction, resending] = useActionState<AuthState, FormData>(
    resendResetCode,
    null,
  );

  const [captchaOk, setCaptchaOk] = useState(false);
  const [password, setPassword] = useState("");
  const error = resetState?.error ?? resendState?.error;
  const notice = resendState?.notice;
  const busy = resetting || resending;

  const strength = checkPassword(password);
  const showMeter = password.length > 0;

  return (
    <div className="mt-7 space-y-4">
      <form action={resetAction} className="space-y-5">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next} />

        {/* Step 1 — human verification (must pass before the rest unlocks) */}
        <div className="space-y-2">
          <span className="flex items-center gap-2 font-metrics text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
            <StepBadge n={1} done={captchaOk} /> Verify you&apos;re human
          </span>
          <Turnstile
            action="password-reset"
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

        {/* Step 3 — choose a new password (locked until step 1 passes) */}
        <label
          className={`block transition-opacity ${captchaOk ? "opacity-100" : "opacity-50"}`}
        >
          <span className="flex items-center gap-2 font-metrics text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
            <StepBadge n={3} /> New password
          </span>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            disabled={!captchaOk}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input mt-1.5 text-sm disabled:cursor-not-allowed"
            placeholder="Enter a new password"
          />
        </label>

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

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={busy || !captchaOk}
          className="w-full"
        >
          {resetting ? "Resetting…" : captchaOk ? "Reset password" : "Complete verification first"}
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
          href="/login?step=forgot"
          className="transition-colors hover:text-neutral-200"
        >
          Use a different email
        </a>
      </div>

      <a
        href="/login"
        className="group flex w-full items-center justify-center gap-1.5 rounded-md px-4 py-2 font-metrics text-xs font-medium text-text-muted transition-colors hover:text-neutral-200"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to sign in
      </a>

      <p className="flex items-center justify-center gap-1.5 pt-1 font-body text-[11px] text-text-faint">
        <Lock className="h-3 w-3" /> Your connection is encrypted.
      </p>
    </div>
  );
}
