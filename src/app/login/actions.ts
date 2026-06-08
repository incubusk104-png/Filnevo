"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkPassword } from "@/lib/auth/password";
import { verifyTurnstile } from "@/lib/captcha/turnstile";
import { safeNextPath } from "@/lib/auth/next";

export type AuthState =
  | { error?: string; notice?: string; redirectTo?: string }
  | null;

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const verifySchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

/** Resolve the public origin for OAuth redirects. */
async function getOrigin(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const next = safeNextPath(formData.get("next") as string | null);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Enforce the shared password policy server-side (never trust the client).
  const strength = checkPassword(parsed.data.password);
  if (!strength.ok) {
    return {
      error: `Password too weak — ${strength.firstUnmet ?? "does not meet requirements"}.`,
    };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  // Some Supabase setups surface duplicates as an explicit error.
  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      return {
        error: "This email is already registered. Please sign in instead.",
      };
    }
    return { error: error.message };
  }

  // To prevent email enumeration, Supabase returns a 200 with a "fake" user
  // (empty `identities`) when the address already belongs to a confirmed
  // account. Detect that and steer the user to sign in instead of leaving them
  // waiting for a verification code that never comes.
  const identities = data.user?.identities;
  if (data.user && Array.isArray(identities) && identities.length === 0) {
    return {
      error: "This email is already registered. Please sign in instead.",
    };
  }

  const next = safeNextPath(formData.get("next") as string | null);

  // Email confirmation disabled — a session is returned immediately.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(next);
  }

  // Otherwise Supabase emailed a verification code. Move to the verify step
  // where the user enters that code to activate the account, carrying the
  // post-auth destination through so they land where they intended.
  const verifyUrl =
    `/login?step=verify&email=${encodeURIComponent(parsed.data.email)}` +
    (next !== "/" ? `&next=${encodeURIComponent(next)}` : "");
  redirect(verifyUrl);
}

export async function verifyEmail(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = verifySchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Human-verification gate (Cloudflare Turnstile). No-ops in demo mode.
  const h = await headers();
  const captchaOk = await verifyTurnstile(
    formData.get("cf-turnstile-response") as string | null,
    h.get("cf-connecting-ip"),
  );
  if (!captchaOk) {
    return { error: "Captcha verification failed. Please try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "signup",
  });
  if (error) return { error: error.message };

  const next = safeNextPath(formData.get("next") as string | null);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function resendCode(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!z.string().email().safeParse(email).success) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) return { error: error.message };

  return { notice: "A new code is on its way — check your inbox." };
}

export async function signInWithGoogle(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createClient();
  const origin = await getOrigin();
  const next = safeNextPath(formData.get("next") as string | null);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      // Don't let supabase-js redirect server-side; we hand the URL back to the
      // client to navigate. Redirecting to an external URL via Next's
      // `redirect()` inside a Server Action 500s on the Cloudflare Edge runtime.
      skipBrowserRedirect: true,
    },
  });
  if (error) return { error: error.message };
  if (!data?.url) return { error: "Could not start Google sign-in." };
  return { redirectTo: data.url };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
