import { z } from "zod";

export const createEventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title too long"),
    description: z.string().min(10, "Description must be at least 10 characters").max(10000, "Description too long"),
    shortDescription: z.string().max(500, "Short description too long").optional(),
    startDate: z.string().datetime({ message: "Invalid start date format" }),
    endDate: z.string().datetime({ message: "Invalid end date format" }),
    timezone: z.string().default("UTC"),
    isVirtual: z.boolean().default(false),
    venueName: z.string().max(200, "Venue name too long").optional(),
    venueAddress: z.string().max(500, "Address too long").optional(),
    city: z.string().max(100, "City name too long").optional(),
    state: z.string().max(100, "State name too long").optional(),
    country: z.string().max(100, "Country name too long").optional(),
    postalCode: z.string().max(20, "Postal code too long").optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    virtualLink: z.string().url("Invalid virtual link URL").optional().or(z.literal("")),
    virtualPlatform: z.string().max(100).optional(),
    coverImage: z.string().url("Invalid cover image URL").optional().or(z.literal("")),
    thumbnailImage: z.string().url("Invalid thumbnail URL").optional().or(z.literal("")),
    images: z.array(z.string().url("Invalid image URL")).max(10, "Maximum 10 images allowed").optional(),
    capacity: z.number().int().min(1, "Capacity must be at least 1").optional(),
    isPrivate: z.boolean().default(false),
    requiresApproval: z.boolean().default(false),
    ageRestriction: z.number().int().min(0).max(100, "Invalid age restriction").optional(),
    category: z.string().max(50).optional(),
    tags: z.array(z.string().max(50)).max(20, "Maximum 20 tags allowed").optional(),
    metaTitle: z.string().max(100).optional(),
    metaDescription: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      if (data.isVirtual) return true;
      return data.venueName || data.city;
    },
    { message: "Physical events must have venue name or city", path: ["venueName"] }
  );

export const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(10000).optional(),
  shortDescription: z.string().max(500).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timezone: z.string().optional(),
  isVirtual: z.boolean().optional(),
  venueName: z.string().max(200).optional(),
  venueAddress: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  virtualLink: z.string().url().optional().or(z.literal("")),
  virtualPlatform: z.string().max(100).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  thumbnailImage: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).max(10).optional(),
  capacity: z.number().int().min(1).optional(),
  isPrivate: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  ageRestriction: z.number().int().min(0).max(100).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  metaTitle: z.string().max(100).optional(),
  metaDescription: z.string().max(500).optional(),
});

export const eventApprovalSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    rejectionReason: z.string().max(1000, "Rejection reason too long").optional(),
  })
  .refine(
    (data) => {
      if (data.status === "REJECTED") return !!data.rejectionReason;
      return true;
    },
    { message: "Rejection reason is required when rejecting an event", path: ["rejectionReason"] }
  );

export const coOrganizerInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  permissions: z.array(z.string()).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventApprovalInput = z.infer<typeof eventApprovalSchema>;
export type CoOrganizerInviteInput = z.infer<typeof coOrganizerInviteSchema>;
