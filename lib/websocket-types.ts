// WebSocket message types and interfaces

export type WebSocketMessageType =
  | "connection"
  | "event_update"
  | "ticket_update"
  | "attendee_update"
  | "notification"
  | "analytics_update"
  | "check_in"
  | "payment_update"
  | "error"
  | "ping"
  | "pong";

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  payload: T;
  timestamp: string;
  eventId?: string;
  userId?: string;
}

export interface EventUpdatePayload {
  eventId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  updatedBy: string;
}

export interface TicketUpdatePayload {
  eventId: string;
  ticketTypeId: string;
  action: "sold" | "reserved" | "cancelled" | "refunded";
  quantity: number;
  remainingQuantity: number;
  totalSold: number;
}

export interface AttendeeUpdatePayload {
  eventId: string;
  attendeeId: string;
  action: "registered" | "checked_in" | "cancelled";
  attendeeName: string;
  ticketType: string;
}

export interface CheckInPayload {
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  ticketType: string;
  checkInTime: string;
  checkInMethod: "qr" | "manual" | "nfc";
  message?: string;
}

export interface AnalyticsUpdatePayload {
  eventId: string;
  metric: string;
  value: number;
  previousValue: number;
  changePercent: number;
}

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  actionUrl?: string;
  actionLabel?: string;
  persistent?: boolean;
}

export interface PaymentUpdatePayload {
  eventId: string;
  orderId: string;
  status: "pending" | "completed" | "failed" | "refunded";
  amount: number;
  currency: string;
  customerEmail: string;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting" | "error";

export interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}
