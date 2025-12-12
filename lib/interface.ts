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
  overview: {
    totalUsers: number;
    totalEvents: number;
    totalRevenue: number;
    totalCommission: number;
    activeEvents: number;
    pendingEvents: number;
  };
  userGrowth: Array<{
    date: Date;
    newUsers: number;
    totalUsers: number;
  }>;
  revenueByPeriod: Array<{
    date: string;
    revenue: number;
  }>;
  topEvents: Array<{
    eventId: string;
    eventTitle: string;
    revenue: number;
    ticketsSold: number;
  }>;
  topOrganizers: Array<{
    organizerId: string;
    organizerName: string;
    totalRevenue: number;
    eventCount: number;
  }>;
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
    totalRevenue: number;
    totalCommission: number;
    totalPayout: number;
    transactionCount: number;
  };
  byEvent: Array<{
    eventId: string;
    eventTitle: string;
    organizerName: string;
    revenue: number;
    commission: number;
    payout: number;
    transactionCount: number;
  }>;
  byOrganizer: Array<{
    organizerId: string;
    organizerName: string;
    totalRevenue: number;
    totalCommission: number;
    totalPayout: number;
    eventCount: number;
  }>;
}
