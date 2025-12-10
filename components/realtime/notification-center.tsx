"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/api/hooks";
import { wsClient } from "@/lib/api/websocket";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";
import { toast } from "sonner";

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  // Sync local state with API data
  useEffect(() => {
    if (data?.data) {
      setLocalNotifications(data.data);
    }
  }, [data]);

  // WebSocket subscription for real-time notifications
  useEffect(() => {
    const unsubNewNotification = wsClient.on("notification", (payload: Notification) => {
      setLocalNotifications((prev) => [payload, ...prev]);

      // Show toast for new notification
      toast(payload.title, {
        description: payload.message,
        style: {
          background: "#0a0a0a",
          border: "1px solid #253900",
          color: "#EEEEEE",
        },
        action: {
          label: "View",
          onClick: () => setIsOpen(true),
        },
      });
    });

    const unsubNotificationRead = wsClient.on("notification_read", (payload: { id: string }) => {
      setLocalNotifications((prev) =>
        prev.map((n) => (n.id === payload.id ? { ...n, status: "READ" as const, readAt: new Date().toISOString() } : n))
      );
    });

    return () => {
      unsubNewNotification();
      unsubNotificationRead();
    };
  }, []);

  const unreadCount = localNotifications.filter((n) => n.status !== "READ").length;

  const handleMarkRead = async (id: string) => {
    markRead.mutate(id);
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "READ" as const, readAt: new Date().toISOString() } : n))
    );
  };

  const handleMarkAllRead = async () => {
    markAllRead.mutate();
    setLocalNotifications((prev) =>
      prev.map((n) => ({ ...n, status: "READ" as const, readAt: new Date().toISOString() }))
    );
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "EMAIL":
        return "📧";
      case "SMS":
        return "📱";
      case "PUSH":
        return "🔔";
      case "IN_APP":
      default:
        return "💬";
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-secondary/30 transition-colors"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-background text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-background border border-secondary/30 rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-secondary/30">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary hover:text-primary/80"
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-secondary/30 rounded">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto" />
                </div>
              ) : localNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-secondary/20">
                  {localNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "px-4 py-3 hover:bg-secondary/10 transition-colors cursor-pointer",
                        notification.status !== "READ" && "bg-secondary/5"
                      )}
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={cn(
                                "text-sm truncate",
                                notification.status !== "READ"
                                  ? "font-semibold text-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              {notification.title}
                            </h4>
                            {notification.status !== "READ" && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">{formatTime(notification.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {localNotifications.length > 0 && (
              <div className="px-4 py-3 border-t border-secondary/30">
                <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary/80">
                  View all notifications
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
