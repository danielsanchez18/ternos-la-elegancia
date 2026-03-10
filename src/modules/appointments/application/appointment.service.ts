import { AppointmentStatus } from "@prisma/client";

import {
  AppointmentCustomerNotFoundError,
  AppointmentDeadlineExceededError,
  AppointmentNotFoundError,
  AppointmentOutsideBusinessHoursError,
  AppointmentSlotUnavailableError,
  AppointmentTransitionNotAllowedError,
} from "@/src/modules/appointments/domain/appointment.errors";
import {
  AppointmentActionInput,
  CreateAppointmentInput,
  ListAppointmentsFilters,
  PublicAppointment,
} from "@/src/modules/appointments/domain/appointment.types";
import { AppointmentRepository } from "@/src/modules/appointments/infrastructure/appointment.repository";

const DEFAULT_SLOT_CAPACITY = 2;

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

  async getAppointmentById(id: number): Promise<PublicAppointment> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new AppointmentNotFoundError();
    }

    return appointment;
  }

  async createAppointment(input: CreateAppointmentInput): Promise<PublicAppointment> {
    const customerExists = await this.appointmentRepository.customerExists(
      input.customerId
    );

    if (!customerExists) {
      throw new AppointmentCustomerNotFoundError();
    }

    await this.assertSlotIsAvailable(input.scheduledAt);

    const code = await this.appointmentRepository.nextCodeForDate(input.scheduledAt);

    const appointment = await this.appointmentRepository.create({
      customerId: input.customerId,
      type: input.type,
      scheduledAt: input.scheduledAt,
      estimatedEndAt: datePlusMinutes(input.scheduledAt, 30),
      code,
      rescheduleDeadlineAt: dateMinusHours(input.scheduledAt, 24),
      cancelDeadlineAt: dateMinusHours(input.scheduledAt, 24),
      notes: input.notes,
      internalNotes: input.internalNotes,
    });

    await this.appointmentRepository.createStatusHistory({
      appointmentId: appointment.id,
      status: AppointmentStatus.PENDIENTE,
      note: "Cita creada",
    });

    return appointment;
  }

  async actOnAppointment(
    id: number,
    input: AppointmentActionInput
  ): Promise<PublicAppointment> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new AppointmentNotFoundError();
    }

    if (!appointmentStatusAllowsTransition(appointment.status, input.action)) {
      throw new AppointmentTransitionNotAllowedError();
    }

    const now = new Date();

    if (input.action === "CONFIRM") {
      const updated = await this.appointmentRepository.updateById(id, {
        status: AppointmentStatus.CONFIRMADA,
        confirmedAt: now,
      });

      await this.appointmentRepository.createStatusHistory({
        appointmentId: id,
        status: AppointmentStatus.CONFIRMADA,
        note: input.note,
      });

      return updated;
    }

    if (input.action === "COMPLETE") {
      const updated = await this.appointmentRepository.updateById(id, {
        status: AppointmentStatus.REALIZADA,
        attendedAt: now,
      });

      await this.appointmentRepository.createStatusHistory({
        appointmentId: id,
        status: AppointmentStatus.REALIZADA,
        note: input.note,
      });

      return updated;
    }

    if (input.action === "NO_SHOW") {
      const updated = await this.appointmentRepository.updateById(id, {
        status: AppointmentStatus.NO_ASISTIO,
        noShowAt: now,
      });

      await this.appointmentRepository.createStatusHistory({
        appointmentId: id,
        status: AppointmentStatus.NO_ASISTIO,
        note: input.note,
      });

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

      const updated = await this.appointmentRepository.updateById(id, {
        status: AppointmentStatus.CANCELADA,
        cancelledAt: now,
      });

      await this.appointmentRepository.createStatusHistory({
        appointmentId: id,
        status: AppointmentStatus.CANCELADA,
        note: input.note,
      });

      return updated;
    }

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

    await this.assertSlotIsAvailable(input.scheduledAt);

    const updated = await this.appointmentRepository.updateById(id, {
      status: AppointmentStatus.REPROGRAMADA,
      scheduledAt: input.scheduledAt,
      estimatedEndAt: datePlusMinutes(input.scheduledAt, 30),
      rescheduleDeadlineAt: dateMinusHours(input.scheduledAt, 24),
      cancelDeadlineAt: dateMinusHours(input.scheduledAt, 24),
    });

    await this.appointmentRepository.createStatusHistory({
      appointmentId: id,
      status: AppointmentStatus.REPROGRAMADA,
      note: input.note,
    });

    return updated;
  }

  private async assertSlotIsAvailable(scheduledAt: Date): Promise<void> {
    await this.assertInsideBusinessHours(scheduledAt);

    const occupiedSlots = await this.appointmentRepository.countOccupiedSlots(
      scheduledAt
    );

    if (occupiedSlots >= DEFAULT_SLOT_CAPACITY) {
      throw new AppointmentSlotUnavailableError();
    }
  }

  private async assertInsideBusinessHours(scheduledAt: Date): Promise<void> {
    const minutes = scheduledAt.getMinutes();
    if (minutes !== 0 && minutes !== 30) {
      throw new AppointmentOutsideBusinessHoursError();
    }

    const specialSchedule =
      await this.appointmentRepository.findSpecialScheduleForDate(scheduledAt);

    let openTime: string | null = null;
    let closeTime: string | null = null;
    let isClosed = false;

    if (specialSchedule) {
      openTime = specialSchedule.openTime;
      closeTime = specialSchedule.closeTime;
      isClosed = specialSchedule.isClosed;
    } else {
      const dayOfWeek = scheduledAt.getDay();
      const configured = await this.appointmentRepository.findBusinessHour(dayOfWeek);
      const fallback = defaultBusinessHours[dayOfWeek];

      openTime = configured?.openTime ?? fallback?.open ?? null;
      closeTime = configured?.closeTime ?? fallback?.close ?? null;
      isClosed = configured?.isClosed ?? fallback?.isClosed ?? true;
    }

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
}

export const appointmentService = new AppointmentService(
  new AppointmentRepository()
);
