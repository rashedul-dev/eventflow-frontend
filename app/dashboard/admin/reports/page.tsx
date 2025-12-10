"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Loader2,
  Download,
  DollarSign,
  AlertTriangle,
  RefreshCcw,
  Users,
  Calendar,
  TrendingUp,
  Ticket,
  Building2,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyticsApi } from "@/lib/api";

const PLATFORM_FEE_RATE = 0.05; // 5%

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0);
};

const safeNumber = (val: any): number => {
  if (typeof val === "bigint") return Number(val);
  if (typeof val === "string") return Number.parseFloat(val) || 0;
  return val || 0;
};

interface OrganizerReport {
  organizerId: string;
  organizerName: string;
  organizerEmail?: string;
  totalSales: number;
  commissionOwed: number;
  eventCount: number;
  events: Array<{
    eventId: string;
    eventTitle: string;
    eventRevenue: number;
    commission: number;
    ticketsSold: number;
  }>;
}

interface CommissionData {
  summary: {
    totalCommission: number;
    totalPaid: number;
    totalUnpaid: number;
    totalGrossSales: number;
    totalOrganizerPayout: number;
    totalOrganizers: number;
    totalEvents: number;
    totalTickets: number;
  };
  reports: OrganizerReport[];
}

export default function CommissionReportsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<CommissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [expandedOrganizer, setExpandedOrganizer] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [selectedPeriod]);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params based on period
      const params: any = {};
      if (selectedPeriod !== "all") {
        const now = new Date();
        const dateFrom = new Date();

        switch (selectedPeriod) {
          case "7d":
            dateFrom.setDate(now.getDate() - 7);
            break;
          case "30d":
            dateFrom.setDate(now.getDate() - 30);
            break;
          case "90d":
            dateFrom.setDate(now.getDate() - 90);
            break;
          case "1y":
            dateFrom.setFullYear(now.getFullYear() - 1);
            break;
        }
        params.dateFrom = dateFrom.toISOString();
        params.dateTo = now.toISOString();
      }

      const res = await analyticsApi.getCommissionReports(params);
      const apiData = res.data;

      if (!apiData) {
        throw new Error("No data returned from API");
      }

      // Map the API response correctly
      const reports: OrganizerReport[] = (apiData.reports || []).map((r: any) => ({
        organizerId: r.organizerId,
        organizerName: r.organizerName || r.organizerId,
        organizerEmail: r.organizerEmail,
        totalSales: safeNumber(r.totalSales),
        commissionOwed: safeNumber(r.commissionOwed),
        eventCount: safeNumber(r.eventCount),
        events: (r.events || []).map((e: any) => ({
          eventId: e.eventId,
          eventTitle: e.eventTitle,
          eventRevenue: safeNumber(e.eventRevenue),
          commission: safeNumber(e.commission),
          ticketsSold: safeNumber(e.ticketsSold),
        })),
      }));

      // Calculate totals from reports data
      const totalGrossSales = reports.reduce((sum, r) => sum + r.totalSales, 0);
      const totalCommission = reports.reduce((sum, r) => sum + r.commissionOwed, 0);
      const totalOrganizerPayout = totalGrossSales - totalCommission;
      const totalEvents = reports.reduce((sum, r) => sum + r.eventCount, 0);
      const totalTickets = reports.reduce((sum, r) => sum + r.events.reduce((eSum, e) => eSum + e.ticketsSold, 0), 0);

      setData({
        summary: {
          totalCommission: apiData.summary?.totalCommission || totalCommission,
          totalPaid: safeNumber(apiData.summary?.totalPaid),
          totalUnpaid: safeNumber(apiData.summary?.totalUnpaid),
          totalGrossSales,
          totalOrganizerPayout,
          totalOrganizers: reports.length,
          totalEvents,
          totalTickets,
        },
        reports,
      });
    } catch (err: any) {
      console.error("Failed to load commission report:", err);
      setError(err.message || "Failed to load commission report");
      toast({
        title: "Error",
        description: err.message || "Failed to load commission report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;

    // Create CSV content
    let csv = "Organizer,Email,Events,Gross Sales,Commission (5%),Payout\n";
    data.reports.forEach((r) => {
      csv += `"${r.organizerName}","${r.organizerEmail || ""}",${r.eventCount},${r.totalSales},${r.commissionOwed},${
        r.totalSales - r.commissionOwed
      }\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commission-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "Export Complete",
      description: "Commission report has been downloaded.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading commission reports...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalCommission: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    totalGrossSales: 0,
    totalOrganizerPayout: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalTickets: 0,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Commission Reports</h1>
          <p className="text-muted-foreground">Platform earnings and organizer payouts (5% commission)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchReport} disabled={isLoading}>
            <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={!data}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Time Period:</span>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Breakdown Card */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <DollarSign className="h-5 w-5" />
            Revenue Breakdown
          </CardTitle>
          <CardDescription>Platform commission is 5% of gross sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background/50 text-center">
              <p className="text-3xl font-bold text-foreground">{formatCurrency(summary.totalGrossSales)}</p>
              <p className="text-sm text-muted-foreground mt-1">Gross Sales</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-3xl font-bold text-primary">{formatCurrency(summary.totalCommission)}</p>
              <p className="text-sm text-muted-foreground mt-1">Platform Commission (5%)</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 text-center">
              <p className="text-3xl font-bold text-foreground">{formatCurrency(summary.totalOrganizerPayout)}</p>
              <p className="text-sm text-muted-foreground mt-1">Organizer Payouts (95%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-green-500 bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commission Paid</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.totalPaid)}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commission Pending</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.totalUnpaid)}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Organizers</p>
                <p className="text-2xl font-bold text-foreground">{summary.totalOrganizers}</p>
              </div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Events</p>
                <p className="text-2xl font-bold text-foreground">{summary.totalEvents}</p>
              </div>
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets Sold</p>
                <p className="text-2xl font-bold text-foreground">{summary.totalTickets}</p>
              </div>
              <Ticket className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30 border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Ticket</p>
                <p className="text-2xl font-bold text-foreground">
                  {summary.totalTickets > 0 ? formatCurrency(summary.totalGrossSales / summary.totalTickets) : "$0.00"}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizers Table */}
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Building2 className="h-5 w-5" />
            Organizer Reports
          </CardTitle>
          <CardDescription>Click on an organizer to view event details</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.reports && data.reports.length > 0 ? (
            <div className="space-y-2">
              {data.reports.map((org) => (
                <div key={org.organizerId} className="border border-border rounded-lg overflow-hidden">
                  {/* Organizer Row */}
                  <button
                    onClick={() => setExpandedOrganizer(expandedOrganizer === org.organizerId ? null : org.organizerId)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">{org.organizerName}</p>
                        <p className="text-sm text-muted-foreground">{org.eventCount} events</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-muted-foreground">Gross Sales</p>
                        <p className="font-medium text-foreground">{formatCurrency(org.totalSales)}</p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-sm text-muted-foreground">Commission</p>
                        <p className="font-medium text-primary">{formatCurrency(org.commissionOwed)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Payout</p>
                        <p className="font-medium text-foreground">
                          {formatCurrency(org.totalSales - org.commissionOwed)}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-muted-foreground transition-transform ${
                          expandedOrganizer === org.organizerId ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Events */}
                  {expandedOrganizer === org.organizerId && org.events.length > 0 && (
                    <div className="border-t border-border bg-muted/30">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-foreground">Event</TableHead>
                            <TableHead className="text-foreground">Tickets</TableHead>
                            <TableHead className="text-foreground">Revenue</TableHead>
                            <TableHead className="text-foreground">Commission</TableHead>
                            <TableHead className="text-right text-foreground">Payout</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {org.events.map((event) => (
                            <TableRow key={event.eventId} className="border-border">
                              <TableCell className="font-medium text-foreground">{event.eventTitle}</TableCell>
                              <TableCell className="text-foreground">{event.ticketsSold}</TableCell>
                              <TableCell className="text-foreground">{formatCurrency(event.eventRevenue)}</TableCell>
                              <TableCell className="text-primary">{formatCurrency(event.commission)}</TableCell>
                              <TableCell className="text-right text-foreground">
                                {formatCurrency(event.eventRevenue - event.commission)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* No events message */}
                  {expandedOrganizer === org.organizerId && org.events.length === 0 && (
                    <div className="border-t border-border bg-muted/30 p-4 text-center text-muted-foreground">
                      No event details available
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No commission reports available</p>
              <p className="text-sm mt-1">Reports will appear once events have ticket sales</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
