"use client";

import { useCallback } from "react";
import { useWebSocket } from "@/contexts/websocket-context";
import { useToast } from "@/hooks/use-toast";
import type { NotificationPayload } from "@/lib/websocket-types";

interface UseRealtimeNotificationsOptions {
  showToasts?: boolean;
  autoHideDuration?: number;
}

export function useRealtimeNotifications(options: UseRealtimeNotificationsOptions = {}) {
  const { showToasts = true, autoHideDuration = 5000 } = options;
  const { notifications, clearNotification, clearAllNotifications, subscribe } = useWebSocket();
  const { toast } = useToast();

  const handleNotification = useCallback(
    (notification: NotificationPayload) => {
      if (showToasts) {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === "error" ? "destructive" : "default",
          duration: notification.persistent ? Number.POSITIVE_INFINITY : autoHideDuration,
        });
      }
    },
    [showToasts, autoHideDuration, toast]
  );

  const subscribeToNotifications = useCallback(
    (callback?: (notification: NotificationPayload) => void) => {
      return subscribe("notification", (message) => {
        const notification = message.payload as NotificationPayload;
        handleNotification(notification);
        callback?.(notification);
      });
    },
    [subscribe, handleNotification]
  );

  return {
    notifications,
    clearNotification,
    clearAllNotifications,
    subscribeToNotifications,
    unreadCount: notifications.length,
  };
}
