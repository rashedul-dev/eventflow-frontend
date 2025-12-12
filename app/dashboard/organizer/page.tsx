"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eventApi, analyticsApi, ticketApi } from "@/lib/api";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Ticket,
  Eye,
  Plus,
  ArrowRight,
  Loader2,
  Clock,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface OrganizerDashboardData {
  events: any[];
  analytics: any;
  recentSales: any[];
  stats: {
    totalEvents: number;
    totalAttendees: number;
    totalRevenue: number;
    ticketsSold: number;
    pendingApproval: number;
    upcomingEvents: number;
  };
}

export default function OrganizerDashboardPage() {
  const [data, setData] = useState<OrganizerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, analyticsRes] = await Promise.all([
        eventApi.getMyEvents().catch(() => ({ data: [] })),
        analyticsApi.getOrganizer().catch(() => ({ data: null })),
      ]);

      console.log(" Events response:", eventsRes);
      console.log(" Analytics response:", analyticsRes);

      const events = eventsRes?.data || [];
      const analytics = analyticsRes?.data || {};

      const now = new Date();
      const upcomingEvents = events.filter((e: any) => new Date(e.startDate) > now);
      const pendingEvents = events.filter((e: any) => e.status === "PENDING_APPROVAL");

      let totalRevenue = 0;
      let totalTicketsSold = 0;
      const recentSales: any[] = [];

      // If analytics endpoint returns data, use it
      if (analytics.totalRevenue !== undefined) {
        totalRevenue = Number(analytics.totalRevenue) || 0;
        totalTicketsSold = Number(analytics.ticketsSold) || 0;
      } else {
        // Otherwise calculate from events
        for (const event of events) {
          try {
            const ticketsRes = await ticketApi.getEventTickets(event.id, { limit: 100 });
            const tickets = ticketsRes?.data || [];

            // Calculate revenue and count tickets
            for (const ticket of tickets) {
              if (ticket.status === "ACTIVE" || ticket.status === "USED") {
                totalRevenue += Number(ticket.pricePaid) || 0;
                totalTicketsSold += 1;

                // Add to recent sales
                if (recentSales.length < 5) {
                  recentSales.push({
                    ...ticket,
                    event,
                  });
                }
              }
            }
          } catch (err) {
            console.error(` Failed to fetch tickets for event ${event.id}:`, err);
          }
        }
      }

      console.log(" Calculated revenue:", totalRevenue);
      console.log(" Calculated tickets sold:", totalTicketsSold);

      setData({
        events: events.slice(0, 5),
        analytics,
        recentSales: analytics.recentSales || recentSales.slice(0, 5),
        stats: {
          totalEvents: events.length,
          totalAttendees: Number(analytics.totalAttendees) || 0,
          totalRevenue,
          ticketsSold: totalTicketsSold,
          pendingApproval: pendingEvents.length,
          upcomingEvents: upcomingEvents.length,
        },
      });
    } catch (err) {
      console.error(" Failed to load dashboard:", err);
      setData({
        events: [],
        analytics: {},
        recentSales: [],
        stats: {
          totalEvents: 0,
          totalAttendees: 0,
          totalRevenue: 0,
          ticketsSold: 0,
          pendingApproval: 0,
          upcomingEvents: 0,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { className: string; icon: any }> = {
      APPROVED: { className: "bg-green-500/20 text-green-500", icon: CheckCircle },
      PUBLISHED: { className: "bg-primary/20 text-primary", icon: CheckCircle },
      PENDING_APPROVAL: { className: "bg-amber-500/20 text-amber-500", icon: Clock },
      DRAFT: { className: "bg-foreground/20 text-foreground/60", icon: AlertCircle },
      REJECTED: { className: "bg-red-500/20 text-red-500", icon: XCircle },
      CANCELLED: { className: "bg-red-500/20 text-red-500", icon: XCircle },
    };
    const config = configs[status] || configs.DRAFT;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`gap-1 ${config.className}`}>
        <Icon className="w-3 h-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organizer Dashboard</h1>
          <p className="text-foreground/60 mt-1">Manage your events, track sales, and grow your audience.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/organizer/create">
            <Plus className="w-4 h-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{data?.stats.totalEvents || 0}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{data?.stats.totalAttendees || 0}</p>
                <p className="text-xs text-muted-foreground">Attendees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${(data?.stats.totalRevenue || 0).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Ticket className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{data?.stats.ticketsSold || 0}</p>
                <p className="text-xs text-muted-foreground">Tickets Sold</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{data?.stats.pendingApproval || 0}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/20">
                <TrendingUp className="h-5 w-5 text-teal-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{data?.stats.upcomingEvents || 0}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <Card className="bg-secondary/30 border-foreground/10 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Your Events</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/organizer/events" className="text-primary hover:text-primary/80">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data?.events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-4">Create your first event to start selling tickets.</p>
                <Button asChild>
                  <Link href="/dashboard/organizer/create">Create Event</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-foreground/5"
                  >
                    <img
                      src={event.coverImage || "/placeholder.svg?height=60&width=60&query=event"}
                      alt={event.title}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(event.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Ticket className="w-3.5 h-3.5" />
                          {event._count?.tickets || 0} sold
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(event.status)}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/organizer/events/${event.id}/edit`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-secondary/30 border-foreground/10">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 bg-transparent" asChild>
              <Link href="/dashboard/organizer/create">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Create Event</p>
                  <p className="text-xs text-muted-foreground">Start a new event</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 bg-transparent" asChild>
              <Link href="/dashboard/organizer/events">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Manage Events</p>
                  <p className="text-xs text-muted-foreground">Edit or update events</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 bg-transparent" asChild>
              <Link href="/dashboard/organizer/analytics">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium">View Analytics</p>
                  <p className="text-xs text-muted-foreground">Track performance</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 bg-transparent" asChild>
              <Link href="/dashboard/settings">
                <div className="p-2 rounded-lg bg-foreground/10">
                  <Users className="w-4 h-4 text-foreground/60" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Organizer Profile</p>
                  <p className="text-xs text-muted-foreground">Update your info</p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Recent Ticket Sales</CardTitle>
          {data?.events[0] && (
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/dashboard/organizer/events/${data.events[0].id}/attendees`}
                className="text-primary hover:text-primary/80"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {data?.recentSales.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No ticket sales yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Ticket</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Event</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Buyer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-foreground/60">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-foreground/60">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-foreground/5 hover:bg-foreground/5">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-foreground">{sale.ticketNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-foreground/70 text-sm truncate max-w-48">
                        {sale.event?.title || "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-foreground/70 text-sm">
                        {sale.attendeeName || sale.user?.firstName || "Anonymous"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            sale.status === "ACTIVE"
                              ? "bg-green-500/20 text-green-500"
                              : sale.status === "USED"
                              ? "bg-blue-500/20 text-blue-500"
                              : ""
                          }
                        >
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">
                        ${Number.parseFloat(sale.pricePaid || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
