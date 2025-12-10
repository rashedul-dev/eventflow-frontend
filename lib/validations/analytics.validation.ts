import { z } from "zod";

export const analyticsQuerySchema = z.object({
  period: z.enum(["today", "week", "month", "quarter", "year", "all_time", "custom"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  eventId: z.string().optional(),
});

export const exportQuerySchema = z.object({
  format: z.enum(["csv", "json", "pdf"]),
  period: z.enum(["today", "week", "month", "quarter", "year", "all_time", "custom"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  eventId: z.string().optional(),
  metrics: z.string().optional(), // comma-separated
});

export const commissionReportSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  organizerId: z.string().optional(),
  eventId: z.string().optional(),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
export type CommissionReportInput = z.infer<typeof commissionReportSchema>;
