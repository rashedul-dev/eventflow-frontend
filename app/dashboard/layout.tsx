import type React from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          <div className="flex pt-16">
            <DashboardSidebar />
            <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64 pb-24 lg:pb-8">{children}</main>
          </div>
          <MobileNav />
        </div>
      </AuthGuard>
    </ErrorBoundary>
  );
}
