"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfiguredClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/mode";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo Mode: simulate an authenticated user.
    if (isDemoMode()) {
      setUser({
        id: "demo-user",
        email: "demo@filnevo.com",
        app_metadata: { provider: "email" },
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User);
      setLoading(false);
      return;
    }

    // Production Mode: check real Supabase session.
    if (!isSupabaseConfiguredClient()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let active = true;

    // Initial check.
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      setLoading(false);
    });

    // Listen for auth changes.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
