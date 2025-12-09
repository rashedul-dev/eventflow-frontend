"use client";

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  paymentApi,
  type CreatePaymentIntentRequest,
  type ConfirmPaymentRequest,
  type RefundPaymentRequest,
} from "./payment";
import type { Event, Ticket, User, Notification, SeatingChart, Seat } from "@/lib/types";

// Query keys factory
export const queryKeys = {
  // Auth
  auth: {
    me: ["auth", "me"] as const,
  },
  // Users
  users: {
    all: ["users"] as const,
    profile: ["users", "profile"] as const,
    organizers: ["users", "organizers"] as const,
    organizer: (id: string) => ["users", "organizers", id] as const,
  },
  // Events
  events: {
    all: ["events"] as const,
    list: (filters?: Record<string, any>) => ["events", "list", filters] as const,
    detail: (slug: string) => ["events", "detail", slug] as const,
    byId: (id: string) => ["events", "byId", id] as const,
    myEvents: ["events", "myEvents"] as const,
    seating: (id: string) => ["events", id, "seating"] as const,
    seats: (id: string) => ["events", id, "seats"] as const,
    analytics: (id: string) => ["events", id, "analytics"] as const,
  },
  // Tickets
  tickets: {
    all: ["tickets"] as const,
    myTickets: (filters?: Record<string, any>) => ["tickets", "myTickets", filters] as const,
    detail: (id: string) => ["tickets", "detail", id] as const,
    event: (eventId: string) => ["tickets", "event", eventId] as const,
  },
  // Payments
  payments: {
    all: ["payments"] as const,
    myPayments: (filters?: Record<string, any>) => ["payments", "myPayments", filters] as const,
    detail: (id: string) => ["payments", "detail", id] as const,
    eventPayments: (eventId: string, filters?: Record<string, any>) => ["payments", "event", eventId, filters] as const,
    analytics: (params?: Record<string, any>) => ["payments", "analytics", params] as const,
  },
  // Notifications
  notifications: {
    all: ["notifications"] as const,
    list: (filters?: Record<string, any>) => ["notifications", "list", filters] as const,
    preferences: ["notifications", "preferences"] as const,
  },
  // Analytics
  analytics: {
    organizer: (params?: Record<string, any>) => ["analytics", "organizer", params] as const,
    platform: (params?: Record<string, any>) => ["analytics", "platform", params] as const,
  },
};

// Auth hooks
export function useCurrentUser(options?: Partial<UseQueryOptions<{ data: User }>>) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => apiClient.get<{ data: User }>("/auth/me"),
    ...options,
  });
}

// Event hooks
export function useEvents(
  filters?: Record<string, any>,
  options?: Partial<UseQueryOptions<{ data: Event[]; meta?: any }>>
) {
  return useQuery({
    queryKey: queryKeys.events.list(filters),
    queryFn: () => apiClient.get<{ data: Event[]; meta?: any }>("/events", filters),
    ...options,
  });
}

export function useEvent(slug: string, options?: Partial<UseQueryOptions<{ data: Event }>>) {
  return useQuery({
    queryKey: queryKeys.events.detail(slug),
    queryFn: () => apiClient.get<{ data: Event }>(`/events/slug/${slug}`),
    enabled: !!slug,
    ...options,
  });
}

export function useMyEvents(options?: Partial<UseQueryOptions<{ data: Event[] }>>) {
  return useQuery({
    queryKey: queryKeys.events.myEvents,
    queryFn: () => apiClient.get<{ data: Event[] }>("/events/my-events"),
    ...options,
  });
}

export function useSeatingChart(eventId: string, options?: Partial<UseQueryOptions<{ data: SeatingChart }>>) {
  return useQuery({
    queryKey: queryKeys.events.seating(eventId),
    queryFn: () => apiClient.get<{ data: SeatingChart }>(`/events/${eventId}/seating-chart`),
    enabled: !!eventId,
    ...options,
  });
}

export function useAvailableSeats(eventId: string, options?: Partial<UseQueryOptions<{ data: Seat[] }>>) {
  return useQuery({
    queryKey: queryKeys.events.seats(eventId),
    queryFn: () => apiClient.get<{ data: Seat[] }>(`/events/${eventId}/seats/available`),
    enabled: !!eventId,
    refetchInterval: 30000, // FIXED: Poll every 30 seconds instead of 5 seconds
    ...options,
  });
}

// Ticket hooks
export function useMyTickets(
  filters?: Record<string, any>,
  options?: Partial<UseQueryOptions<{ data: Ticket[]; meta?: any }>>
) {
  return useQuery({
    queryKey: queryKeys.tickets.myTickets(filters),
    queryFn: () => apiClient.get<{ data: Ticket[]; meta?: any }>("/tickets/my-tickets", filters),
    ...options,
  });
}

export function usePurchaseTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { eventId: string; tickets: { ticketTypeId: string; quantity: number }[] }) =>
      apiClient.post("/tickets/purchase", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

// Payment hooks
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (data: CreatePaymentIntentRequest) => paymentApi.createPaymentIntent(data),
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfirmPaymentRequest) => paymentApi.confirmPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}

export function useMyPayments(
  filters?: Record<string, any>,
  options?: Partial<UseQueryOptions<{ data: any[]; meta?: any }>>
) {
  return useQuery({
    queryKey: queryKeys.payments.myPayments(filters),
    queryFn: () => paymentApi.getMyPayments(filters),
    ...options,
  });
}

export function usePaymentById(id: string, options?: Partial<UseQueryOptions<{ data: any }>>) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => paymentApi.getPaymentById(id),
    enabled: !!id,
    ...options,
  });
}

export function useEventPayments(
  eventId: string,
  filters?: Record<string, any>,
  options?: Partial<UseQueryOptions<{ data: any[]; meta?: any }>>
) {
  return useQuery({
    queryKey: queryKeys.payments.eventPayments(eventId, filters),
    queryFn: () => paymentApi.getEventPayments(eventId, filters),
    enabled: !!eventId,
    ...options,
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: RefundPaymentRequest }) =>
      paymentApi.refund(paymentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
}

export function useOrganizerPaymentAnalytics(
  params?: Record<string, any>,
  options?: Partial<UseQueryOptions<{ data: any }>>
) {
  return useQuery({
    queryKey: queryKeys.payments.analytics(params),
    queryFn: () => paymentApi.getOrganizerAnalytics(params),
    ...options,
  });
}

// Notification hooks
export function useNotifications(
  filters?: Record<string, any>,
  options?: Partial<UseQueryOptions<{ data: Notification[]; meta?: any }>>
) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => apiClient.get<{ data: Notification[]; meta?: any }>("/notifications", filters),
    refetchInterval: 30000, // FIXED: Poll every 30 seconds instead of 30 seconds (already good)
    ...options,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

// Analytics hooks
export function useOrganizerAnalytics(params?: Record<string, any>, options?: Partial<UseQueryOptions<{ data: any }>>) {
  return useQuery({
    queryKey: queryKeys.analytics.organizer(params),
    queryFn: () => apiClient.get<{ data: any }>("/analytics/organizer", params),
    ...options,
  });
}
