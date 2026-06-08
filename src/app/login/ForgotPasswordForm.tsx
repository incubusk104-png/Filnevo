"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { Turnstile } from "@/components/captcha/Turnstile";
import { Notice } from "@/components/ui/Notice";
import { Button } from "@/components/shared/Button";
import { requestPasswordReset, type AuthState } from "./actions";

// When Turnstile isn't configured (local/demo), skip the captcha gate.
const TURNSTILE_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Step 1 of password recovery: collect the account email. The action emails a
// 6-digit reset code and forwards to the reset step. To avoid leaking which
// addresses are registered, it always advances regardless of the result.
export function ForgotPasswordForm({ next = "/" }: { next?: string }) {
  const nextQuery = next !== "/" ? `&next=${encodeURIComponent(next)}` : "";
  const [state, action, pending] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    null,
  );
  // Turnstile token, forwarded to Supabase's recover endpoint as `captchaToken`.
  const [captchaSolved, setCaptchaSolved] = useState(false);
  const captchaOk = !TURNSTILE_ENABLED || captchaSolved;

  return (
    <div className="mt-7 space-y-4">
      <form action={action} className="space-y-4">
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

        {/* Human-verification gate (Cloudflare Turnstile). */}
        {TURNSTILE_ENABLED && (
          <Turnstile
            action="password-reset-request"
            onVerify={() => setCaptchaSolved(true)}
            onExpire={() => setCaptchaSolved(false)}
          />
        )}

        {state?.error && (
          <Notice key={state.error} variant="error">
            {state.error}
          </Notice>
        )}

        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            disabled={pending || !captchaOk}
            className="group w-full"
          >
            {pending
              ? "Sending code…"
              : captchaOk
                ? "Send reset code"
                : "Complete verification first"}
            {!pending && captchaOk && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </Button>
        </div>

        <p className="text-center font-body text-sm text-text-muted">
          Remembered it?{" "}
          <Link
            href={`/login${nextQuery ? `?${nextQuery.slice(1)}` : ""}`}
            prefetch
            className="auth-toggle-link"
          >
            Back to sign in
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
