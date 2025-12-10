"use client";

import { useEffect, useCallback, useState } from "react";
import { useWebSocket } from "@/contexts/websocket-context";
import type {
  WebSocketMessage,
  EventUpdatePayload,
  TicketUpdatePayload,
  AttendeeUpdatePayload,
  CheckInPayload,
  AnalyticsUpdatePayload,
} from "@/lib/websocket-types";

interface UseRealtimeEventOptions {
  eventId: string;
  onEventUpdate?: (payload: EventUpdatePayload) => void;
  onTicketUpdate?: (payload: TicketUpdatePayload) => void;
  onAttendeeUpdate?: (payload: AttendeeUpdatePayload) => void;
  onCheckIn?: (payload: CheckInPayload) => void;
  onAnalyticsUpdate?: (payload: AnalyticsUpdatePayload) => void;
}

interface RealtimeEventStats {
  totalCheckIns: number;
  recentCheckIns: CheckInPayload[];
  ticketsSoldToday: number;
  liveAttendees: number;
}

export function useRealtimeEvent({
  eventId,
  onEventUpdate,
  onTicketUpdate,
  onAttendeeUpdate,
  onCheckIn,
  onAnalyticsUpdate,
}: UseRealtimeEventOptions) {
  const { subscribe, status } = useWebSocket();
  const [stats, setStats] = useState<RealtimeEventStats>({
    totalCheckIns: 0,
    recentCheckIns: [],
    ticketsSoldToday: 0,
    liveAttendees: 0,
  });

  const handleEventUpdate = useCallback(
    (message: WebSocketMessage) => {
      const payload = message.payload as EventUpdatePayload;
      if (payload.eventId === eventId) {
        onEventUpdate?.(payload);
      }
    },
    [eventId, onEventUpdate]
  );

  const handleTicketUpdate = useCallback(
    (message: WebSocketMessage) => {
      const payload = message.payload as TicketUpdatePayload;
      if (payload.eventId === eventId) {
        onTicketUpdate?.(payload);
        if (payload.action === "sold") {
          setStats((prev) => ({
            ...prev,
            ticketsSoldToday: prev.ticketsSoldToday + payload.quantity,
          }));
        }
      }
    },
    [eventId, onTicketUpdate]
  );

  const handleAttendeeUpdate = useCallback(
    (message: WebSocketMessage) => {
      const payload = message.payload as AttendeeUpdatePayload;
      if (payload.eventId === eventId) {
        onAttendeeUpdate?.(payload);
        if (payload.action === "checked_in") {
          setStats((prev) => ({
            ...prev,
            liveAttendees: prev.liveAttendees + 1,
          }));
        }
      }
    },
    [eventId, onAttendeeUpdate]
  );

  const handleCheckIn = useCallback(
    (message: WebSocketMessage) => {
      const payload = message.payload as CheckInPayload;
      if (payload.eventId === eventId) {
        onCheckIn?.(payload);
        setStats((prev) => ({
          ...prev,
          totalCheckIns: prev.totalCheckIns + 1,
          recentCheckIns: [payload, ...prev.recentCheckIns].slice(0, 10),
        }));
      }
    },
    [eventId, onCheckIn]
  );

  const handleAnalyticsUpdate = useCallback(
    (message: WebSocketMessage) => {
      const payload = message.payload as AnalyticsUpdatePayload;
      if (payload.eventId === eventId) {
        onAnalyticsUpdate?.(payload);
      }
    },
    [eventId, onAnalyticsUpdate]
  );

  useEffect(() => {
    const unsubscribers = [
      subscribe("event_update", handleEventUpdate),
      subscribe("ticket_update", handleTicketUpdate),
      subscribe("attendee_update", handleAttendeeUpdate),
      subscribe("check_in", handleCheckIn),
      subscribe("analytics_update", handleAnalyticsUpdate),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [subscribe, handleEventUpdate, handleTicketUpdate, handleAttendeeUpdate, handleCheckIn, handleAnalyticsUpdate]);

  return {
    isConnected: status === "connected",
    connectionStatus: status,
    stats,
  };
}
