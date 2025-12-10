"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { analyticsApi, eventApi } from "@/lib/api";
import { Calendar, Users, DollarSign, TrendingUp, Ticket, Eye, Loader2 } from "lucide-react";

export function OrganizerStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, eventsRes] = await Promise.all([analyticsApi.getOrganizer(), eventApi.getMyEvents()]);

      const analytics = analyticsRes.data || {};
      const events = eventsRes.data || [];

      setStats({
        totalEvents: events.length,
        totalAttendees: analytics.totalAttendees || 0,
        revenue: analytics.totalRevenue || 0,
        ticketsSold: analytics.ticketsSold || 0,
        pageViews: analytics.pageViews || 0,
        conversionRate: analytics.conversionRate || 0,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
      setStats({
        totalEvents: 0,
        totalAttendees: 0,
        revenue: 0,
        ticketsSold: 0,
        pageViews: 0,
        conversionRate: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-secondary/30 border-foreground/10">
            <CardContent className="p-6 flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsConfig = [
    {
      label: "Total Events",
      value: stats?.totalEvents || 0,
      change: "All time",
      icon: Calendar,
    },
    {
      label: "Total Attendees",
      value: (stats?.totalAttendees || 0).toLocaleString(),
      change: "Across all events",
      icon: Users,
    },
    {
      label: "Revenue",
      value: `$${(stats?.revenue || 0).toLocaleString()}`,
      change: "Total earnings",
      icon: DollarSign,
    },
    {
      label: "Tickets Sold",
      value: (stats?.ticketsSold || 0).toLocaleString(),
      change: "All events",
      icon: Ticket,
    },
    {
      label: "Page Views",
      value: stats?.pageViews ? `${(stats.pageViews / 1000).toFixed(1)}K` : "0",
      change: "Event pages",
      icon: Eye,
    },
    {
      label: "Conversion Rate",
      value: `${(stats?.conversionRate || 0).toFixed(1)}%`,
      change: "Views to sales",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="bg-secondary/30 border-foreground/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-foreground/60">{stat.label}</p>
                <p className="text-xs text-primary">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
