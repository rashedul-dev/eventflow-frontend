"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ticketApi, paymentApi, notificationApi } from "@/lib/api";
import {
  Ticket,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  QrCode,
  Download,
  Bell,
  CreditCard,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  tickets: any[];
  payments: any[];
  notifications: any[];
  stats: {
    totalTickets: number;
    upcomingEvents: number;
    totalSpent: number;
    eventsAttended: number;
  };
}

export default function AttendeeDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching dashboard data...");

      // Fetch all data with individual error handling
      const [ticketsResult, paymentsResult, notificationsResult] = await Promise.allSettled([
        ticketApi.getMyTickets(),
        paymentApi.getMyPayments(), // Get all payments for total spent calculation
        notificationApi.getAll({ limit: 5 }),
      ]);

      // Helper to ensure array - handles various API response formats
      const ensureArray = (value: any): any[] => {
        if (Array.isArray(value)) return value;

        // Check for nested data structures
        if (value?.data) {
          // Check if data.notifications exists (notifications API format)
          if (Array.isArray(value.data.notifications)) return value.data.notifications;
          // Check if data.tickets exists (tickets API format)
          if (Array.isArray(value.data.tickets)) return value.data.tickets;
          // Check if data.payments exists (payments API format)
          if (Array.isArray(value.data.payments)) return value.data.payments;
          // Check if data itself is an array
          if (Array.isArray(value.data)) return value.data;
        }

        // Check for items property (pagination format)
        if (value?.items && Array.isArray(value.items)) return value.items;

        console.warn("⚠️ Expected array but got:", typeof value, value);
        return [];
      };

      // Extract tickets
      let tickets: any[] = [];
      if (ticketsResult.status === "fulfilled") {
        tickets = ensureArray(ticketsResult.value);
        console.log("✅ Tickets fetched:", tickets.length, tickets);
      } else {
        console.error("❌ Tickets error:", ticketsResult.reason);
        toast({
          title: "Warning",
          description: "Could not load tickets",
          variant: "destructive",
        });
      }

      // Extract payments
      let payments: any[] = [];
      if (paymentsResult.status === "fulfilled") {
        payments = ensureArray(paymentsResult.value);
        console.log("✅ Payments fetched:", payments.length, payments);
      } else {
        console.error("❌ Payments error:", paymentsResult.reason);
      }

      // Extract notifications
      let notifications: any[] = [];
      if (notificationsResult.status === "fulfilled") {
        notifications = ensureArray(notificationsResult.value);
        console.log("✅ Notifications fetched:", notifications.length, notifications);
      } else {
        console.error("❌ Notifications error:", notificationsResult.reason);
      }

      // Calculate stats
      const now = new Date();

      // Filter active tickets (valid for upcoming events)
      const activeTickets = tickets.filter(
        (t: any) => t.status === "ACTIVE" || t.status === "VALID" || t.status === "CONFIRMED"
      );

      // Filter used/checked-in tickets
      const usedTickets = tickets.filter(
        (t: any) => t.status === "USED" || t.status === "CHECKED_IN" || t.status === "SCANNED"
      );

      // Get upcoming events (active tickets with future dates)
      const upcomingTickets = activeTickets.filter((t: any) => {
        if (!t.event || !t.event.startDate) return false;
        const eventDate = new Date(t.event.startDate);
        return eventDate > now;
      });

      // Calculate total spent from ALL completed payments
      const totalSpent = payments
        .filter((p: any) => p.status === "COMPLETED" || p.status === "SUCCEEDED" || p.status === "SUCCESS")
        .reduce((sum: number, p: any) => {
          const amount = Number.parseFloat(p.totalAmount || p.amount || "0");
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

      // Sort payments by date (most recent first) and take top 5 for display
      const sortedPayments = [...payments].sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      console.log("📊 Stats calculated:", {
        totalTickets: tickets.length,
        activeTickets: activeTickets.length,
        upcomingEvents: upcomingTickets.length,
        usedTickets: usedTickets.length,
        totalSpent,
        totalPayments: payments.length,
        recentPaymentsToShow: sortedPayments.slice(0, 5).length,
      });

      setData({
        tickets: upcomingTickets.slice(0, 3),
        payments: sortedPayments.slice(0, 5), // Show 5 most recent
        notifications: notifications.slice(0, 5),
        stats: {
          totalTickets: tickets.length,
          upcomingEvents: upcomingTickets.length,
          totalSpent,
          eventsAttended: usedTickets.length,
        },
      });
    } catch (err: any) {
      console.error("💥 Fatal error loading dashboard:", err);
      setError(err.message || "Failed to load dashboard data");
      toast({
        title: "Error",
        description: "Failed to load dashboard. Please try refreshing the page.",
        variant: "destructive",
      });
      // Set empty data to prevent blank screen
      setData({
        tickets: [],
        payments: [],
        notifications: [],
        stats: { totalTickets: 0, upcomingEvents: 0, totalSpent: 0, eventsAttended: 0 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return past.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-foreground/60 mt-1">Welcome back! Here is your event activity overview.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-red-500">Error loading dashboard</p>
                <p className="text-sm text-red-500/80">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchDashboardData} className="border-red-500/20">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold text-foreground">{data?.stats.totalTickets || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Events</p>
                <p className="text-2xl font-bold text-foreground">{data?.stats.upcomingEvents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">
                  $
                  {(data?.stats.totalSpent || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Events Attended</p>
                <p className="text-2xl font-bold text-foreground">{data?.stats.eventsAttended || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events - Takes 2 columns */}
        <Card className="bg-secondary/30 border-foreground/10 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Upcoming Events</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/tickets" className="text-primary hover:text-primary/80">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data?.tickets.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                <p className="text-muted-foreground mb-4">Discover events and get your tickets!</p>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data?.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-foreground/5"
                  >
                    <img
                      src={ticket.event?.coverImage || "/placeholder.svg?height=80&width=80"}
                      alt={ticket.event?.title || "Event"}
                      className="w-20 h-20 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=80&width=80";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">
                        {ticket.event?.title || "Untitled Event"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-foreground/60">
                        {ticket.event?.startDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(ticket.event.startDate)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {ticket.event?.isVirtual ? "Online Event" : ticket.event?.city || "TBD"}
                        </span>
                      </div>
                      <Badge variant="outline" className="mt-2 bg-primary/10 text-primary border-primary/20">
                        {ticket.ticketType?.name || "General Admission"}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
                        <Link href={`/dashboard/tickets/${ticket.id}`}>
                          <QrCode className="h-4 w-4" />
                          View Ticket
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-secondary/30 border-foreground/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Notifications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/notifications" className="text-primary hover:text-primary/80">
                <Bell className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data?.notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.status === "READ"
                        ? "bg-background/30 border-foreground/5"
                        : "bg-primary/5 border-primary/20"
                    }`}
                  >
                    <p className="font-medium text-sm text-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-foreground/40 mt-2">{formatTimeAgo(notification.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Recent Payments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/payments" className="text-primary hover:text-primary/80">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {data?.payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No payment history</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Order</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-foreground/60">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-foreground/5 hover:bg-foreground/5">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-foreground">
                          {payment.orderNumber || payment.id?.slice(0, 8)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground/70 text-sm">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            payment.status === "COMPLETED" || payment.status === "SUCCESS" ? "default" : "secondary"
                          }
                          className={
                            payment.status === "COMPLETED" || payment.status === "SUCCESS"
                              ? "bg-green-500/20 text-green-500"
                              : payment.status === "REFUNDED"
                              ? "bg-amber-500/20 text-amber-500"
                              : ""
                          }
                        >
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">
                        ${Number.parseFloat(payment.totalAmount || payment.amount || "0").toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
              <Link href="/events">
                <Calendar className="h-5 w-5" />
                <span>Browse Events</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
              <Link href="/dashboard/tickets">
                <Ticket className="h-5 w-5" />
                <span>My Tickets</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
              <Link href="/dashboard/payments">
                <CreditCard className="h-5 w-5" />
                <span>Payments</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
              <Link href="/dashboard/settings">
                <Download className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
