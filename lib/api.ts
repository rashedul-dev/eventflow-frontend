// API Configuration and Utilities for EventFlow

import { convertBigIntToString } from "@/lib/error/error-handler";
import {
  AdminAnalyticsResponse,
  CommissionReportsResponse,
  IAnalyticsQuery,
  OrganizerAnalyticsResponse,
  TicketValidationResponse,
} from "./interface";
import {
  CheckInListResponse,
  CheckInRecord,
  CheckInResponse,
  CloneEventResponse,
  CreateEventPayload,
  CreateEventResponse,
  NotificationListDto,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

// ANALYTICS uses Next.js API routes (localhost:3000)
// const ANALYTICS_BASE_URL = "/api/v1/analytics";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]> | { field: string; message: string }[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Token management
// export const getAccessToken = () => {
//   if (typeof window !== "undefined") {
//     return localStorage.getItem("accessToken");
//   }
//   return null;
// };

// export const getRefreshToken = () => {
//   if (typeof window !== "undefined") {
//     return localStorage.getItem("refreshToken");
//   }
//   return null;
// };

// export const setTokens = (accessToken: string, refreshToken: string) => {
//   if (typeof window !== "undefined") {
//     localStorage.setItem("accessToken", accessToken);
//     localStorage.setItem("refreshToken", refreshToken);
//   }
// };

// export const clearTokens = () => {
//   if (typeof window !== "undefined") {
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//   }
// };

// Replace the token management functions in api.ts:

export const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== "undefined") {
    // Store in cookies instead of localStorage
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 15}; SameSite=Lax; Secure`;
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;

    // Keep localStorage as backup
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }
};

export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    // Try to get from cookie first
    const cookies = document.cookie.split(";");
    const accessTokenCookie = cookies.find((c) => c.trim().startsWith("accessToken="));
    if (accessTokenCookie) {
      return accessTokenCookie.split("=")[1];
    }
    // Fallback to localStorage
    return localStorage.getItem("accessToken");
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    // Try to get from cookie first
    const cookies = document.cookie.split(";");
    const refreshTokenCookie = cookies.find((c) => c.trim().startsWith("refreshToken="));
    if (refreshTokenCookie) {
      return refreshTokenCookie.split("=")[1];
    }
    // Fallback to localStorage
    return localStorage.getItem("refreshToken");
  }
  return null;
};

export const clearTokens = () => {
  if (typeof window !== "undefined") {
    // Clear cookies
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

interface ApiErrorWithDetails extends Error {
  status?: number;
  data?: any;
  errors?: Record<string, string[]> | { field: string; message: string }[];
}

// Base fetch function with auth
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    const text = await response.text();
    let data: any;
    try {
      // Parse and convert BigInt values
      data = JSON.parse(text, (key, value) => {
        // Handle BigInt strings that come from the backend
        if (typeof value === "string" && /^\d+n$/.test(value)) {
          return value.slice(0, -1);
        }
        return value;
      });
      // Convert any remaining BigInt-like values
      data = convertBigIntToString(data);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      const error: ApiErrorWithDetails = new Error(data?.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      error.errors = data?.errors;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    fetchApi("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchApi<{
      user: any;
      tokens: {
        accessToken: string;
        refreshToken: string;
      };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () => fetchApi("/auth/logout", { method: "POST" }),

  logoutAll: () => fetchApi("/auth/logout-all", { method: "POST" }),

  getMe: () => fetchApi<any>("/auth/me"),

  refreshToken: (refreshToken: string) =>
    fetchApi<{ accessToken: string; refreshToken: string }>("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  forgotPassword: (email: string) =>
    fetchApi("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (data: { token: string; password: string }) =>
    fetchApi("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),

  verifyEmail: (token: string) => fetchApi("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }),

  resendVerification: (email: string) =>
    fetchApi("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchApi("/auth/change-password", { method: "POST", body: JSON.stringify(data) }),
};

// User API
export const userApi = {
  getProfile: () => fetchApi<any>("/users/profile"),

  updateProfile: (data: any) => fetchApi("/users/profile", { method: "PATCH", body: JSON.stringify(data) }),

  becomeOrganizer: (data: {
    organizationName: string;
    organizationDesc?: string;
    website?: string;
    socialLinks?: Record<string, string>;
  }) => fetchApi("/users/become-organizer", { method: "POST", body: JSON.stringify(data) }),

  updateOrganizerProfile: (data: {
    organizationName?: string;
    organizationDesc?: string;
    website?: string;
    socialLinks?: Record<string, string>;
  }) => fetchApi("/users/organizer-profile", { method: "PATCH", body: JSON.stringify(data) }),

  deleteAccount: (data: { password: string; reason?: string }) =>
    fetchApi("/users/account", { method: "DELETE", body: JSON.stringify(data) }),

  getOrganizers: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return fetchApi<any[]>(`/users/organizers?${searchParams.toString()}`);
  },

  getOrganizerById: (id: string) => fetchApi<any>(`/users/organizers/${id}`),
};

// Event API
export const eventApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    city?: string;
    status?: string;
    search?: string;
    searchTerm?: string;
    isVirtual?: boolean;
    startDateFrom?: string;
    startDateTo?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    include?: string; // Add include parameter for relations
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return fetchApi<any[]>(`/events?${searchParams.toString()}`);
  },

  getBySlug: (slug: string) => fetchApi<any>(`/events/slug/${slug}`),

  // getById: (id: string) => fetchApi<any>(`/events/${id}`),
  getById: (eventId: string) => fetchApi<any>(`/events/${eventId}`),

  // getMyEvents: () => fetchApi<any[]>("/events/my-events"),
  getMyEvents: (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    return fetchApi<any[]>(`/events/my-events${query ? `?${query}` : ""}`);
  },

  create: (payload: CreateEventPayload) =>
    fetchApi<CreateEventResponse>("/events", { method: "POST", body: JSON.stringify(payload) }), // <-- inner DTO, not {}
  update: (id: string, data: any) => fetchApi(`/events/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => fetchApi(`/events/${id}`, { method: "DELETE" }),

  submitForApproval: (id: string) => fetchApi(`/events/${id}/submit`, { method: "POST" }),

  cancel: (id: string) => fetchApi(`/events/${id}/cancel`, { method: "POST" }),

  clone: (id: string, data?: { title?: string }) =>
    fetchApi<CloneEventResponse>(`/events/${id}/clone`, { method: "POST", body: JSON.stringify(data || {}) }),

  // // Seating
  // getSeatingChart: (id: string) => fetchApi<any>(`/events/${id}/seating-chart`),

  // createSeatingChart: (id: string, data: any) =>
  //   fetchApi(`/events/${id}/seating-chart`, { method: "POST", body: JSON.stringify(data) }),

  // updateSeatStatus: (id: string, data: { seatIds: string[]; status: string }) =>
  //   fetchApi(`/events/${id}/seating-chart/seats`, { method: "PATCH", body: JSON.stringify(data) }),

  getAvailableSeats: (id: string) => fetchApi<any[]>(`/events/${id}/seats/available`),

  // Waitlist
  joinWaitlist: (id: string, data: { email: string; name?: string; quantity?: number }) =>
    fetchApi(`/events/${id}/waitlist`, { method: "POST", body: JSON.stringify(data) }),
  // Get seating chart for an event
  getSeatingChart: async (eventId: string) => {
    return fetchApi(`/events/${eventId}/seating-chart`);
  },

  // Create a new seating chart for an event
  createSeatingChart: async (eventId: string, data: any) => {
    return fetchApi(`/events/${eventId}/seating-chart`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update seat status (block/unblock seats)
  updateSeatStatus: async (eventId: string, data: { seatIds: string[]; status: string }) => {
    return fetchApi(`/events/${eventId}/seats/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Get event details
  getEvent: async (eventId: string) => {
    return fetchApi(`/events/${eventId}`);
  },

  getWaitlist: (id: string, params?: any) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return fetchApi<any[]>(`/events/${id}/waitlist?${searchParams.toString()}`);
  },

  notifyWaitlist: (id: string, data: { entryIds: string[]; message: string }) =>
    fetchApi(`/events/${id}/waitlist/notify`, { method: "POST", body: JSON.stringify(data) }),

  removeFromWaitlist: (id: string, entryId: string) =>
    fetchApi(`/events/${id}/waitlist/${entryId}`, { method: "DELETE" }),

  // Analytics & Capacity
  // getAnalytics: (id: string) => fetchApi<any>(`/events/${id}/analytics`),
  getAnalytics: (eventId: string) => fetchApi<any>(`/events/${eventId}/analytics`),

  getCapacity: (id: string) => fetchApi<any>(`/events/${id}/capacity`),

  updateCapacity: (id: string, data: { capacity: number }) =>
    fetchApi(`/events/${id}/capacity`, { method: "PATCH", body: JSON.stringify(data) }),
};

// Ticket API
export const ticketApi = {
  getMyTickets: (params?: { status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return fetchApi<any[]>(`/tickets/my-tickets?${searchParams.toString()}`);
  },

  purchase: (data: {
    eventId: string;
    tickets: { ticketTypeId: string; quantity: number }[];
    attendees?: { name: string; email: string; phone?: string }[];
    seatIds?: string[];
    promoCode?: string;
  }) =>
    fetchApi("/tickets/purchase", {
      method: "POST",
      body: JSON.stringify({
        eventId: data.eventId,
        ticketTypeId: data.tickets[0].ticketTypeId,
        quantity: data.tickets[0].quantity,
        attendees: data.attendees,
        seatIds: data.seatIds,
        promoCode: data.promoCode,
      }),
    }),

  getById: (id: string) => fetchApi<any>(`/tickets/${id}`),

  transfer: (id: string, data: { recipientEmail: string; recipientName?: string }) =>
    fetchApi(`/tickets/${id}/transfer`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  cancel: (id: string, reason?: string) =>
    fetchApi(`/tickets/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  downloadTicket: async (ticketId: string): Promise<Blob> => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/download`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to download ticket");
    }

    return response.blob();
  },

  downloadCalendar: (id: string) => fetchApi<any>(`/tickets/${id}/calendar`),

  validate: async (data: { ticketNumber?: string; qrCode?: string }) => {
    const response = await fetchApi<TicketValidationResponse>("/tickets/validate", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // getEventTickets: (eventId: string, params?: any) => {
  //   const searchParams = new URLSearchParams();
  //   if (params) {
  //     Object.entries(params).forEach(([key, value]) => {
  //       if (value !== undefined) searchParams.append(key, String(value));
  //     });
  //   }
  //   return fetchApi<any[]>(`/tickets/event/${eventId}?${searchParams.toString()}`);
  // },

  getEventTickets: (eventId: string, params?: { status?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    return fetchApi<any[]>(`/tickets/event/${eventId}${query ? `?${query}` : ""}`);
  },

  getEventCheckIns: (eventId: string, userId: string, params: { limit: number; offset: number }) => {
    const search = new URLSearchParams();
    search.append("userId", userId);
    search.append("limit", String(params.limit));
    search.append("offset", String(params.offset));
    return fetchApi<CheckInListResponse>(`/events/${eventId}/check-ins?${search.toString()}`);
  },

  getCheckInStats: async (eventId: string) => {
    const res = await fetchApi<any>(`/tickets/event/${eventId}?limit=1000`);
    const tickets = res.data || [];
    const ticketsArray = Array.isArray(tickets) ? tickets : tickets.data || [];
    const checkedIn = ticketsArray.filter((t: any) => t.checkedInAt || t.checked_in_at).length;
    return {
      total: ticketsArray.length,
      checkedIn,
      attendanceRate: ticketsArray.length > 0 ? (checkedIn / ticketsArray.length) * 100 : 0,
    };
  },

  checkIn: (eventId: string, data: { ticketId?: string; ticketNumber?: string; qrCode?: string }) =>
    fetchApi<CheckInResponse>(`/tickets/event/${eventId}/check-in`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  bulkCheckIn: (eventId: string, data: { ticketIds: string[] }) =>
    fetchApi(`/tickets/event/${eventId}/bulk-check-in`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Payment API
export const paymentApi = {
  getMyPayments: (params?: { status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return fetchApi<any[]>(`/payments/my-payments?${searchParams.toString()}`);
  },

  createPaymentIntent: (data: {
    eventId: string;
    ticketTypeId: string;
    quantity: number;
    attendees?: { name: string; email: string; phone?: string }[];
    seatIds?: string[];
    promoCode?: string;
    billingEmail: string;
    billingName?: string;
    savePaymentMethod?: boolean;
  }) =>
    fetchApi<{ clientSecret: string; paymentIntentId: string }>("/payments/intent", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  confirmPayment: (data: { paymentIntentId: string; paymentMethodId?: string }) =>
    fetchApi("/payments/confirm", { method: "POST", body: JSON.stringify(data) }),

  getById: (id: string) => fetchApi<any>(`/payments/${id}`),

  getAll: (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    return fetchApi<any[]>(`/payments${query ? `?${query}` : ""}`);
  },

  // getEventPayments: (eventId: string, params?: any) => {
  //   const searchParams = new URLSearchParams();
  //   if (params) {
  //     Object.entries(params).forEach(([key, value]) => {
  //       if (value !== undefined) searchParams.append(key, String(value));
  //     });
  //   }
  //   return fetchApi<any[]>(`/payments/event/${eventId}?${searchParams.toString()}`);
  // },

  getEventPayments: (eventId: string, params?: any) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    return fetchApi<any[]>(`/payments/event/${eventId}${query ? `?${query}` : ""}`);
  },
  refund: (id: string, data: { amount?: number; reason: string }) =>
    fetchApi(`/payments/${id}/refund`, { method: "POST", body: JSON.stringify(data) }),
};

// Analytics API - Updated to use Next.js routes
export const analyticsApi = {
  // Admin analytics - uses Next.js route
  getAdmin: () => {
    const token = getAccessToken();
    return fetch(`${API_BASE_URL}/admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
  // GET /analytics/admin/overview - matches backend route
  getAdminAnalytics: (query?: IAnalyticsQuery) => {
    const searchParams = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const queryString = searchParams.toString();
    return fetchApi<AdminAnalyticsResponse>(`/analytics/admin/overview${queryString ? `?${queryString}` : ""}`);
  },
  // GET /analytics/commission-reports - matches backend route
  getCommissionReports: (params?: {
    organizerId?: string;
    month?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const queryString = searchParams.toString();
    return fetchApi<CommissionReportsResponse>(`/analytics/commission-reports${queryString ? `?${queryString}` : ""}`);
  },

  // Organizer analytics - uses Next.js route
  getOrganizer: (params?: { period?: string; dateFrom?: string; dateTo?: string; eventId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const token = getAccessToken();
    const url = `${API_BASE_URL}/organizer${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },

  // getOrganizerAnalytics: (params?: { period?: string; eventId?: string }) => {
  //   const searchParams = new URLSearchParams();
  //   if (params) {
  //     Object.entries(params).forEach(([key, value]) => {
  //       if (value !== undefined) searchParams.append(key, String(value));
  //     });
  //   }
  //   const query = searchParams.toString();
  //   return fetchApi<any>(`/analytics/organizer${query ? `?${query}` : ""}`);
  // },

  getOrganizerAnalytics: (query?: IAnalyticsQuery) => {
    const searchParams = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const queryString = searchParams.toString();
    return fetchApi<OrganizerAnalyticsResponse>(`/analytics/organizer/overview${queryString ? `?${queryString}` : ""}`);
  },

  getOverview: () => fetchApi<any>(`/analytics/organizer`),

  // Event-specific analytics - uses Next.js route
  // getEventAnalytics: (eventId: string) => {
  //   const token = getAccessToken();
  //   return fetch(`${API_BASE_URL}/organizer/events/${eventId}`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //     },
  //   }).then((res) => res.json());
  // },
  getEventAnalytics: (eventId: string) => fetchApi<any>(`/analytics/events/${eventId}`),

  // Commission reports - uses Next.js route
  // getCommissionReports: (params?: { organizerId?: string; month?: string; status?: string }) => {
  //   const searchParams = new URLSearchParams();
  //   if (params) {
  //     Object.entries(params).forEach(([key, value]) => {
  //       if (value !== undefined) searchParams.append(key, String(value));
  //     });
  //   }
  //   const token = getAccessToken();
  //   const url = `${API_BASE_URL}/commission-reports${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
  //   return fetch(url, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //     },
  //   }).then((res) => res.json());
  // },

  // Legacy methods for backward compatibility
  getPlatform: (params?: { period?: string; dateFrom?: string; dateTo?: string }) => {
    return analyticsApi.getAdmin();
  },

  export: (params: {
    format: "csv" | "json" | "pdf";
    period?: string;
    dateFrom?: string;
    dateTo?: string;
    eventId?: string;
    metrics?: string;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    return fetchApi<any>(`/analytics/export?${searchParams.toString()}`);
  },
};

// Notification API
export const notificationApi = {
  getAll: (params?: { type?: string; status?: string; read?: boolean; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return fetchApi<NotificationListDto>(`/notifications?${searchParams.toString()}`);
  },

  markAsRead: (id: string) => fetchApi(`/notifications/${id}/read`, { method: "POST" }),

  markAllAsRead: (type?: string) =>
    fetchApi("/notifications/read-all", { method: "POST", body: JSON.stringify({ type }) }),

  delete: (id: string) => fetchApi(`/notifications/${id}`, { method: "DELETE" }),

  getPreferences: () => fetchApi<any>("/notifications/preferences"),

  updatePreferences: (data: any) =>
    fetchApi("/notifications/preferences", { method: "PUT", body: JSON.stringify(data) }),
};

// Admin API
export const adminApi = {
  getPendingEvents: () => fetchApi<any[]>("/admin/events/pending"),

  verifyEvent: (id: string, data: { status: "APPROVED" | "REJECTED"; rejectionReason?: string }) =>
    fetchApi(`/admin/events/${id}/verify`, { method: "POST", body: JSON.stringify(data) }),

  getVerificationStats: () => fetchApi<any>("/admin/events/verification-stats"),

  getAllUsers: (params?: {
    searchTerm?: string;
    role?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return fetchApi<any[]>(`/admin/users?${searchParams.toString()}`);
  },

  manageUser: (
    id: string,
    data: {
      action: "suspend" | "activate" | "verify_email" | "verify_phone" | "update_role";
      reason?: string;
      newRole?: string;
    }
  ) => fetchApi(`/admin/users/${id}/manage`, { method: "POST", body: JSON.stringify(data) }),

  getUserStatistics: () => fetchApi<any>("/admin/users/statistics"),

  getPlatformAnalytics: (params?: { period?: string; dateFrom?: string; dateTo?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return fetchApi<any>(`/analytics/platform?${searchParams.toString()}`);
  },

  getCommissionReport: (params?: { dateFrom?: string; dateTo?: string; organizerId?: string; eventId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return fetchApi<any>(`/admin/reports/commission?${searchParams.toString()}`);
  },
};

export const api = {
  auth: authApi,
  users: userApi,
  events: eventApi,
  tickets: ticketApi,
  payments: paymentApi,
  analytics: analyticsApi,
  notifications: notificationApi,
  admin: adminApi,
};
