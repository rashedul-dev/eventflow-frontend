"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import {
  LayoutDashboard,
  Ticket,
  Calendar,
  Settings,
  CreditCard,
  Bell,
  Plus,
  BarChart3,
  Shield,
  FileCheck,
  PieChart,
  UserCog,
  FileText,
  Users,
} from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  // Attendee links - removed duplicate "Overview"
  const attendeeLinks = [
    { href: "/dashboard/attendee", label: "My Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/tickets", label: "My Tickets", icon: Ticket },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/payments", label: "Payment History", icon: CreditCard },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  // Organizer links (visible to ORGANIZER, ADMIN, SUPER_ADMIN)
  const organizerLinks = [
    { href: "/dashboard/organizer", label: "Organizer Dashboard", icon: BarChart3 },
    { href: "/dashboard/organizer/events", label: "My Events", icon: Calendar },
    { href: "/dashboard/organizer/create", label: "Create Event", icon: Plus },
    { href: "/dashboard/organizer/analytics", label: "Analytics", icon: PieChart },
  ];

  // Admin links (visible to ADMIN, SUPER_ADMIN)
  const adminLinks = [
    { href: "/dashboard/admin", label: "Admin Dashboard", icon: Shield },
    { href: "/dashboard/admin/events", label: "Event Verification", icon: FileCheck },
    { href: "/dashboard/admin/users", label: "User Management", icon: UserCog },
    { href: "/dashboard/admin/analytics", label: "Platform Analytics", icon: PieChart },
    { href: "/dashboard/admin/reports", label: "Commission Reports", icon: FileText },
  ];

  const canViewOrganizerSection = user && ["ORGANIZER", "ADMIN", "SUPER_ADMIN"].includes(user.role);
  const canViewAdminSection = user && ["ADMIN", "SUPER_ADMIN"].includes(user.role);

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile overlay */}
      <div className="lg:hidden fixed inset-0 bg-black/50 z-40 hidden" id="sidebar-overlay" />

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-secondary/30 border-r border-foreground/10 overflow-y-auto hidden lg:block z-40">
        <div className="p-4 space-y-6">
          {/* User Info */}
          {user && (
            <div className="px-3 py-3 bg-foreground/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                {user.role}
              </span>
            </div>
          )}

          {/* Attendee Section */}
          <div>
            <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3 px-3">Attendee</h3>
            <nav className="space-y-1">
              {attendeeLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      active
                        ? "bg-primary/20 text-primary"
                        : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Organizer Section - Only for organizers, admins, super_admins */}
          {canViewOrganizerSection && (
            <div>
              <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3 px-3">Organizer</h3>
              <nav className="space-y-1">
                {organizerLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        active
                          ? "bg-primary/20 text-primary"
                          : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Admin Section - Only for admins, super_admins */}
          {canViewAdminSection && (
            <div>
              <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3 px-3">
                Administration
              </h3>
              <nav className="space-y-1">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        active
                          ? "bg-primary/20 text-primary"
                          : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Upgrade to Organizer prompt for ATTENDEEs */}
          {user?.role === "ATTENDEE" && (
            <div className="px-3">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-medium text-sm text-foreground mb-1">Become an Organizer</h4>
                <p className="text-xs text-muted-foreground mb-3">Create and manage your own events.</p>
                <Link href="/dashboard/become-organizer" className="text-xs text-primary hover:underline font-medium">
                  Upgrade Now →
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
