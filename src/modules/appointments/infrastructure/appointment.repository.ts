import { AppointmentStatus, AppointmentType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  ListAppointmentsFilters,
  PublicAppointment,
} from "@/src/modules/appointments/domain/appointment.types";

const publicAppointmentSelect = {
  id: true,
  customerId: true,
  code: true,
  type: true,
  status: true,
  scheduledAt: true,
  estimatedEndAt: true,
  rescheduleDeadlineAt: true,
  cancelDeadlineAt: true,
  confirmedAt: true,
  cancelledAt: true,
  attendedAt: true,
  noShowAt: true,
  reminder24hSentAt: true,
  notes: true,
  internalNotes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AppointmentSelect;

export class AppointmentRepository {
  async customerExists(customerId: number): Promise<boolean> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    return Boolean(customer);
  }

  async list(filters: ListAppointmentsFilters): Promise<PublicAppointment[]> {
    return prisma.appointment.findMany({
      where: {
        customerId: filters.customerId,
        status: filters.status,
        scheduledAt:
          filters.from || filters.to
            ? {
                gte: filters.from,
                lte: filters.to,
              }
            : undefined,
      },
      orderBy: { scheduledAt: "asc" },
      select: publicAppointmentSelect,
    });
  }

  async findById(id: number): Promise<PublicAppointment | null> {
    return prisma.appointment.findUnique({
      where: { id },
      select: publicAppointmentSelect,
    });
  }

  async findBusinessHour(dayOfWeek: number) {
    return prisma.businessHour.findUnique({
      where: { dayOfWeek },
    });
  }

  async findSpecialScheduleForDate(date: Date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return prisma.specialSchedule.findFirst({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });
  }

  async countOccupiedSlots(scheduledAt: Date): Promise<number> {
    return prisma.appointment.count({
      where: {
        scheduledAt,
        status: {
          in: [
            AppointmentStatus.PENDIENTE,
            AppointmentStatus.CONFIRMADA,
            AppointmentStatus.REPROGRAMADA,
          ],
        },
      },
    });
  }

  async nextCodeForDate(scheduledAt: Date): Promise<string> {
    const y = scheduledAt.getFullYear();
    const m = String(scheduledAt.getMonth() + 1).padStart(2, "0");
    const d = String(scheduledAt.getDate()).padStart(2, "0");
    const prefix = `RES-${y}${m}${d}-`;

    const existing = await prisma.appointment.findMany({
      where: {
        code: {
          startsWith: prefix,
        },
      },
      select: { code: true },
      orderBy: { code: "desc" },
    });

    const maxCounter = existing.reduce((max, item) => {
      const lastPart = item.code.split("-").pop();
      const counter = lastPart ? Number(lastPart) : 0;
      return Number.isFinite(counter) && counter > max ? counter : max;
    }, 0);

    return `${prefix}${maxCounter + 1}`;
  }

  async create(input: {
    customerId: number;
    type: AppointmentType;
    scheduledAt: Date;
    estimatedEndAt: Date;
    code: string;
    rescheduleDeadlineAt: Date;
    cancelDeadlineAt: Date;
    notes?: string;
    internalNotes?: string;
  }): Promise<PublicAppointment> {
    return prisma.appointment.create({
      data: {
        customerId: input.customerId,
        type: input.type,
        scheduledAt: input.scheduledAt,
        estimatedEndAt: input.estimatedEndAt,
        code: input.code,
        rescheduleDeadlineAt: input.rescheduleDeadlineAt,
        cancelDeadlineAt: input.cancelDeadlineAt,
        notes: input.notes,
        internalNotes: input.internalNotes,
      },
      select: publicAppointmentSelect,
    });
  }

  async updateById(
    id: number,
    input: Prisma.AppointmentUpdateInput
  ): Promise<PublicAppointment> {
    return prisma.appointment.update({
      where: { id },
      data: input,
      select: publicAppointmentSelect,
    });
  }

  async createStatusHistory(input: {
    appointmentId: number;
    status: AppointmentStatus;
    note?: string;
  }): Promise<void> {
    await prisma.appointmentStatusHistory.create({
      data: {
        appointmentId: input.appointmentId,
        status: input.status,
        note: input.note,
      },
    });
  }
}
