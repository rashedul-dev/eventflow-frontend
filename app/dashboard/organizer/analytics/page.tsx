"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Ticket,
  Calendar,
  TrendingUp,
  RefreshCw,
  BarChart3,
  DollarSign,
  MapPin,
  Clock,
  CalendarCheck,
  CalendarX,
  Tag,
  AlertCircle,
  PieChart,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { analyticsApi, eventApi, ticketApi } from "@/lib/api";
import { EventAnalyticsResponse, IAnalyticsQuery, OrganizerAnalyticsResponse } from "@/lib/interface";

// Types based on actual API responses from backend
interface Event {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  startDate: string;
  endDate: string;
  isVirtual: boolean;
  venueName: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  capacity: number | null;
  status: string;
  category: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    organizationName: string | null;
  };
  _count: {
    tickets: number;
    ticketTypes: number;
  };
}

interface CheckInStats {
  total: number;
  checkedIn: number;
  attendanceRate: number;
}

const CHART_COLORS = ["#60a5fa", "#4ade80", "#c084fc", "#fb923c", "#f472b6", "#22d3ee", "#facc15", "#f87171"];

const CATEGORY_LABELS: Record<string, string> = {
  education: "Education",
  class: "Class",
  sports: "Sports",
  concert: "Concert",
  conference: "Conference",
  workshop: "Workshop",
  meetup: "Meetup",
  other: "Other",
};

const PERIOD_OPTIONS = [
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "Last 30 Days" },
  { value: "quarter", label: "Last 3 Months" },
  { value: "year", label: "Last Year" },
];

const PLATFORM_FEE_RATE = 0.05;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function OrganizerAnalyticsPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [events, setEvents] = useState<Event[]>([]);
  const [analytics, setAnalytics] = useState<OrganizerAnalyticsResponse | null>(null);
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalyticsResponse | null>(null);
  const [checkInStats, setCheckInStats] = useState<CheckInStats | null>(null);
  const [allEventsCheckInStats, setAllEventsCheckInStats] = useState<Record<string, CheckInStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const query: IAnalyticsQuery = { period: selectedPeriod as IAnalyticsQuery["period"] };

      if (selectedEventId !== "all") {
        query.eventId = selectedEventId;
      }

      // Fetch events and analytics in parallel
      const [eventsRes, analyticsRes] = await Promise.all([
        eventApi.getMyEvents(),
        analyticsApi.getOrganizerAnalytics(query),
      ]);

      const eventsData = eventsRes.data || [];
      const eventsArray = Array.isArray(eventsData) ? eventsData : [];
      setEvents(eventsArray);
      setAnalytics((analyticsRes.data as OrganizerAnalyticsResponse) || null);

      if (selectedEventId !== "all") {
        // Fetch event-specific analytics AND check-in stats
        const [eventAnalyticsRes, checkInStatsRes] = await Promise.all([
          analyticsApi.getEventAnalytics(selectedEventId).catch(() => ({ data: null })),
          ticketApi.getCheckInStats(selectedEventId).catch(() => ({ total: 0, checkedIn: 0, attendanceRate: 0 })),
        ]);
        setEventAnalytics((eventAnalyticsRes.data as EventAnalyticsResponse) || null);
        setCheckInStats(checkInStatsRes);
      } else {
        setEventAnalytics(null);
        setCheckInStats(null);

        // Fetch check-in stats for all events
        const statsPromises = eventsArray.map(async (event) => {
          const stats = await ticketApi.getCheckInStats(event.id).catch(() => ({
            total: 0,
            checkedIn: 0,
            attendanceRate: 0,
          }));
          return { eventId: event.id, stats };
        });
        const allStats = await Promise.all(statsPromises);
        const statsMap: Record<string, CheckInStats> = {};
        allStats.forEach(({ eventId, stats }) => {
          statsMap[eventId] = stats;
        });
        setAllEventsCheckInStats(statsMap);
      }
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedEventId, selectedPeriod]);

  // Derived stats from events data
  const derivedStats = useMemo(() => {
    const now = new Date();
    const upcomingEvents = events.filter((e) => new Date(e.startDate) > now);
    const pastEvents = events.filter((e) => new Date(e.endDate) < now);
    const ongoingEvents = events.filter((e) => new Date(e.startDate) <= now && new Date(e.endDate) >= now);

    // Category breakdown from events
    const categoryCount = events.reduce((acc, event) => {
      const cat = event.category || "other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
      name: CATEGORY_LABELS[name] || name,
      value,
    }));

    // Total capacity and tickets from events
    const totalCapacity = events.reduce((sum, e) => sum + (e.capacity || 0), 0);
    const totalTicketsFromEvents = events.reduce((sum, e) => sum + e._count.tickets, 0);

    const totalCheckedIn = Object.values(allEventsCheckInStats).reduce((sum, stats) => sum + stats.checkedIn, 0);

    return {
      upcomingEvents: upcomingEvents.length,
      pastEvents: pastEvents.length,
      ongoingEvents: ongoingEvents.length,
      categoryData,
      totalCapacity,
      totalTicketsFromEvents,
      totalCheckedIn,
    };
  }, [events, allEventsCheckInStats]);

  const selectedEvent = useMemo(() => {
    if (selectedEventId === "all") return null;
    return events.find((e) => e.id === selectedEventId);
  }, [selectedEventId, events]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive bg-secondary/30 ">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-destructive text-center">{error}</p>
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOverview = selectedEventId === "all";

  return (
    <div className="container mx-auto p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {isOverview ? "Overview of all your events" : `Analytics for ${selectedEvent?.title}`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isOverview ? (
        <OrganizerOverview
          analytics={analytics}
          events={events}
          derivedStats={derivedStats}
          allEventsCheckInStats={allEventsCheckInStats}
        />
      ) : (
        selectedEvent && (
          <SingleEventAnalytics
            event={selectedEvent}
            analytics={analytics}
            eventAnalytics={eventAnalytics}
            checkInStats={checkInStats}
          />
        )
      )}
    </div>
  );
}

// Organizer Overview Component
function OrganizerOverview({
  analytics,
  events,
  derivedStats,
  allEventsCheckInStats,
}: {
  analytics: OrganizerAnalyticsResponse | null;
  events: Event[];
  derivedStats: any;
  allEventsCheckInStats: Record<string, CheckInStats>;
}) {
  const ticketsSold = analytics?.ticketsSold || derivedStats.totalTicketsFromEvents;
  const activeEvents = analytics?.activeEvents || events.length;
  const totalRevenue = analytics?.totalRevenue || 0;
  const commissionOwed = analytics?.commissionOwed || totalRevenue * PLATFORM_FEE_RATE;
  const netRevenue = totalRevenue - commissionOwed;
  const avgTicketPrice = ticketsSold > 0 ? totalRevenue / ticketsSold : 0;
  const fillRate = derivedStats.totalCapacity > 0 ? Math.round((ticketsSold / derivedStats.totalCapacity) * 100) : 0;

  const totalCheckedIn = derivedStats.totalCheckedIn;
  const overallAttendanceRate = ticketsSold > 0 ? (totalCheckedIn / ticketsSold) * 100 : 0;

  // Prepare top events data for chart
  const topEventsData = analytics?.topEvents?.length
    ? analytics.topEvents.map((e) => ({
        name: e.title.length > 15 ? e.title.substring(0, 15) + "..." : e.title,
        fullName: e.title,
        tickets: e.ticketsSold,
        revenue: e.revenue,
      }))
    : events
        .filter((e) => e._count.tickets > 0)
        .sort((a, b) => b._count.tickets - a._count.tickets)
        .slice(0, 5)
        .map((e) => ({
          name: e.title.length > 15 ? e.title.substring(0, 15) + "..." : e.title,
          fullName: e.title,
          tickets: e._count.tickets,
          revenue: 0,
        }));

  return (
    <>
      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          description={
            ticketsSold > 0 && totalRevenue > 0 ? `Avg ${formatCurrency(avgTicketPrice)} per ticket` : "Gross sales"
          }
          highlight
        />
        <MetricCard
          title="Tickets Sold"
          value={formatNumber(ticketsSold)}
          description={`${formatNumber(ticketsSold)} total tickets`}
          icon={Ticket}
        />
        <MetricCard
          title="Check-ins"
          value={formatNumber(totalCheckedIn)}
          icon={CheckCircle}
          description={`${overallAttendanceRate.toFixed(1)}% attendance`}
        />
        <MetricCard
          title="Active Events"
          value={formatNumber(activeEvents)}
          icon={Calendar}
          description={`${derivedStats.upcomingEvents} upcoming`}
        />
      </div>

      {/* Earnings Breakdown */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <DollarSign className="h-5 w-5" />
            Earnings Breakdown
          </CardTitle>
          <CardDescription>Your revenue after platform fees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background/50 text-center">
              <p className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-1">Gross Sales</p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
              <p className="text-3xl font-bold text-destructive">-{formatCurrency(commissionOwed)}</p>
              <p className="text-sm text-muted-foreground mt-1">Platform Fee (5%)</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-3xl font-bold text-primary">{formatCurrency(netRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-1">Your Earnings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Events</p>
                <p className="text-2xl font-bold text-foreground">{derivedStats.upcomingEvents}</p>
              </div>
              <CalendarCheck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ongoing Events</p>
                <p className="text-2xl font-bold text-foreground">{derivedStats.ongoingEvents}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-500 bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Past Events</p>
                <p className="text-2xl font-bold text-foreground">{derivedStats.pastEvents}</p>
              </div>
              <CalendarX className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time or Top Events */}
        {analytics?.revenueData && analytics.revenueData.length > 0 ? (
          <Card className="bg-secondary/30 border-foreground/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5" />
                Revenue Over Time
              </CardTitle>
              <CardDescription>Daily revenue trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tick={{ fill: "hsl(var(--foreground))" }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tick={{ fill: "hsl(var(--foreground))" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-secondary/30 border-foreground/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5" />
                Top Events by Tickets
              </CardTitle>
              <CardDescription>Events with most ticket sales</CardDescription>
            </CardHeader>
            <CardContent>
              {topEventsData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topEventsData} layout="vertical" margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        type="number"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tick={{ fill: "hsl(var(--foreground))" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        width={100}
                        tick={{ fill: "hsl(var(--foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: any) => [value, "Tickets Sold"]}
                        labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.fullName || label}
                      />
                      <Bar dataKey="tickets" fill="#60a5fa" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No ticket sales data yet
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Category Distribution */}
        <Card className="bg-secondary/30 border-foreground/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PieChart className="h-5 w-5" />
              Events by Category
            </CardTitle>
            <CardDescription>Distribution of your events</CardDescription>
          </CardHeader>
          <CardContent>
            {derivedStats.categoryData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={derivedStats.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {derivedStats.categoryData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Events Table */}
      {analytics?.topEvents && analytics.topEvents.length > 0 && (
        <Card className="bg-secondary/30 border-foreground/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5" />
              Top Performing Events
            </CardTitle>
            <CardDescription>Your best events by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topEvents.map((event, index) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-foreground">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{event.title}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">
                      <Ticket className="h-4 w-4 inline mr-1" />
                      {formatNumber(event.ticketsSold)} tickets
                    </span>
                    <span className="font-semibold text-primary">{formatCurrency(event.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5" />
            Your Events
          </CardTitle>
          <CardDescription>All events with ticket details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <EventListItem key={event.id} event={event} checkInStats={allEventsCheckInStats[event.id]} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No events found. Create your first event to see analytics.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Single Event Analytics Component
function SingleEventAnalytics({
  event,
  analytics,
  eventAnalytics,
  checkInStats,
}: {
  event: Event;
  analytics: OrganizerAnalyticsResponse | null;
  eventAnalytics: EventAnalyticsResponse | null;
  checkInStats: CheckInStats | null;
}) {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const fillRate = event.capacity ? Math.round((event._count.tickets / event.capacity) * 100) : 0;

  const getTimeStatus = () => {
    if (endDate < now) return "Event has ended";
    if (startDate <= now) return "Event is ongoing";
    const days = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `Starts in ${days} day${days !== 1 ? "s" : ""}`;
  };

  const ticketsSold = eventAnalytics?.ticketsSold || analytics?.ticketsSold || event._count.tickets;
  const totalRevenue = eventAnalytics?.totalRevenue || analytics?.totalRevenue || 0;

  const checkedInTickets = checkInStats?.checkedIn || 0;
  const attendanceRate = checkInStats?.attendanceRate || 0;

  const commissionOwed = analytics?.commissionOwed || totalRevenue * PLATFORM_FEE_RATE;
  const netRevenue = totalRevenue - commissionOwed;

  return (
    <>
      {/* Event Header Card */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline">{CATEGORY_LABELS[event.category] || event.category}</Badge>
                <Badge variant={event.status === "APPROVED" ? "default" : "secondary"}>{event.status}</Badge>
              </div>
              <h2 className="text-xl font-bold text-foreground">{event.title}</h2>
              <p className="text-muted-foreground mt-1">{event.shortDescription}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{getTimeStatus()}</p>
              <p className="text-sm text-foreground">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </p>
              {!event.isVirtual && event.city && (
                <p className="text-sm text-muted-foreground flex items-center justify-end gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {event.city}, {event.state}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          description="From this event"
          highlight
        />
        <MetricCard
          title="Tickets Sold"
          value={formatNumber(ticketsSold)}
          icon={Ticket}
          description={event.capacity ? `of ${formatNumber(event.capacity)} capacity` : "No capacity set"}
        />
        <MetricCard
          title="Checked In"
          value={formatNumber(checkedInTickets)}
          icon={CheckCircle}
          description={`${attendanceRate.toFixed(1)}% attendance rate`}
        />
        <MetricCard
          title="Fill Rate"
          value={event.capacity ? `${fillRate}%` : "N/A"}
          icon={TrendingUp}
          description={event.capacity ? `${event._count.tickets} / ${event.capacity}` : "No capacity set"}
        />
      </div>

      {/* Earnings Breakdown */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <DollarSign className="h-5 w-5" />
            Earnings Breakdown
          </CardTitle>
          <CardDescription>Your revenue after platform fees for this event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-1">Gross Sales</p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
              <p className="text-3xl font-bold text-destructive">-{formatCurrency(commissionOwed)}</p>
              <p className="text-sm text-muted-foreground mt-1">Platform Fee (5%)</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-3xl font-bold text-primary">{formatCurrency(netRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-1">Your Earnings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity Progress */}
      {event.capacity && (
        <Card className="bg-secondary/30 border-foreground/10">
          <CardHeader>
            <CardTitle className="text-foreground">Capacity Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-foreground">
                <span>{formatNumber(ticketsSold)} tickets sold</span>
                <span>{formatNumber(event.capacity)} capacity</span>
              </div>
              <Progress value={fillRate} className="h-3" />
              <p className="text-sm text-muted-foreground text-center">
                {event.capacity - ticketsSold} spots remaining
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue/Ticket Sales Over Time */}
        {eventAnalytics?.revenueData && eventAnalytics.revenueData.length > 0 && (
          <Card className="bg-secondary/30 border-foreground/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5" />
                Sales Over Time
              </CardTitle>
              <CardDescription>Daily revenue and ticket sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eventAnalytics.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tick={{ fill: "hsl(var(--foreground))" }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tick={{ fill: "hsl(var(--foreground))" }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tick={{ fill: "hsl(var(--foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#60a5fa" name="Revenue ($)" />
                    <Line yAxisId="right" type="monotone" dataKey="tickets" stroke="#4ade80" name="Tickets" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ticket Type Breakdown */}
        {eventAnalytics?.ticketTypeBreakdown && eventAnalytics.ticketTypeBreakdown.length > 0 && (
          <Card className="bg-secondary/30 border-foreground/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Tag className="h-5 w-5" />
                Ticket Type Breakdown
              </CardTitle>
              <CardDescription>Sales by ticket type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventAnalytics.ticketTypeBreakdown.map((type, index) => (
                  <div key={type.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="font-medium text-foreground">{type.name}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-muted-foreground">{formatNumber(type.sold)} sold</span>
                      <span className="font-semibold text-foreground">{formatCurrency(type.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  highlight = false,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={`bg-secondary/30 border-foreground/10 ${highlight ? "border-primary/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <Icon className={`h-8 w-8 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        </div>
      </CardContent>
    </Card>
  );
}

// Event List Item Component
function EventListItem({ event, checkInStats }: { event: Event; checkInStats?: CheckInStats }) {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const getStatus = () => {
    if (endDate < now) return { label: "Past", color: "secondary" as const };
    if (startDate <= now && endDate >= now) return { label: "Ongoing", color: "default" as const };
    return { label: "Upcoming", color: "outline" as const };
  };

  const status = getStatus();
  const fillRate = event.capacity ? Math.round((event._count.tickets / event.capacity) * 100) : 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-medium truncate text-foreground">{event.title}</h3>
          <Badge variant={status.color}>{status.label}</Badge>
          <Badge variant="outline" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            {CATEGORY_LABELS[event.category] || event.category}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {startDate.toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.isVirtual ? "Virtual" : event.city || "TBD"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{event._count.tickets}</p>
          <p className="text-xs text-muted-foreground">Tickets</p>
        </div>
        {checkInStats && (
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{checkInStats.checkedIn}</p>
            <p className="text-xs text-muted-foreground">Checked In</p>
          </div>
        )}
        {event.capacity && (
          <div className="w-32">
            <div className="flex justify-between text-xs mb-1 text-foreground">
              <span>Capacity</span>
              <span>{fillRate}%</span>
            </div>
            <Progress value={fillRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {event._count.tickets} / {event.capacity}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading Skeleton
function AnalyticsSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-52" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-secondary/30 border-foreground/10">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
