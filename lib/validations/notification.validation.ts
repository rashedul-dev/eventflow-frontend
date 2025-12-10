import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  emailNotifications: z
    .object({
      ticketPurchase: z.boolean(),
      eventReminders: z.boolean(),
      eventUpdates: z.boolean(),
      paymentUpdates: z.boolean(),
      marketing: z.boolean(),
    })
    .optional(),
  inAppNotifications: z
    .object({
      ticketPurchase: z.boolean(),
      eventReminders: z.boolean(),
      eventUpdates: z.boolean(),
      paymentUpdates: z.boolean(),
    })
    .optional(),
  smsNotifications: z
    .object({
      eventReminders: z.boolean(),
      urgentUpdates: z.boolean(),
    })
    .optional(),
  reminderTiming: z
    .object({
      oneDayBefore: z.boolean(),
      oneHourBefore: z.boolean(),
      atEventTime: z.boolean(),
    })
    .optional(),
});

export const markAllAsReadSchema = z.object({
  type: z.enum(["TICKET_PURCHASE", "EVENT_UPDATE", "EVENT_REMINDER", "PAYMENT", "SYSTEM", "MARKETING"]).optional(),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type MarkAllAsReadInput = z.infer<typeof markAllAsReadSchema>;
