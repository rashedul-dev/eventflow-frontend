"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/contexts/websocket-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Activity, UserCheck, Ticket, CreditCard, UserPlus, UserMinus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type {
  WebSocketMessage,
  TicketUpdatePayload,
  AttendeeUpdatePayload,
  CheckInPayload,
  PaymentUpdatePayload,
} from "@/lib/websocket-types";

interface ActivityItem {
  id: string;
  type: "ticket" | "check_in" | "attendee" | "payment";
  title: string;
  description: string;
  timestamp: Date;
  icon: typeof Activity;
  color: string;
}

interface LiveActivityFeedProps {
  eventId?: string;
  maxItems?: number;
  className?: string;
}

const activityConfig = {
  ticket: { icon: Ticket, color: "text-blue-500 bg-blue-500/10" },
  check_in: { icon: UserCheck, color: "text-green-500 bg-green-500/10" },
  attendee_registered: { icon: UserPlus, color: "text-purple-500 bg-purple-500/10" },
  attendee_cancelled: { icon: UserMinus, color: "text-red-500 bg-red-500/10" },
  payment: { icon: CreditCard, color: "text-emerald-500 bg-emerald-500/10" },
};

export function LiveActivityFeed({ eventId, maxItems = 20, className }: LiveActivityFeedProps) {
  const { subscribe, status } = useWebSocket();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const addActivity = (activity: Omit<ActivityItem, "id">) => {
      setActivities((prev) => {
        const newActivity = { ...activity, id: `${Date.now()}-${Math.random()}` };
        return [newActivity, ...prev].slice(0, maxItems);
      });
    };

    const unsubscribers = [
      subscribe("ticket_update", (message: WebSocketMessage) => {
        const payload = message.payload as TicketUpdatePayload;
        if (eventId && payload.eventId !== eventId) return;

        const config = activityConfig.ticket;
        addActivity({
          type: "ticket",
          title: `Ticket ${payload.action}`,
          description: `${payload.quantity} ticket(s) ${payload.action}`,
          timestamp: new Date(message.timestamp),
          icon: config.icon,
          color: config.color,
        });
      }),

      subscribe("check_in", (message: WebSocketMessage) => {
        const payload = message.payload as CheckInPayload;
        if (eventId && payload.eventId !== eventId) return;

        const config = activityConfig.check_in;
        addActivity({
          type: "check_in",
          title: "Check-in",
          description: `${payload.attendeeName} checked in`,
          timestamp: new Date(message.timestamp),
          icon: config.icon,
          color: config.color,
        });
      }),

      subscribe("attendee_update", (message: WebSocketMessage) => {
        const payload = message.payload as AttendeeUpdatePayload;
        if (eventId && payload.eventId !== eventId) return;

        const configKey = payload.action === "cancelled" ? "attendee_cancelled" : "attendee_registered";
        const config = activityConfig[configKey];
        addActivity({
          type: "attendee",
          title: payload.action === "registered" ? "New Registration" : "Cancellation",
          description: `${payload.attendeeName} - ${payload.ticketType}`,
          timestamp: new Date(message.timestamp),
          icon: config.icon,
          color: config.color,
        });
      }),

      subscribe("payment_update", (message: WebSocketMessage) => {
        const payload = message.payload as PaymentUpdatePayload;
        if (eventId && payload.eventId !== eventId) return;

        const config = activityConfig.payment;
        addActivity({
          type: "payment",
          title: `Payment ${payload.status}`,
          description: `${payload.currency} ${payload.amount.toFixed(2)}`,
          timestamp: new Date(message.timestamp),
          icon: config.icon,
          color: config.color,
        });
      }),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [subscribe, eventId, maxItems]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Activity
          </CardTitle>
          <Badge variant={status === "connected" ? "default" : "secondary"} className="text-xs">
            {status === "connected" ? "Live" : "Offline"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Activity className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground/70">Activity will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-lg transition-all",
                      index === 0 && "animate-in fade-in slide-in-from-top-2 duration-300"
                    )}
                  >
                    <div
                      className={cn("shrink-0 h-8 w-8 rounded-full flex items-center justify-center", activity.color)}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
