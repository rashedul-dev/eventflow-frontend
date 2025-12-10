"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ticketApi, paymentApi } from "@/lib/api";
import { Ticket, Calendar, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";

interface StatsData {
  totalTickets: number;
  upcomingEvents: number;
  totalSpent: number;
  eventsAttended: number;
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <polygon fill={`url(#gradient-${color})`} points={`0,100 ${points} 100,100`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [ticketsRes, paymentsRes] = await Promise.all([ticketApi.getMyTickets(), paymentApi.getMyPayments()]);

      const tickets = ticketsRes.data || [];
      const payments = paymentsRes.data || [];

      const now = new Date();
      const activeTickets = tickets.filter((t: any) => t.status === "ACTIVE" || t.status === "VALID");
      const usedTickets = tickets.filter((t: any) => t.status === "USED" || t.status === "CHECKED_IN");
      const upcomingTickets = activeTickets.filter((t: any) => t.event && new Date(t.event.startDate) > now);
      const totalSpent = payments
        .filter((p: any) => p.status === "COMPLETED" || p.status === "SUCCEEDED")
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      setStats({
        totalTickets: tickets.length,
        upcomingEvents: upcomingTickets.length,
        totalSpent,
        eventsAttended: usedTickets.length,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
      setStats({
        totalTickets: 0,
        upcomingEvents: 0,
        totalSpent: 0,
        eventsAttended: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-secondary/30 border-foreground/10">
            <CardContent className="p-6 flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsConfig = [
    {
      label: "Total Tickets",
      value: stats?.totalTickets || 0,
      icon: Ticket,
      trend: "up" as const,
      chartData: [30, 45, 35, 50, 60, 55, stats?.totalTickets || 0],
    },
    {
      label: "Upcoming Events",
      value: stats?.upcomingEvents || 0,
      icon: Calendar,
      trend: "neutral" as const,
      chartData: [1, 1, 2, 2, 3, 3, stats?.upcomingEvents || 0],
    },
    {
      label: "Total Spent",
      value: `$${(stats?.totalSpent || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: "up" as const,
      chartData: [200, 350, 400, 500, 700, 900, stats?.totalSpent || 0],
    },
    {
      label: "Events Attended",
      value: stats?.eventsAttended || 0,
      icon: TrendingUp,
      trend: "up" as const,
      chartData: [1, 2, 3, 4, 5, 6, stats?.eventsAttended || 0],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon =
          stat.trend === "up" ? ArrowUpRight : (stat.trend as string) === "down" ? ArrowDownRight : null;
        return (
          <Card
            key={stat.label}
            className="bg-secondary/30 border-foreground/10 hover:border-primary/30 transition-colors group"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                {TrendIcon && stat.trend !== "neutral" && (
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      stat.trend === "up" ? "text-primary" : "text-red-400"
                    }`}
                  >
                    <TrendIcon className="h-3 w-3" />
                  </div>
                )}
              </div>

              <div className="mb-3">
                <MiniChart
                  data={stat.chartData}
                  color={stat.trend === "up" ? "#08CB00" : (stat.trend as string) === "down" ? "#ef4444" : "#666"}
                />
              </div>

              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-foreground/60">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
