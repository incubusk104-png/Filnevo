"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PieChart,
  Settings,
  Users,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { Logo } from "@/components/shared/Logo";
import { createClient, isSupabaseConfiguredClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Analytics", href: "/dashboard/analytics", icon: PieChart },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfiguredClient()) {
      setEmail("demo@filnevo.com");
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  async function handleSignOut() {
    if (isSupabaseConfiguredClient()) {
      await createClient().auth.signOut();
    }
    window.location.assign("/");
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Mobile Toggle */}
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-md border border-hairline bg-neutral-900/50 p-2 text-foreground lg:hidden"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-hairline bg-neutral-950/50 transition-all duration-300 backdrop-blur-xl lg:static ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center border-b border-hairline px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo size={isCollapsed ? 32 : 32} withWordmark={!isCollapsed} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-velocity-blue text-neutral-50 shadow-lg shadow-velocity-blue/20"
                    : "text-text-muted hover:bg-neutral-900/50 hover:text-foreground"
                }`}
                title={isCollapsed ? item.name : ""}
              >
                <Icon size={20} className={isActive ? "text-neutral-50" : "text-text-muted group-hover:text-foreground"} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-hairline p-4 space-y-1">
          <Link
            href="/dashboard/support"
            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-neutral-900/50 hover:text-foreground"
            title={isCollapsed ? "Support" : ""}
          >
            <HelpCircle size={20} />
            {!isCollapsed && <span>Support</span>}
          </Link>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-neutral-900/50 hover:text-alert-red"
            title={isCollapsed ? "Sign Out" : ""}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>

          <div className="mt-4 border-t border-hairline pt-4 px-2 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-velocity-blue to-insight-cyan flex items-center justify-center font-metrics text-xs font-bold text-neutral-50">
                {email?.charAt(0).toUpperCase() || "U"}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{email}</p>
                  <p className="text-[10px] text-text-faint uppercase tracking-wider">Free Plan</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapse Toggle (Desktop) */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-hairline bg-neutral-900 text-text-muted hover:text-foreground lg:flex"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}
