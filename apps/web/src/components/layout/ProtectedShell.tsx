"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-[100dvh] bg-[var(--bg)]">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 pb-bottomnav md:pb-6">{children}</main>
          <MobileNav />
        </div>
      </div>
    </AuthGuard>
  );
}
