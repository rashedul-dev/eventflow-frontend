"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ children, allowedRoles, requireAuth = true, redirectTo = "/login" }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
      return;
    }

    // Check role authorization
    if (isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
          router.push("/dashboard/admin");
        } else if (user.role === "ORGANIZER") {
          router.push("/dashboard/organizer");
        } else {
          router.push("/dashboard");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, requireAuth, redirectTo, pathname, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (when required)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Don't render if user doesn't have required role
  if (isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
