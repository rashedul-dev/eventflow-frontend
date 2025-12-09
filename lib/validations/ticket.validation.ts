import { z } from "zod";

const attendeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20, "Phone too long").optional(),
});

export const purchaseTicketSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  ticketTypeId: z.string().min(1, "Ticket type is required"),
  quantity: z.number().int().min(1, "Minimum 1 ticket required").max(10, "Maximum 10 tickets per purchase"),
  attendees: z.array(attendeeSchema).optional(),
  seatIds: z.array(z.string()).optional(),
  promoCode: z.string().max(50, "Promo code too long").optional(),
});

export const transferTicketSchema = z.object({
  recipientEmail: z.string().email("Invalid recipient email"),
  recipientName: z.string().max(100, "Name too long").optional(),
});

export const validateTicketSchema = z
  .object({
    qrCode: z.string().optional(),
    ticketNumber: z.string().optional(),
  })
  .refine((data) => data.qrCode || data.ticketNumber, {
    message: "Either QR code or ticket number is required",
  });

export const checkInTicketSchema = z
  .object({
    ticketId: z.string().optional(),
    qrCode: z.string().optional(),
    ticketNumber: z.string().optional(),
  })
  .refine((data) => data.ticketId || data.qrCode || data.ticketNumber, {
    message: "Ticket ID, QR code, or ticket number is required",
  });

export const cancelTicketSchema = z.object({
  reason: z.string().max(500, "Reason too long").optional(),
});

export const bulkCheckInSchema = z.object({
  ticketIds: z.array(z.string()).min(1, "At least one ticket required").max(100, "Maximum 100 tickets"),
});

export type PurchaseTicketInput = z.infer<typeof purchaseTicketSchema>;
export type TransferTicketInput = z.infer<typeof transferTicketSchema>;
export type ValidateTicketInput = z.infer<typeof validateTicketSchema>;
export type CheckInTicketInput = z.infer<typeof checkInTicketSchema>;
export type CancelTicketInput = z.infer<typeof cancelTicketSchema>;
export type BulkCheckInInput = z.infer<typeof bulkCheckInSchema>;
