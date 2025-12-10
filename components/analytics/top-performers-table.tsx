"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLargeNumber } from "@/lib/error/error-handler";
import { Trophy } from "lucide-react";

interface TopPerformersTableProps {
  data: Array<{
    id: string;
    eventId?: string;
    eventTitle?: string;
    name?: string;
    title?: string;
    revenue: number;
    ticketsSold?: number;
    eventCount?: number;
  }>;
  title?: string;
  type: "events" | "organizers";
}

export function TopPerformersTable({ data, title, type }: TopPerformersTableProps) {
  const defaultTitle = type === "events" ? "Top Performing Events" : "Top Organizers";

  if (!data || data.length === 0) {
    return (
      <Card className="bg-secondary/30 border-foreground/10">
        <CardHeader>
          <CardTitle className="text-foreground">{title || defaultTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary/30 border-foreground/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">{title || defaultTitle}</CardTitle>
        <Trophy className="w-5 h-5 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={item.id || item.eventId}
              className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? "bg-amber-500/20 text-amber-500"
                      : index === 1
                      ? "bg-gray-400/20 text-gray-400"
                      : index === 2
                      ? "bg-amber-700/20 text-amber-700"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.title || item.eventTitle || item.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {item.ticketsSold !== undefined && (
                      <p className="text-sm text-muted-foreground">{formatLargeNumber(item.ticketsSold)} tickets</p>
                    )}
                    {item.eventCount !== undefined && (
                      <p className="text-sm text-muted-foreground">{item.eventCount} events</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-foreground">${formatLargeNumber(item.revenue)}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
