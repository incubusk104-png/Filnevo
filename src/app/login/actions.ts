"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkPassword } from "@/lib/auth/password";

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

  revalidatePath("/", "layout");
  redirect("/");
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
  if (error) return { error: error.message };

  // Email confirmation disabled — a session is returned immediately.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  // Otherwise Supabase emailed a verification code. Move to the verify step
  // where the user enters that code to activate the account.
  redirect(`/login/verify?email=${encodeURIComponent(parsed.data.email)}`);
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

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "signup",
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/");
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
  _formData: FormData,
): Promise<AuthState> {
  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/`,
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
