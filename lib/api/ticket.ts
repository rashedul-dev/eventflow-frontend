import { apiClient } from "./client";

export interface PurchaseTicketsRequest {
  eventId: string;
  tickets: { ticketTypeId: string; quantity: number }[];
  attendees: { name: string; email: string; phone?: string }[];
}

export interface TransferTicketRequest {
  recipientEmail: string;
  recipientName: string;
}

export const ticketApi = {
  // Get all tickets for current user
  getMyTickets: async (params?: { page?: number; limit?: number; status?: string }) => {
    const token = localStorage.getItem("bearer_token");
    return apiClient.get("/tickets/my-tickets", {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  // Get single ticket by ID
  getById: async (id: string) => {
    const token = localStorage.getItem("bearer_token");
    return apiClient.get(`/tickets/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  // Purchase tickets
  purchase: async (data: PurchaseTicketsRequest) => {
    const token = localStorage.getItem("bearer_token");
    return apiClient.post("/tickets/purchase", data, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  // Transfer ticket
  transfer: async (ticketId: string, data: TransferTicketRequest) => {
    const token = localStorage.getItem("bearer_token");
    return apiClient.post(`/tickets/${ticketId}/transfer`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  // Cancel ticket
  cancel: async (ticketId: string, reason?: string) => {
    const token = localStorage.getItem("bearer_token");
    return apiClient.post(
      `/tickets/${ticketId}/cancel`,
      { reason },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
  },

  // Download ticket PDF
  downloadTicket: async (ticketId: string): Promise<Blob> => {
    const token = localStorage.getItem("bearer_token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/tickets/${ticketId}/download`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download ticket");
    }

    return response.blob();
  },

  // Validate ticket (PUBLIC - no auth required)
  validate: async (identifier: string) => {
    return apiClient.post(
      "/tickets/validate",
      { identifier },
      {
        skipAuth: true,
      }
    );
  },

  // Check-in ticket (PROTECTED - requires auth)
  checkIn: async (identifier: string, userId: string) => {
    const token = localStorage.getItem("bearer_token");
    return apiClient.post(
      "/tickets/check-in",
      { identifier, userId },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
  },

  // Get check-ins for event (PROTECTED - requires auth)
  getEventCheckIns: async (eventId: string, userId: string, params?: { limit?: number; offset?: number }) => {
    const token = localStorage.getItem("bearer_token");
    return apiClient.get(`/tickets/event/${eventId}/check-ins`, {
      params: { ...params, userId },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },
};
