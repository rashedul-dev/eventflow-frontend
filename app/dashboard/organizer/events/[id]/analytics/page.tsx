"use client";

import { useState, useEffect, use } from "react";
import { eventApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExportDialog } from "@/components/dashboard/export-dialog";
import { MetricCard } from "@/components/analytics/metric-card";
import { useApiError } from "@/hooks/use-api-error";
import { ApiErrorMessage } from "@/components/ui/api-error-message";
import { formatLargeNumber } from "@/lib/error/error-handler";
import { Loader2, ArrowLeft, DollarSign, Ticket, Users, Eye, RefreshCw, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

function safeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number.parseFloat(value) || 0;
  return Number(value) || 0;
}

export default function EventAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);

  const [analytics, setAnalytics] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error, handleError, clearError } = useApiError({ showToast: true });

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setIsLoading(true);
    clearError();
    try {
      const token = localStorage.getItem("accessToken");

      const [analyticsRes, eventRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/organizer/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        eventApi.getById(eventId),
      ]);

      if (!analyticsRes.ok) {
        throw new Error(`HTTP ${analyticsRes.status}`);
      }

      const analyticsResult = await analyticsRes.json();
      console.log("Event Analytics Response:", analyticsResult);

      setAnalytics(analyticsResult.data || analyticsResult);
      setEvent(eventRes.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/organizer/events">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Event Analytics</h1>
            <p className="text-muted-foreground">Detailed performance metrics</p>
          </div>
        </div>
        <ApiErrorMessage error={error} onRetry={fetchData} />
      </div>
    );
  }

  const revenue = safeNumber(analytics?.revenue || analytics?.totalRevenue);
  const ticketsSold = safeNumber(analytics?.ticketsSold);
  const checkedIn = safeNumber(analytics?.checkedIn);
  const pageViews = safeNumber(analytics?.pageViews || 0);
  const conversionRate = safeNumber(analytics?.conversionRate || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="icon">
              <Link href={`/dashboard/organizer/events/${eventId}`}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{event?.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {event?.startDate &&
                    new Date(event.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                </div>
                {event?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.city}
                  </div>
                )}
                <div className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">{event?.status}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={fetchData} className="bg-transparent">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <ExportDialog type="event" eventId={eventId} />
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue"
          value={`$${formatLargeNumber(revenue)}`}
          icon={DollarSign}
          description="Total earnings"
        />
        <MetricCard
          title="Tickets Sold"
          value={formatLargeNumber(ticketsSold)}
          icon={Ticket}
          description={`of ${event?.capacity || "unlimited"} capacity`}
        />
        <MetricCard
          title="Check-ins"
          value={formatLargeNumber(checkedIn)}
          icon={Users}
          description={ticketsSold ? `${((checkedIn / ticketsSold) * 100).toFixed(0)}% attendance` : "No tickets sold"}
        />
        <MetricCard
          title="Page Views"
          value={formatLargeNumber(pageViews)}
          icon={Eye}
          description={conversionRate ? `${conversionRate.toFixed(1)}% conversion` : "N/A"}
        />
      </div>

      {/* Sales Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-secondary/30 border-foreground/10">
          <CardHeader>
            <CardTitle className="text-foreground">Sales Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <span className="text-muted-foreground">Gross Revenue</span>
                <span className="font-bold text-foreground">${formatLargeNumber(revenue)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <span className="text-muted-foreground">Platform Fee (10%)</span>
                <span className="font-bold text-muted-foreground">
                  -${formatLargeNumber(safeNumber(revenue * 0.1))}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-foreground font-medium">Net Revenue</span>
                <span className="font-bold text-primary text-lg">${formatLargeNumber(safeNumber(revenue * 0.9))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-foreground/10">
          <CardHeader>
            <CardTitle className="text-foreground">Attendee Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <span className="text-muted-foreground">Total Attendees</span>
                <span className="font-bold text-foreground">{formatLargeNumber(ticketsSold)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <span className="text-muted-foreground">Checked In</span>
                <span className="font-bold text-green-500">{formatLargeNumber(checkedIn)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <span className="text-muted-foreground">Check-in Rate</span>
                <span className="font-bold text-foreground">
                  {ticketsSold ? ((checkedIn / ticketsSold) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                <span className="text-muted-foreground">Capacity Utilization</span>
                <span className="font-bold text-foreground">
                  {event?.capacity ? ((ticketsSold / event.capacity) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
