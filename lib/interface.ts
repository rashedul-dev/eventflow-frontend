export interface TicketValidationResponse {
  valid: boolean;
  error?: string;
  message?: string;
  checkedInAt?: string;
  ticket?: {
    id: string;
    ticketNumber: string;
    status: string;
    pricePaid: string;
    checkedInAt?: string;
    attendeeName?: string;
    attendeeEmail?: string;
    attendeePhone?: string;
    currency?: string;
    qrCode?: string;
    barcode?: string;
    ticketType?: {
      name: string;
      category?: string;
    };
    event?: {
      id: string;
      title: string;
      startDate: string;
      endDate?: string;
      venueName?: string;
      status?: string;
    };
    seat?: any;
  };
}

// Types based on backend analytics.service.ts responses
export interface IAnalyticsQuery {
  period?: "today" | "week" | "month" | "quarter" | "year" | "custom";
  dateFrom?: string;
  dateTo?: string;
  eventId?: string;
}

export interface OrganizerAnalyticsResponse {
  totalRevenue: number;
  ticketsSold: number;
  activeEvents: number;
  commissionOwed: number;
  revenueData: Array<{ date: string; revenue: number }>;
  topEvents: Array<{ id: string; title: string; revenue: number; ticketsSold: number }>;
}

export interface AdminAnalyticsResponse {
  totalRevenue: number;
  ticketsSold: number;
  activeEvents: number;
  totalUsers: number;
  platformCommission: number;
  revenueData: Array<{ date: string; revenue: number }>;
  topEvents: Array<{ id: string; title: string; revenue: number; ticketsSold: number }>;
}

export interface EventAnalyticsResponse {
  totalRevenue: number;
  ticketsSold: number;
  checkedInTickets: number;
  attendanceRate: number;
  revenueData: Array<{ date: string; revenue: number; tickets: number }>;
  ticketTypeBreakdown: Array<{ name: string; sold: number; revenue: number }>;
}

export interface CommissionReportsResponse {
  summary: {
    totalCommission: number;
    totalPaid: number;
    totalUnpaid: number;
    totalOrganizers: number;
  };
  reports: Array<{
    organizerId: string;
    organizerName: string;
    totalSales: number;
    commissionOwed: number;
    eventCount: number;
    events: Array<{
      eventId: string;
      eventTitle: string;
      eventRevenue: number;
      commission: number;
      ticketsSold: number;
    }>;
  }>;
  monthlyBreakdown: Array<{ month: string; commission: number }>;
}
