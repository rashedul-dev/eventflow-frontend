"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationApi } from "@/lib/api";
import { useApiError } from "@/hooks/use-api-error";
import { Bell, Ticket, CreditCard, Calendar, Check, Loader2, RefreshCw, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

const iconMap: Record<string, any> = {
  EMAIL: Bell,
  SMS: CreditCard,
  PUSH: Bell,
  IN_APP: Info,
  TICKET_PURCHASE: Ticket,
  EVENT_REMINDER: Calendar,
  EVENT_UPDATED: Calendar,
  EVENT_CANCELLED: AlertCircle,
  PAYMENT: CreditCard,
  PAYMENT_SUCCESS: CreditCard,
  PAYMENT_FAILED: AlertCircle,
  default: Bell,
};

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  readAt?: string;
  createdAt: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { handleError } = useApiError({ showToast: false, redirectOnAuth: false });

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await notificationApi.getAll({ limit: 5 });
      if (response.data) {
        const notificationsData = response.data.notifications || response.data || [];
        const unread = response.data.unreadCount ?? notificationsData.filter((n: Notification) => !n.readAt).length;
        setNotifications(notificationsData);
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setHasError(true);
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationApi.getAll({ limit: 10 });
      if (response.data) {
        const notificationsData = response.data.notifications || response.data || [];
        const unread = response.data.unreadCount ?? notificationsData.filter((n: Notification) => !n.readAt).length;
        setUnreadCount(unread);
        setHasError(false);
      }
    } catch (err) {
      // Silently fail for background polling
      console.error("Failed to fetch notification count:", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    // Initial fetch for unread count
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification marked as read");
    } catch (err) {
      console.error("Failed to mark as read:", err);
      handleError(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      handleError(err);
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return past.toLocaleDateString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-card border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={handleMarkAllAsRead}>
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : hasError ? (
          <div className="py-6 px-4 text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Failed to load notifications</p>
            <Button variant="outline" size="sm" onClick={fetchNotifications}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Try Again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = iconMap[notification.type] || iconMap.default;
              const isUnread = !notification.readAt;
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 cursor-pointer ${isUnread ? "bg-primary/5" : ""}`}
                  onClick={() => isUnread && handleMarkAsRead(notification.id)}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${isUnread ? "bg-primary/20" : "bg-muted"}`}>
                    <Icon className={`h-4 w-4 ${isUnread ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isUnread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(notification.createdAt)}</p>
                  </div>
                  {isUnread && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}

        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className="justify-center py-3">
          <Link href="/dashboard/notifications" className="text-primary font-medium">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}