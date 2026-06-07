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

  // Keep new sign-ups on the form with a confirmation notice instead of
  // bouncing to the marketing landing page. Accounts verify their email
  // before signing in.
  if (data.session) {
    // Email confirmation is disabled — the account is active immediately.
    return { notice: "Account created — you can sign in now." };
  }
  return { notice: "Check your inbox to confirm your email, then sign in." };
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
