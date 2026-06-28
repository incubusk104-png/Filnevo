"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/dashboard/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a mounting check to prevent hydration mismatches.
  if (!mounted || loading) {
    return <>{children}</>;
  }

  // If user is authenticated, wrap with Sidebar.
  if (user) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col lg:pl-64 transition-all duration-300">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
