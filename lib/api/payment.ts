import { apiClient } from "./client";

export interface CreatePaymentIntentRequest {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  attendees?: Array<{
    name: string;
    email: string;
    phone?: string;
  }>;
  seatIds?: string[];
  promoCode?: string;
  billingEmail: string;
  billingName?: string;
  savePaymentMethod?: boolean;
}

export interface CreatePaymentIntentResponse {
  payment: any;
  clientSecret: string;
  paymentIntentId: string;
  breakdown: {
    subtotal: number;
    discount: number;
    taxAmount: number;
    serviceFee: number;
    stripeFee: number;
    platformCommission: number;
    organizerPayout: number;
    total: number;
  };
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface RefundPaymentRequest {
  amount?: number;
  reason: string;
}

export const paymentApi = {
  // Create payment intent - FIXED: Backend validation middleware wraps req.body
  createPaymentIntent: (data: CreatePaymentIntentRequest) =>
    apiClient.post<{ data: CreatePaymentIntentResponse }>("/payments/intent", data, {
      disableDeduplication: true, // Allow multiple payment intents
    }),

  // Confirm payment
  confirmPayment: (data: ConfirmPaymentRequest) =>
    apiClient.post<{ data: any }>("/payments/confirm", data, {
      disableDeduplication: true,
    }),

  // Get my payments - FIXED: Disable aggressive cancellation
  getMyPayments: (params?: Record<string, any>) =>
    apiClient.get<{ data: any[]; meta?: any }>("/payments/my-payments", params, {
      disableDeduplication: true, // Don't cancel when navigating to this page
    }),

  // Get payment by ID
  getPaymentById: (id: string) => apiClient.get<{ data: any }>(`/payments/${id}`),

  // Get event payments (organizer)
  getEventPayments: (eventId: string, params?: Record<string, any>) =>
    apiClient.get<{ data: any[]; meta?: any }>(`/payments/event/${eventId}`, params),

  // Process refund
  refund: (paymentId: string, data: RefundPaymentRequest) =>
    apiClient.post<{ data: any }>(`/payments/${paymentId}/refund`, data),

  // Get organizer analytics
  getOrganizerAnalytics: (params?: Record<string, any>) =>
    apiClient.get<{ data: any }>("/analytics/organizer/payments", params),

  // Get platform analytics
  getPlatformAnalytics: (params?: Record<string, any>) =>
    apiClient.get<{ data: any }>("/analytics/platform/payments", params),
};
