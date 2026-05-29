"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { signIn, signUp, type AuthState } from "./actions";

export function LoginForm() {
  const [signInState, signInAction, signingIn] = useActionState<
    AuthState,
    FormData
  >(signIn, null);
  const [signUpState, signUpAction, signingUp] = useActionState<
    AuthState,
    FormData
  >(signUp, null);

  const error = signInState?.error ?? signUpState?.error;
  const pending = signingIn || signingUp;

  return (
    <form className="mt-8 space-y-4">
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
          placeholder="operator@caveat.vault"
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
          className="mt-1 w-full rounded-lg border border-hairline bg-obsidian-600 px-3 py-2 font-ledger text-sm text-ink outline-none focus:border-gold/60"
          placeholder="••••••••"
        />
      </label>

      {error && (
        <p className="rounded-md border border-ruby/50 bg-ruby/10 px-3 py-2 font-ledger text-xs text-ruby">
          {error}
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
  );
}
