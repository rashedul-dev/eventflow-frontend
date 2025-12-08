// Zod validation schemas for EventFlow

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["ATTENDEE", "ORGANIZER"]).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  shortDescription: z.string().max(200, "Short description must be less than 200 characters").optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  timezone: z.string().min(1, "Timezone is required"),
  isVirtual: z.boolean(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  virtualLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  capacity: z.number().min(1, "Capacity must be at least 1").optional(),
  isPrivate: z.boolean(),
  requiresApproval: z.boolean(),
  ageRestriction: z.number().min(0).max(21).optional(),
});

export const ticketTypeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.enum(["FREE", "PAID", "DONATION"]),
  price: z.number().min(0, "Price must be 0 or greater"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  maxPerOrder: z.number().min(1, "Maximum per order must be at least 1"),
  minPerOrder: z.number().min(1, "Minimum per order must be at least 1"),
  salesStartDate: z.string().optional(),
  salesEndDate: z.string().optional(),
  isTransferable: z.boolean(),
});

export const checkoutSchema = z.object({
  billingName: z.string().min(2, "Name must be at least 2 characters"),
  billingEmail: z.string().email("Please enter a valid email address"),
  acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
});

export const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().optional(),
  organizationName: z.string().optional(),
  organizationDesc: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});
export type RegisterInput = RegisterFormData;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type TicketTypeFormData = z.infer<typeof ticketTypeSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
