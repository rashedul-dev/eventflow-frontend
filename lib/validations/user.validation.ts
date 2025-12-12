import { z } from "zod";

const socialLinksSchema = z
  .object({
    facebook: z.string().url("Invalid Facebook URL").optional().or(z.literal("")),
    twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
    instagram: z.string().url("Invalid Instagram URL").optional().or(z.literal("")),
    linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    youtube: z.string().url("Invalid YouTube URL").optional().or(z.literal("")),
  })
  .optional();

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "First name too long").optional(),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name too long").optional(),
  phone: z.string().max(20, "Phone too long").optional().or(z.literal("")),
  avatar: z.string().optional().or(z.literal("")),
});

export const updateOrganizerProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100).optional(),
  lastName: z.string().min(1, "Last name is required").max(100).optional(),
  phone: z.string().min(10).max(20).optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
  organizationName: z
    .string()
    .min(1, "Organization name is required")
    .max(200, "Organization name too long")
    .optional(),
  organizationDesc: z.string().max(2000, "Description too long").optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  socialLinks: socialLinksSchema,
});

export const createOrganizerProfileSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required").max(200, "Organization name too long"),
  organizationDesc: z.string().max(2000, "Description too long").optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  socialLinks: socialLinksSchema,
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete account"),
  confirmation: z.literal("DELETE MY ACCOUNT").refine((val) => val === "DELETE MY ACCOUNT", {
    message: 'Please type "DELETE MY ACCOUNT" to confirm',
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateOrganizerProfileInput = z.infer<typeof updateOrganizerProfileSchema>;
export type CreateOrganizerProfileInput = z.infer<typeof createOrganizerProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
