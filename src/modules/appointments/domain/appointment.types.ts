import { AppointmentStatus, AppointmentType } from "@prisma/client";

export type PublicAppointment = {
  id: string;
  customerId: string;
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
  customerId: string;
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
  customerId?: string;
  status?: AppointmentStatus;
  from?: Date;
  to?: Date;
};

export type ListAvailableAppointmentSlotsInput = {
  date: Date;
  excludeAppointmentId?: string;
};

export type PublicAppointmentSlot = {
  time: string;
  scheduledAt: Date;
  occupied: number;
  capacity: number;
  available: boolean;
};

export type PublicAvailableAppointmentSlots = {
  date: Date;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  note: string | null;
  source: "special" | "regular";
  slotMinutes: number;
  capacity: number;
  slots: PublicAppointmentSlot[];
};

export type PublicBusinessHour = {
  id: string | null;
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  note: string | null;
};

export type UpsertBusinessHourInput = {
  dayOfWeek: number;
  openTime?: string | null;
  closeTime?: string | null;
  isClosed?: boolean;
  note?: string;
};

export type PublicSpecialSchedule = {
  id: string;
  date: Date;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  note: string | null;
};

export type ListSpecialSchedulesFilters = {
  from?: Date;
  to?: Date;
};

export type CreateSpecialScheduleInput = {
  date: Date;
  openTime?: string | null;
  closeTime?: string | null;
  isClosed?: boolean;
  note?: string;
};

export type UpdateSpecialScheduleInput = {
  openTime?: string | null;
  closeTime?: string | null;
  isClosed?: boolean;
  note?: string;
};
