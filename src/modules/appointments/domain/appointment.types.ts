import { AppointmentStatus, AppointmentType } from "@prisma/client";

export type PublicAppointment = {
  id: number;
  customerId: number;
  code: string;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: Date;
  estimatedEndAt: Date | null;
  rescheduleDeadlineAt: Date | null;
  cancelDeadlineAt: Date | null;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  attendedAt: Date | null;
  noShowAt: Date | null;
  reminder24hSentAt: Date | null;
  notes: string | null;
  internalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAppointmentInput = {
  customerId: number;
  type: AppointmentType;
  scheduledAt: Date;
  notes?: string;
  internalNotes?: string;
};

export type AppointmentActionInput =
  | { action: "CONFIRM"; note?: string }
  | { action: "COMPLETE"; note?: string }
  | { action: "NO_SHOW"; note?: string }
  | { action: "CANCEL"; note?: string }
  | { action: "RESCHEDULE"; scheduledAt: Date; note?: string };

export type ListAppointmentsFilters = {
  customerId?: number;
  status?: AppointmentStatus;
  from?: Date;
  to?: Date;
};
