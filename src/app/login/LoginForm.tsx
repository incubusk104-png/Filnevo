"use client";

import { useActionState, useState } from "react";
import { Check, Lock, X } from "lucide-react";
import {
  signIn,
  signInWithGoogle,
  signUp,
  type AuthState,
} from "./actions";
import { checkPassword } from "@/lib/auth/password";

const METER_COLORS = [
  "bg-ruby",
  "bg-ruby",
  "bg-amber-400",
  "bg-sapphire",
  "bg-emerald-400",
];

export function LoginForm() {
  const [signInState, signInAction, signingIn] = useActionState<AuthState, FormData>(signIn, null);
  const [signUpState, signUpAction, signingUp] = useActionState<AuthState, FormData>(signUp, null);
  const [googleState, googleAction, googlePending] = useActionState<AuthState, FormData>(signInWithGoogle, null);

  const [password, setPassword] = useState("");
  const [showRules, setShowRules] = useState(false);

  const error = signInState?.error ?? signUpState?.error ?? googleState?.error;
  const notice = signUpState?.notice;
  const pending = signingIn || signingUp || googlePending;

  const strength = checkPassword(password);
  const showMeter = showRules || password.length > 0;

  return (
    <div className="mt-8 space-y-4">
      {/* Google OAuth */}
      <form action={googleAction}>
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-hairline bg-obsidian-600 px-4 py-2.5 font-nav text-sm font-semibold text-ink transition-colors hover:border-gold/60 disabled:opacity-50"
        >
          <GoogleIcon />
          {googlePending ? "Connecting…" : "Continue with Google"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="font-ledger text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          or use email
        </span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <form className="space-y-4">
        <label className="block">
          <span className="font-ledger text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Operator Email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-hairline bg-obsidian-600 px-3 py-2 font-ledger text-sm text-ink outline-none focus:border-gold/60"
            placeholder="operator@filnevo.com"
          />
        </label>

        <label className="block">
          <span className="font-ledger text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Passphrase
          </span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setShowRules(true)}
            className="mt-1 w-full rounded-lg border border-hairline bg-obsidian-600 px-3 py-2 font-ledger text-sm text-ink outline-none focus:border-gold/60"
            placeholder="••••••••"
          />
        </label>

        {/* Strength meter + rules guidance (helps enrolment; guides to a
            secure passphrase). */}
        {showMeter && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`flex-1 rounded-full transition-colors ${
                      i < strength.score ? METER_COLORS[strength.score] : "bg-hairline"
                    }`}
                  />
                ))}
              </div>
              <span className="font-ledger text-[10px] uppercase tracking-[0.2em] text-ink-dim">
                {strength.label}
              </span>
            </div>
            <ul className="space-y-1">
              {strength.rules.map((rule) => (
                <li key={rule.id} className="flex items-center gap-1.5 font-ledger text-[11px]">
                  {rule.met ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <X className="h-3 w-3 text-ink-faint" />
                  )}
                  <span className={rule.met ? "text-ink-dim" : "text-ink-faint"}>
                    {rule.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="rounded-md border border-ruby/50 bg-ruby/10 px-3 py-2 font-ledger text-xs text-ruby">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-md border border-sapphire/50 bg-sapphire/10 px-3 py-2 font-ledger text-xs text-sapphire">
            {notice}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            formAction={signInAction}
            disabled={pending}
            className="flex-1 rounded-lg bg-gold px-4 py-2.5 font-nav text-sm font-semibold text-obsidian transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {signingIn ? "Unlocking…" : "Sign In"}
          </button>
          <button
            formAction={signUpAction}
            disabled={pending}
            className="flex-1 rounded-lg border border-sapphire/50 px-4 py-2.5 font-nav text-sm font-semibold text-sapphire transition-colors hover:bg-sapphire/10 disabled:opacity-50"
          >
            {signingUp ? "Enrolling…" : "Enroll"}
          </button>
        </div>

        <p className="flex items-center justify-center gap-1.5 pt-2 font-ledger text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          <Lock className="h-3 w-3" /> Triple-Lock · RLS-enforced session
        </p>
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
