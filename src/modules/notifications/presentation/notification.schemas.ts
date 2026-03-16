import { NotificationChannel, NotificationStatus } from "@prisma/client";
import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  customerId: z.coerce.number().int().positive().optional(),
  channel: z.nativeEnum(NotificationChannel).optional(),
  status: z.nativeEnum(NotificationStatus).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const dispatchAppointmentReminder24hSchema = z.object({
  channel: z.nativeEnum(NotificationChannel).default(NotificationChannel.WHATSAPP),
  dryRun: z.boolean().optional(),
});

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
