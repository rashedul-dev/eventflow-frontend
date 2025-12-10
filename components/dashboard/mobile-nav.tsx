"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Menu,
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
  Home,
  LogOut,
} from "lucide-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const attendeeLinks = [
    { href: "/dashboard", label: "Overview", icon: Home },
    { href: "/dashboard/attendee", label: "My Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/tickets", label: "My Tickets", icon: Ticket },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/payments", label: "Payment History", icon: CreditCard },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const organizerLinks = [
    { href: "/dashboard/organizer", label: "Organizer Dashboard", icon: BarChart3 },
    { href: "/dashboard/organizer/events", label: "My Events", icon: Calendar },
    { href: "/dashboard/organizer/create", label: "Create Event", icon: Plus },
    { href: "/dashboard/organizer/analytics", label: "Analytics", icon: PieChart },
  ];

  const adminLinks = [
    { href: "/dashboard/admin", label: "Admin Dashboard", icon: Shield },
    { href: "/dashboard/admin/events", label: "Event Verification", icon: FileCheck },
    { href: "/dashboard/admin/users", label: "User Management", icon: UserCog },
    { href: "/dashboard/admin/analytics", label: "Platform Analytics", icon: PieChart },
    { href: "/dashboard/admin/reports", label: "Commission Reports", icon: FileText },
  ];

  const canViewOrganizerSection = user && ["ORGANIZER", "ADMIN", "SUPER_ADMIN"].includes(user.role);
  const canViewAdminSection = user && ["ADMIN", "SUPER_ADMIN"].includes(user.role);

  if (!isAuthenticated) return null;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-foreground/10 p-2">
      <div className="flex items-center justify-around">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
            isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Link>
        <Link
          href="/dashboard/tickets"
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
            isActive("/dashboard/tickets") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Ticket className="w-5 h-5" />
          <span className="text-xs">Tickets</span>
        </Link>
        <Link
          href="/dashboard/notifications"
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
            isActive("/dashboard/notifications") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Bell className="w-5 h-5" />
          <span className="text-xs">Alerts</span>
        </Link>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1 h-auto p-2">
              <Menu className="w-5 h-5" />
              <span className="text-xs">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              {/* User Info */}
              {user && (
                <div className="px-3 py-3 bg-foreground/5 rounded-lg">
                  <p className="text-sm font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                    {user.role}
                  </span>
                </div>
              )}

              {/* Attendee Section */}
              <div>
                <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">Attendee</h3>
                <nav className="space-y-1">
                  {attendeeLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors",
                          isActive(link.href)
                            ? "bg-primary/20 text-primary"
                            : "text-foreground/70 hover:bg-foreground/5"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Organizer Section */}
              {canViewOrganizerSection && (
                <div>
                  <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">Organizer</h3>
                  <nav className="space-y-1">
                    {organizerLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors",
                            isActive(link.href)
                              ? "bg-primary/20 text-primary"
                              : "text-foreground/70 hover:bg-foreground/5"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* Admin Section */}
              {canViewAdminSection && (
                <div>
                  <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">Admin</h3>
                  <nav className="space-y-1">
                    {adminLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors",
                            isActive(link.href)
                              ? "bg-primary/20 text-primary"
                              : "text-foreground/70 hover:bg-foreground/5"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* Logout */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Log Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
