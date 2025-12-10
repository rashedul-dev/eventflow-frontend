"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notificationApi } from "@/lib/api";
import { Ticket, CreditCard, Bell, Calendar, Loader2 } from "lucide-react";
import { NotificationItem, NotificationListDto } from "@/lib/types";

const iconMap: Record<string, any> = {
  TICKET: Ticket,
  PAYMENT: CreditCard,
  EVENT: Calendar,
  default: Bell,
};

export function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    setIsLoading(true);
    try {
      const response = await notificationApi.getAll({ limit: 5 });
      setActivities(response.data?.notifications ?? []); // Extract the notifications array
    } catch (err) {
      console.error("Failed to load activity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return past.toLocaleDateString();
  };

  return (
    <Card className="bg-secondary/30 border-foreground/10">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = iconMap[activity.type] || iconMap.default;
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-foreground/60 truncate">{activity.message}</p>
                </div>
                <span className="text-xs text-foreground/40 shrink-0">{formatTime(activity.createdAt)}</span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
