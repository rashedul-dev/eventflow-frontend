"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Users,
  Calendar,
  Ticket,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { analyticsApi } from "@/lib/api";
import { AdminAnalyticsResponse, CommissionReportsResponse, IAnalyticsQuery } from "@/lib/interface";

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

export default function AdminAnalyticsPage() {
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

      // Fetch admin analytics and commission reports in parallel
      const [analyticsRes, commissionRes] = await Promise.all([
        analyticsApi.getAdminAnalytics(query),
        analyticsApi.getCommissionReports(),
      ]);

      setAnalytics(analyticsRes.data || null);
      setCommissionReports(commissionRes.data || null);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  if (loading) {
    return <AdminAnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
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

  const totalRevenue = analytics?.totalRevenue || 0;
  const ticketsSold = analytics?.ticketsSold || 0;
  const activeEvents = analytics?.activeEvents || 0;
  const totalUsers = analytics?.totalUsers || 0;
  const platformCommission = analytics?.platformCommission || 0;
  const organizerPayout = totalRevenue - platformCommission;
  const avgTicketPrice = ticketsSold > 0 ? totalRevenue / ticketsSold : 0;
  const avgTicketsPerEvent = activeEvents > 0 ? Math.round(ticketsSold / activeEvents) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">Monitor platform performance and revenue</p>
        </div>
        <div className="flex items-center gap-3">
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
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          description="Gross platform sales"
          highlight
        />
        <MetricCard title="Total Users" value={formatNumber(totalUsers)} icon={Users} description="Registered users" />
        <MetricCard
          title="Active Events"
          value={formatNumber(activeEvents)}
          icon={Calendar}
          description="Currently active"
        />
        <MetricCard
          title="Tickets Sold"
          value={formatNumber(ticketsSold)}
          icon={Ticket}
          description={`Avg ${formatCurrency(avgTicketPrice)} per ticket`}
        />
      </div>

      {/* Commission Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Commission Report
            </CardTitle>
            <CardDescription>Platform earnings breakdown</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-3xl font-bold text-primary">{formatCurrency(platformCommission)}</p>
              <p className="text-sm text-muted-foreground mt-1">Commission Earned</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-1">Gross Sales</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold">{formatCurrency(organizerPayout)}</p>
              <p className="text-sm text-muted-foreground mt-1">Organizer Payouts</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold">10%</p>
              <p className="text-sm text-muted-foreground mt-1">Commission Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        {analytics?.revenueData && analytics.revenueData.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data available for this period
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Events */}
        {analytics?.topEvents && analytics.topEvents.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Events by Revenue
              </CardTitle>
              <CardDescription>Best performing events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.topEvents.map((e) => ({
                      name: e.title.length > 15 ? e.title.substring(0, 15) + "..." : e.title,
                      fullName: e.title,
                      revenue: e.revenue,
                      tickets: e.ticketsSold,
                    }))}
                    layout="vertical"
                    margin={{ left: 10, right: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                      }}
                      formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                      labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.fullName || label}
                    />
                    <Bar dataKey="revenue" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No event data available
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Total Users</span>
                <span className="font-bold">{formatNumber(totalUsers)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Active Events</span>
                <span className="font-bold text-green-500">{formatNumber(activeEvents)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Total Tickets Sold</span>
                <span className="font-bold">{formatNumber(ticketsSold)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-muted-foreground">Avg Tickets / Event</span>
                <span className="font-bold">{formatNumber(avgTicketsPerEvent)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission by Month */}
        {commissionReports?.monthlyBreakdown && commissionReports.monthlyBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Commission</CardTitle>
              <CardDescription>Commission earned by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={commissionReports.monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => {
                        const [year, month] = value.split("-");
                        return new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString("en-US", {
                          month: "short",
                        });
                      }}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => [formatCurrency(value), "Commission"]}
                    />
                    <Line type="monotone" dataKey="commission" stroke="#a855f7" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Organizer Reports */}
      {commissionReports?.reports && commissionReports.reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Organizer Commission Reports</CardTitle>
            <CardDescription>Commission owed by each organizer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commissionReports.reports.map((report) => (
                <div key={report.organizerId} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{report.organizerName}</h3>
                      <p className="text-sm text-muted-foreground">{report.eventCount} events</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">{formatCurrency(report.totalSales)}</p>
                        <p className="text-xs text-muted-foreground">Total Sales</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-primary">{formatCurrency(report.commissionOwed)}</p>
                        <p className="text-xs text-muted-foreground">Commission Owed</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
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
    <Card className={highlight ? "border-primary/50" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <Icon className={`h-8 w-8 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function AdminAnalyticsSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-[100px] w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
