import { z } from "zod";

const attendeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20, "Phone too long").optional(),
});

export const createPaymentIntentSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  ticketTypeId: z.string().min(1, "Ticket type is required"),
  quantity: z.number().int().min(1, "Minimum 1 ticket").max(10, "Maximum 10 tickets"),
  attendees: z.array(attendeeSchema).optional(),
  seatIds: z.array(z.string()).optional(),
  promoCode: z.string().max(50, "Promo code too long").optional(),
  billingEmail: z.string().email("Invalid billing email"),
  billingName: z.string().max(200, "Name too long").optional(),
  savePaymentMethod: z.boolean().optional(),
});

export const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  paymentMethodId: z.string().optional(),
});

export const refundPaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500, "Reason too long"),
});

export const createPayoutSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  amount: z.number().positive("Amount must be positive").optional(),
});

export const retryPaymentSchema = z.object({
  paymentMethodId: z.string().optional(),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type CreatePayoutInput = z.infer<typeof createPayoutSchema>;
