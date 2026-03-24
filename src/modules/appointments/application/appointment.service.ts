import { AppointmentStatus } from "@prisma/client";

import {
  AppointmentCustomerNotFoundError,
  AppointmentDeadlineExceededError,
  AppointmentNotFoundError,
  AppointmentOutsideBusinessHoursError,
  AppointmentScheduleValidationError,
  AppointmentSpecialScheduleNotFoundError,
  AppointmentSlotUnavailableError,
  AppointmentTransitionNotAllowedError,
} from "@/src/modules/appointments/domain/appointment.errors";
import {
  AppointmentActionInput,
  CreateSpecialScheduleInput,
  CreateAppointmentInput,
  ListAvailableAppointmentSlotsInput,
  ListSpecialSchedulesFilters,
  ListAppointmentsFilters,
  PublicAvailableAppointmentSlots,
  PublicBusinessHour,
  PublicAppointment,
  PublicSpecialSchedule,
  UpdateSpecialScheduleInput,
  UpsertBusinessHourInput,
} from "@/src/modules/appointments/domain/appointment.types";
import { AppointmentRepository } from "@/src/modules/appointments/infrastructure/appointment.repository";

const DEFAULT_SLOT_CAPACITY = 2;
const APPOINTMENT_SLOT_MINUTES = 30;

const defaultBusinessHours: Record<number, { open: string; close: string; isClosed: boolean }> = {
  0: { open: "09:00", close: "12:00", isClosed: false },
  1: { open: "09:00", close: "19:30", isClosed: false },
  2: { open: "09:00", close: "19:30", isClosed: false },
  3: { open: "09:00", close: "19:30", isClosed: false },
  4: { open: "09:00", close: "19:30", isClosed: false },
  5: { open: "09:00", close: "19:30", isClosed: false },
  6: { open: "09:00", close: "19:30", isClosed: false },
};

function dateMinusHours(date: Date, hours: number): Date {
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
}

function datePlusMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function datePlusHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function normalizedDayDate(input: Date): Date {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function timeLabelFromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${pad2(hours)}:${pad2(remainder)}`;
}

type ResolvedDaySchedule = {
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  note: string | null;
  source: "special" | "regular";
};

function appointmentStatusAllowsTransition(
  current: AppointmentStatus,
  action: AppointmentActionInput["action"]
): boolean {
  const confirmableStatuses: AppointmentStatus[] = [
    AppointmentStatus.PENDIENTE,
    AppointmentStatus.REPROGRAMADA,
  ];

  const completableStatuses: AppointmentStatus[] = [
    AppointmentStatus.CONFIRMADA,
    AppointmentStatus.REPROGRAMADA,
    AppointmentStatus.PENDIENTE,
  ];

  const noShowStatuses: AppointmentStatus[] = [
    AppointmentStatus.CONFIRMADA,
    AppointmentStatus.REPROGRAMADA,
    AppointmentStatus.PENDIENTE,
  ];

  const cancellableStatuses: AppointmentStatus[] = [
    AppointmentStatus.PENDIENTE,
    AppointmentStatus.CONFIRMADA,
    AppointmentStatus.REPROGRAMADA,
  ];

  const reschedulableStatuses: AppointmentStatus[] = [
    AppointmentStatus.PENDIENTE,
    AppointmentStatus.CONFIRMADA,
    AppointmentStatus.REPROGRAMADA,
    AppointmentStatus.NO_ASISTIO,
  ];

  if (action === "CONFIRM") {
    return confirmableStatuses.includes(current);
  }

  if (action === "COMPLETE") {
    return completableStatuses.includes(current);
  }

  if (action === "NO_SHOW") {
    return noShowStatuses.includes(current);
  }

  if (action === "CANCEL") {
    return cancellableStatuses.includes(current);
  }

  if (action === "RESCHEDULE") {
    return reschedulableStatuses.includes(current);
  }

  return false;
}

export class AppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async listAppointments(filters: ListAppointmentsFilters): Promise<PublicAppointment[]> {
    return this.appointmentRepository.list(filters);
  }

  async getAppointmentById(id: string): Promise<PublicAppointment> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new AppointmentNotFoundError();
    }

    return appointment;
  }

  async getAppointmentByIdentifier(id: string): Promise<PublicAppointment> {
    return this.getAppointmentById(id);
  }

  async createAppointment(input: CreateAppointmentInput): Promise<PublicAppointment> {
    return this.appointmentRepository.transaction(async (tx) => {
      const customerExists = await this.appointmentRepository.customerExists(
        input.customerId,
        tx
      );

      if (!customerExists) {
        throw new AppointmentCustomerNotFoundError();
      }

      await this.appointmentRepository.lockAppointmentDate(input.scheduledAt, tx);
      await this.assertSlotIsAvailable(input.scheduledAt, undefined, tx);

      const code = await this.appointmentRepository.nextCodeForDate(
        input.scheduledAt,
        tx
      );

      const appointment = await this.appointmentRepository.create(
        {
          customerId: input.customerId,
          type: input.type,
          scheduledAt: input.scheduledAt,
          estimatedEndAt: datePlusMinutes(input.scheduledAt, APPOINTMENT_SLOT_MINUTES),
          code,
          rescheduleDeadlineAt: dateMinusHours(input.scheduledAt, 24),
          cancelDeadlineAt: dateMinusHours(input.scheduledAt, 24),
          notes: input.notes,
          internalNotes: input.internalNotes,
        },
        tx
      );

      await this.appointmentRepository.createStatusHistory(
        {
          appointmentId: appointment.id,
          status: AppointmentStatus.PENDIENTE,
          note: "Cita creada",
        },
        tx
      );

      return appointment;
    });
  }

  async actOnAppointment(
    id: string,
    input: AppointmentActionInput
  ): Promise<PublicAppointment> {
    return this.appointmentRepository.transaction(async (tx) => {
      const rowLocked = await this.appointmentRepository.lockAppointmentRow(id, tx);
      if (!rowLocked) {
        throw new AppointmentNotFoundError();
      }

      const appointment = await this.appointmentRepository.findById(id, tx);

      if (!appointment) {
        throw new AppointmentNotFoundError();
      }

      if (!appointmentStatusAllowsTransition(appointment.status, input.action)) {
        throw new AppointmentTransitionNotAllowedError();
      }

      const now = new Date();

      if (input.action === "CONFIRM") {
        const updated = await this.appointmentRepository.updateById(
          id,
          {
            status: AppointmentStatus.CONFIRMADA,
            confirmedAt: now,
          },
          tx
        );

        await this.appointmentRepository.createStatusHistory(
          {
            appointmentId: id,
            status: AppointmentStatus.CONFIRMADA,
            note: input.note,
          },
          tx
        );

        return updated;
      }

      if (input.action === "COMPLETE") {
        const updated = await this.appointmentRepository.updateById(
          id,
          {
            status: AppointmentStatus.REALIZADA,
            attendedAt: now,
          },
          tx
        );

        await this.appointmentRepository.createStatusHistory(
          {
            appointmentId: id,
            status: AppointmentStatus.REALIZADA,
            note: input.note,
          },
          tx
        );

        return updated;
      }

      if (input.action === "NO_SHOW") {
        const updated = await this.appointmentRepository.updateById(
          id,
          {
            status: AppointmentStatus.NO_ASISTIO,
            noShowAt: now,
          },
          tx
        );

        await this.appointmentRepository.createStatusHistory(
          {
            appointmentId: id,
            status: AppointmentStatus.NO_ASISTIO,
            note: input.note,
          },
          tx
        );

        return updated;
      }

      if (input.action === "CANCEL") {
        const deadline =
          appointment.cancelDeadlineAt ?? dateMinusHours(appointment.scheduledAt, 24);

        if (now > deadline) {
          throw new AppointmentDeadlineExceededError(
            "Cancellation deadline has been exceeded"
          );
        }

        const updated = await this.appointmentRepository.updateById(
          id,
          {
            status: AppointmentStatus.CANCELADA,
            cancelledAt: now,
          },
          tx
        );

        await this.appointmentRepository.createStatusHistory(
          {
            appointmentId: id,
            status: AppointmentStatus.CANCELADA,
            note: input.note,
          },
          tx
        );

        return updated;
      }

      await this.appointmentRepository.lockAppointmentDate(input.scheduledAt, tx);

      const deadline =
        appointment.rescheduleDeadlineAt ?? dateMinusHours(appointment.scheduledAt, 24);

      if (appointment.status === AppointmentStatus.NO_ASISTIO) {
        const noShowAt = appointment.noShowAt ?? now;
        if (now > datePlusHours(noShowAt, 6)) {
          throw new AppointmentDeadlineExceededError(
            "No-show reschedule window (6 hours) has been exceeded"
          );
        }
      } else if (now > deadline) {
        throw new AppointmentDeadlineExceededError(
          "Reschedule deadline has been exceeded"
        );
      }

      await this.assertSlotIsAvailable(input.scheduledAt, id, tx);

      const updated = await this.appointmentRepository.updateById(
        id,
        {
          status: AppointmentStatus.REPROGRAMADA,
          scheduledAt: input.scheduledAt,
          estimatedEndAt: datePlusMinutes(input.scheduledAt, APPOINTMENT_SLOT_MINUTES),
          rescheduleDeadlineAt: dateMinusHours(input.scheduledAt, 24),
          cancelDeadlineAt: dateMinusHours(input.scheduledAt, 24),
        },
        tx
      );

      await this.appointmentRepository.createStatusHistory(
        {
          appointmentId: id,
          status: AppointmentStatus.REPROGRAMADA,
          note: input.note,
        },
        tx
      );

      return updated;
    });
  }

  async actOnAppointmentByIdentifier(
    id: string,
    input: AppointmentActionInput
  ): Promise<PublicAppointment> {
    const appointment = await this.getAppointmentByIdentifier(id);
    return this.actOnAppointment(appointment.id, input);
  }

  async listBusinessHours(): Promise<PublicBusinessHour[]> {
    const configured = await this.appointmentRepository.listBusinessHours();

    return Array.from({ length: 7 }, (_, dayOfWeek) => {
      const row = configured.find((item) => item.dayOfWeek === dayOfWeek);
      const fallback = defaultBusinessHours[dayOfWeek];

      return {
        id: row?.id ?? null,
        dayOfWeek,
        openTime: row?.openTime ?? fallback?.open ?? null,
        closeTime: row?.closeTime ?? fallback?.close ?? null,
        isClosed: row?.isClosed ?? fallback?.isClosed ?? true,
        note: row?.note ?? null,
      };
    });
  }

  async listAvailableSlots(
    input: ListAvailableAppointmentSlotsInput
  ): Promise<PublicAvailableAppointmentSlots> {
    const date = normalizedDayDate(input.date);
    const schedule = await this.resolveDayScheduleForDate(date);

    const response: PublicAvailableAppointmentSlots = {
      date,
      openTime: schedule.openTime,
      closeTime: schedule.closeTime,
      isClosed: schedule.isClosed,
      note: schedule.note,
      source: schedule.source,
      slotMinutes: APPOINTMENT_SLOT_MINUTES,
      capacity: DEFAULT_SLOT_CAPACITY,
      slots: [],
    };

    if (schedule.isClosed || !schedule.openTime || !schedule.closeTime) {
      return response;
    }

    const openMinutes = timeToMinutes(schedule.openTime);
    const closeMinutes = timeToMinutes(schedule.closeTime);

    if (openMinutes >= closeMinutes) {
      return response;
    }

    const slotStarts: Date[] = [];
    for (let cursor = openMinutes; cursor < closeMinutes; cursor += APPOINTMENT_SLOT_MINUTES) {
      const slotStart = new Date(date);
      slotStart.setHours(Math.floor(cursor / 60), cursor % 60, 0, 0);
      slotStarts.push(slotStart);
    }

    const occupancies = await Promise.all(
      slotStarts.map((slotStart) =>
        this.appointmentRepository.countOverlappingAppointments({
          startsAt: slotStart,
          endsAt: datePlusMinutes(slotStart, APPOINTMENT_SLOT_MINUTES),
          excludeAppointmentId: input.excludeAppointmentId,
        })
      )
    );

    response.slots = slotStarts.map((slotStart, index) => {
      const occupied = occupancies[index];
      const minutes = slotStart.getHours() * 60 + slotStart.getMinutes();

      return {
        time: timeLabelFromMinutes(minutes),
        scheduledAt: slotStart,
        occupied,
        capacity: DEFAULT_SLOT_CAPACITY,
        available: occupied < DEFAULT_SLOT_CAPACITY,
      };
    });

    return response;
  }

  async upsertBusinessHour(input: UpsertBusinessHourInput): Promise<PublicBusinessHour> {
    const isClosed = input.isClosed ?? false;

    if (!isClosed) {
      if (!input.openTime || !input.closeTime) {
        throw new AppointmentScheduleValidationError(
          "openTime and closeTime are required when day is open"
        );
      }

      if (timeToMinutes(input.openTime) >= timeToMinutes(input.closeTime)) {
        throw new AppointmentScheduleValidationError(
          "openTime must be before closeTime"
        );
      }
    }

    return this.appointmentRepository.upsertBusinessHour({
      ...input,
      isClosed,
      openTime: isClosed ? null : input.openTime ?? null,
      closeTime: isClosed ? null : input.closeTime ?? null,
    });
  }

  async listSpecialSchedules(
    filters: ListSpecialSchedulesFilters
  ): Promise<PublicSpecialSchedule[]> {
    return this.appointmentRepository.listSpecialSchedules(filters);
  }

  async createSpecialSchedule(
    input: CreateSpecialScheduleInput
  ): Promise<PublicSpecialSchedule> {
    const normalizedDate = normalizedDayDate(input.date);
    const isClosed = input.isClosed ?? false;

    if (!isClosed) {
      if (!input.openTime || !input.closeTime) {
        throw new AppointmentScheduleValidationError(
          "openTime and closeTime are required when day is open"
        );
      }

      if (timeToMinutes(input.openTime) >= timeToMinutes(input.closeTime)) {
        throw new AppointmentScheduleValidationError(
          "openTime must be before closeTime"
        );
      }
    }

    return this.appointmentRepository.upsertSpecialScheduleByDate({
      ...input,
      date: normalizedDate,
      isClosed,
      openTime: isClosed ? null : input.openTime ?? null,
      closeTime: isClosed ? null : input.closeTime ?? null,
    });
  }

  async updateSpecialSchedule(
    id: string,
    input: UpdateSpecialScheduleInput
  ): Promise<PublicSpecialSchedule> {
    const existing = await this.appointmentRepository.findSpecialScheduleById(id);
    if (!existing) {
      throw new AppointmentSpecialScheduleNotFoundError();
    }

    const isClosed = input.isClosed ?? existing.isClosed;
    const openTime = input.openTime !== undefined ? input.openTime : existing.openTime;
    const closeTime = input.closeTime !== undefined ? input.closeTime : existing.closeTime;

    if (!isClosed) {
      if (!openTime || !closeTime) {
        throw new AppointmentScheduleValidationError(
          "openTime and closeTime are required when day is open"
        );
      }

      if (timeToMinutes(openTime) >= timeToMinutes(closeTime)) {
        throw new AppointmentScheduleValidationError(
          "openTime must be before closeTime"
        );
      }
    }

    return this.appointmentRepository.updateSpecialScheduleById(id, {
      ...input,
      isClosed,
      openTime: isClosed ? null : openTime,
      closeTime: isClosed ? null : closeTime,
    });
  }

  async deleteSpecialSchedule(id: string): Promise<void> {
    const existing = await this.appointmentRepository.findSpecialScheduleById(id);
    if (!existing) {
      throw new AppointmentSpecialScheduleNotFoundError();
    }

    await this.appointmentRepository.deleteSpecialScheduleById(id);
  }

  private async assertSlotIsAvailable(
    scheduledAt: Date,
    excludeAppointmentId?: string,
    tx?: Parameters<AppointmentRepository["countOverlappingAppointments"]>[1]
  ): Promise<void> {
    await this.assertInsideBusinessHours(scheduledAt, tx);

    const occupiedSlots = await this.appointmentRepository.countOverlappingAppointments({
      startsAt: scheduledAt,
      endsAt: datePlusMinutes(scheduledAt, APPOINTMENT_SLOT_MINUTES),
      excludeAppointmentId,
    }, tx);

    if (occupiedSlots >= DEFAULT_SLOT_CAPACITY) {
      throw new AppointmentSlotUnavailableError();
    }
  }

  private async assertInsideBusinessHours(
    scheduledAt: Date,
    tx?: Parameters<AppointmentRepository["findBusinessHour"]>[1]
  ): Promise<void> {
    const minutes = scheduledAt.getMinutes();
    if (minutes !== 0 && minutes !== 30) {
      throw new AppointmentOutsideBusinessHoursError();
    }

    const schedule = await this.resolveDayScheduleForDate(scheduledAt, tx);
    const openTime = schedule.openTime;
    const closeTime = schedule.closeTime;
    const isClosed = schedule.isClosed;

    if (isClosed || !openTime || !closeTime) {
      throw new AppointmentOutsideBusinessHoursError();
    }

    const selectedMinutes = scheduledAt.getHours() * 60 + scheduledAt.getMinutes();
    const openMinutes = timeToMinutes(openTime);
    const closeMinutes = timeToMinutes(closeTime);

    if (selectedMinutes < openMinutes || selectedMinutes >= closeMinutes) {
      throw new AppointmentOutsideBusinessHoursError();
    }
  }

  private async resolveDayScheduleForDate(
    date: Date,
    tx?: Parameters<AppointmentRepository["findBusinessHour"]>[1]
  ): Promise<ResolvedDaySchedule> {
    const specialSchedule = await this.appointmentRepository.findSpecialScheduleForDate(date, tx);

    if (specialSchedule) {
      return {
        openTime: specialSchedule.openTime,
        closeTime: specialSchedule.closeTime,
        isClosed: specialSchedule.isClosed,
        note: specialSchedule.note ?? null,
        source: "special",
      };
    }

    const dayOfWeek = date.getDay();
    const configured = await this.appointmentRepository.findBusinessHour(dayOfWeek, tx);
    const fallback = defaultBusinessHours[dayOfWeek];

    return {
      openTime: configured?.openTime ?? fallback?.open ?? null,
      closeTime: configured?.closeTime ?? fallback?.close ?? null,
      isClosed: configured?.isClosed ?? fallback?.isClosed ?? true,
      note: configured?.note ?? null,
      source: "regular",
    };
  }
}

export const appointmentService = new AppointmentService(
  new AppointmentRepository()
);
