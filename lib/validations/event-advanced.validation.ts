import { z } from "zod";

const sectionRowSchema = z.object({
  rowLabel: z.string().min(1, "Row label required").max(10, "Row label too long"),
  seats: z.number().int().min(1, "At least 1 seat required").max(100, "Maximum 100 seats per row"),
  startNumber: z.number().int().min(1).optional(),
  isAccessible: z.boolean().optional(),
});

const sectionSchema = z.object({
  name: z.string().min(1, "Section name required").max(50, "Section name too long"),
  description: z.string().max(200, "Description too long").optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format (use #RRGGBB)")
    .optional(),
  capacity: z.number().int().positive("Capacity must be positive"),
  priceMultiplier: z.number().min(0, "Multiplier cannot be negative").max(10, "Maximum multiplier is 10").optional(),
  positionData: z.object({}).passthrough().optional(),
  rows: z.array(sectionRowSchema).min(1, "At least one row required"),
});

export const createSeatingChartSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  chartData: z.object({}).passthrough(),
  width: z.number().int().positive("Width must be positive").optional(),
  height: z.number().int().positive("Height must be positive").optional(),
  sections: z.array(sectionSchema).min(1, "At least one section required"),
});

export const updateSeatStatusSchema = z.object({
  seatIds: z.array(z.string()).min(1, "At least one seat required"),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD", "BLOCKED"]),
});

export const joinWaitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().max(100, "Name too long").optional(),
  phone: z.string().max(20, "Phone too long").optional(),
  ticketTypeId: z.string().optional(),
  quantity: z.number().int().min(1, "Minimum 1").max(10, "Maximum 10").optional(),
  notes: z.string().max(500, "Notes too long").optional(),
});

export const notifyWaitlistSchema = z.object({
  entryIds: z.array(z.string()).min(1, "At least one entry required"),
  expiryHours: z.number().int().min(1, "Minimum 1 hour").max(168, "Maximum 7 days").optional(),
});

export const cloneEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateCapacitySchema = z.object({
  updates: z
    .array(
      z.object({
        ticketTypeId: z.string().min(1, "Ticket type ID required"),
        quantity: z.number().int().min(0, "Quantity cannot be negative"),
      })
    )
    .min(1, "At least one update required"),
});

export type CreateSeatingChartInput = z.infer<typeof createSeatingChartSchema>;
export type UpdateSeatStatusInput = z.infer<typeof updateSeatStatusSchema>;
export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;
export type NotifyWaitlistInput = z.infer<typeof notifyWaitlistSchema>;
export type CloneEventInput = z.infer<typeof cloneEventSchema>;
export type UpdateCapacityInput = z.infer<typeof updateCapacitySchema>;
