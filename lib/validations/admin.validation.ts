import { z } from "zod";

export const eventVerificationSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    rejectionReason: z
      .string()
      .min(10, "Reason must be at least 10 characters")
      .max(1000, "Reason too long")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.status === "REJECTED") return !!data.rejectionReason;
      return true;
    },
    { message: "Rejection reason is required when rejecting an event", path: ["rejectionReason"] }
  );

export const userManagementSchema = z
  .object({
    action: z.enum(["suspend", "activate", "verify_email", "verify_phone", "update_role"]),
    reason: z.string().min(10, "Reason must be at least 10 characters").max(500, "Reason too long").optional(),
    newRole: z.enum(["ADMIN", "ORGANIZER", "ATTENDEE"]).optional(),
  })
  .refine(
    (data) => {
      if (data.action === "suspend") return !!data.reason;
      if (data.action === "update_role") return !!data.newRole;
      return true;
    },
    { message: "Reason required for suspend, newRole required for update_role" }
  );

export const bulkActionSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID required").max(100, "Maximum 100 items"),
  action: z.string().min(1, "Action is required"),
  reason: z.string().optional(),
});

export type EventVerificationInput = z.infer<typeof eventVerificationSchema>;
export type UserManagementInput = z.infer<typeof userManagementSchema>;
export type BulkActionInput = z.infer<typeof bulkActionSchema>;
