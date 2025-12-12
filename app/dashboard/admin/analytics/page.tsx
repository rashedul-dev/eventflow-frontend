"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Calendar, Ticket, DollarSign, TrendingUp, RefreshCw } from "lucide-react";
import { AdminAnalyticsResponse, CommissionReportsResponse, IAnalyticsQuery } from "@/lib/interface";
import { analyticsApi } from "@/lib/api";

const PERIOD_OPTIONS = [
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "Last 30 Days" },
  { value: "quarter", label: "Last 3 Months" },
  { value: "year", label: "Last Year" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function PlatformAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [commissionReports, setCommissionReports] = useState<CommissionReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const query: IAnalyticsQuery = { period: selectedPeriod as IAnalyticsQuery["period"] };

      const [analyticsRes, commissionRes] = await Promise.all([
        analyticsApi.getAdminAnalytics(query),
        analyticsApi.getCommissionReports(),
      ]);

      setAnalytics(analyticsRes.data || null);
      setCommissionReports(commissionRes.data || null);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const totalRevenue = analytics?.overview?.totalRevenue || 0;
  const totalUsers = analytics?.overview?.totalUsers || 0;
  const activeEvents = analytics?.overview?.activeEvents || 0;

  const ticketsSold = analytics?.topEvents?.reduce((sum, event) => sum + (Number(event.ticketsSold) || 0), 0) || 0;
  const avgTicketsPerEvent = activeEvents > 0 ? Math.round(ticketsSold / activeEvents) : 0;

  const commissionEarned = commissionReports?.summary?.totalCommission || 0;
  const grossSales = commissionReports?.summary?.totalRevenue || 0;
  const organizerPayouts = commissionReports?.summary?.totalPayout || 0;
  const commissionRate = grossSales > 0 ? Math.round((commissionEarned / grossSales) * 100) : 5;

  const monthlyCommissionData =
    analytics?.revenueByPeriod?.map((item) => ({
      month: item.date,
      commission: item.revenue,
    })) || [];

  console.log(" Calculated metrics:", {
    totalRevenue,
    totalUsers,
    activeEvents,
    ticketsSold,
    avgTicketsPerEvent,
    commissionEarned,
    grossSales,
    organizerPayouts,
    commissionRate,
    monthlyCommissionData,
  });

  if (loading) {
    return (
      <div className="flex h-150 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-150 items-center justify-center">
        <Card className="bg-secondary/30 border-foreground/10 max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchData} className="mt-4 w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground">Monitor platform performance and revenue</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-45 bg-secondary/30 border-foreground/10">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchData} size="icon" variant="outline" className="bg-secondary/30 border-foreground/10">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-secondary/30 border-foreground/10 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Gross platform sales</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{activeEvents}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10 border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Sold</CardTitle>
            <Ticket className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsSold}</div>
            <p className="text-xs text-muted-foreground">
              Avg ${(ticketsSold > 0 ? totalRevenue / ticketsSold : 0).toFixed(2)} per ticket
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Report */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <CardTitle>Commission Report</CardTitle>
          </div>
          <CardDescription>Platform earnings breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-green-950/50 border-green-900/50">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-500">${commissionEarned.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground mt-1">Commission Earned</p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/50 border-foreground/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">${grossSales.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground mt-1">Gross Sales</p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/50 border-foreground/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">${organizerPayouts.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground mt-1">Organizer Payouts</p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/50 border-foreground/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">{commissionRate}%</div>
                <p className="text-sm text-muted-foreground mt-1">Commission Rate</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Over Time */}
        <Card className="bg-secondary/30 border-foreground/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <CardTitle>Revenue Over Time</CardTitle>
            </div>
            <CardDescription>Daily revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-75 flex items-center justify-center">
              {analytics?.revenueByPeriod && analytics.revenueByPeriod.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.revenueByPeriod}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                    <XAxis dataKey="period" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                      labelStyle={{ color: "#999" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">No revenue data available for this period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Events */}
        <Card className="bg-secondary/30 border-foreground/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <CardTitle>Top Events</CardTitle>
            </div>
            <CardDescription>Best performing events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-75">
              {analytics?.topEvents && analytics.topEvents.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topEvents.slice(0, 5).map((event, index) => {
                    const eventRevenue = Number(event.revenue) || 0;

                    return (
                      <div key={event.eventId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-500">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{event.eventTitle}</p>
                            <p className="text-xs text-muted-foreground">{event.ticketsSold} tickets sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {/* <p className="font-bold text-green-500">${event?.revenue?.toFixed(2)}</p> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                  <p className="text-sm">No event data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-secondary/30 border-foreground/10">
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="text-lg font-bold">{totalUsers}</span>
            </div>
            <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
              <span className="text-sm text-muted-foreground">Active Events</span>
              <span className="text-lg font-bold text-green-500">{activeEvents}</span>
            </div>
            <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
              <span className="text-sm text-muted-foreground">Total Tickets Sold</span>
              <span className="text-lg font-bold">{ticketsSold}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Tickets / Event</span>
              <span className="text-lg font-bold">{avgTicketsPerEvent}</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Commission */}
        <Card className="bg-secondary/30 border-foreground/10">
          <CardHeader>
            <CardTitle>Monthly Commission</CardTitle>
            <CardDescription>Commission earned by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-50">
              {monthlyCommissionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyCommissionData}>
                    <defs>
                      <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                      labelStyle={{ color: "#999" }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Commission"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="commission"
                      stroke="#a855f7"
                      strokeWidth={2}
                      fill="url(#commissionGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground">
                  <div className="mx-auto h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                    <DollarSign className="h-6 w-6 text-purple-500" />
                  </div>
                  <p className="text-sm">No commission data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
