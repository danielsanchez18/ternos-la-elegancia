import { AppointmentStatus, AppointmentType } from "@prisma/client";
import { z } from "zod";

export const appointmentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const scheduleIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listAppointmentsQuerySchema = z.object({
  customerId: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const listAvailableSlotsQuerySchema = z.object({
  date: z.coerce.date(),
  excludeAppointmentId: z.coerce.number().int().positive().optional(),
});

export const createAppointmentSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  type: z.nativeEnum(AppointmentType),
  scheduledAt: z.coerce.date(),
  notes: z.string().trim().max(500).optional(),
  internalNotes: z.string().trim().max(500).optional(),
});

export const appointmentActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("CONFIRM"),
    note: z.string().trim().max(300).optional(),
  }),
  z.object({
    action: z.literal("COMPLETE"),
    note: z.string().trim().max(300).optional(),
  }),
  z.object({
    action: z.literal("NO_SHOW"),
    note: z.string().trim().max(300).optional(),
  }),
  z.object({
    action: z.literal("CANCEL"),
    note: z.string().trim().max(300).optional(),
  }),
  z.object({
    action: z.literal("RESCHEDULE"),
    scheduledAt: z.coerce.date(),
    note: z.string().trim().max(300).optional(),
  }),
]);

const hhmmSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);

export const upsertBusinessHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.union([hhmmSchema, z.null()]).optional(),
  closeTime: z.union([hhmmSchema, z.null()]).optional(),
  isClosed: z.boolean().optional(),
  note: z.string().trim().max(300).optional(),
});

export const listSpecialSchedulesQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const createSpecialScheduleSchema = z.object({
  date: z.coerce.date(),
  openTime: z.union([hhmmSchema, z.null()]).optional(),
  closeTime: z.union([hhmmSchema, z.null()]).optional(),
  isClosed: z.boolean().optional(),
  note: z.string().trim().max(300).optional(),
});

export const updateSpecialScheduleSchema = z
  .object({
    openTime: z.union([hhmmSchema, z.null()]).optional(),
    closeTime: z.union([hhmmSchema, z.null()]).optional(),
    isClosed: z.boolean().optional(),
    note: z.string().trim().max(300).optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
