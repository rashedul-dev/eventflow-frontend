"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "@/components/dashboard/notification-dropdown";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Menu,
  X,
  Calendar,
  Ticket,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  ChevronDown,
  Plus,
  Home,
} from "lucide-react";
import Image from "next/image";

export function DashboardHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const canCreateEvent = user && ["ORGANIZER", "ADMIN", "SUPER_ADMIN"].includes(user.role);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-background border-b border-border/50"
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <img src="/favicon.svg" alt="logo" />
            </div>
            <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              <p>EventFlow</p>
            </span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>

            <NotificationDropdown />

            {canCreateEvent && (
              <Button asChild className="gap-2">
                <Link href="/dashboard/organizer/create">
                  <Plus className="w-4 h-4" />
                  Create Event
                </Link>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden md:inline text-sm">{user?.firstName || "Account"}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user && (
                  <div className="px-2 py-1.5 border-b border-border mb-1">
                    <p className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                      {user.role}
                    </span>
                  </div>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/tickets" className="flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    My Tickets
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80 bg-background">
              <div className="flex flex-col h-full pt-8 px-4">
                {user && (
                  <div className="px-3 py-3 bg-foreground/5 rounded-lg mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      pathname === "/dashboard" ? "bg-primary/20 text-primary" : "text-foreground hover:bg-foreground/5"
                    )}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/tickets"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      pathname === "/dashboard/tickets"
                        ? "bg-primary/20 text-primary"
                        : "text-foreground hover:bg-foreground/5"
                    )}
                  >
                    <Ticket className="w-4 h-4" />
                    My Tickets
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      pathname === "/dashboard/settings"
                        ? "bg-primary/20 text-primary"
                        : "text-foreground hover:bg-foreground/5"
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </div>

                <div className="mt-auto pb-8 flex flex-col gap-4">
                  {canCreateEvent && (
                    <Button asChild className="w-full gap-2">
                      <Link href="/dashboard/organizer/create" onClick={() => setIsOpen(false)}>
                        <Plus className="w-4 h-4" />
                        Create Event
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full text-destructive border-red-600"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
