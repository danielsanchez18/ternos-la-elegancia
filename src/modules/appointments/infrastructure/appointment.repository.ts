import { AppointmentStatus, AppointmentType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CreateSpecialScheduleInput,
  ListSpecialSchedulesFilters,
  ListAppointmentsFilters,
  PublicBusinessHour,
  PublicAppointment,
  PublicSpecialSchedule,
  UpdateSpecialScheduleInput,
  UpsertBusinessHourInput,
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

  async countOverlappingAppointments(input: {
    startsAt: Date;
    endsAt: Date;
    excludeAppointmentId?: number;
  }): Promise<number> {
    return prisma.appointment.count({
      where: {
        id: input.excludeAppointmentId
          ? {
              not: input.excludeAppointmentId,
            }
          : undefined,
        status: {
          in: [
            AppointmentStatus.PENDIENTE,
            AppointmentStatus.CONFIRMADA,
            AppointmentStatus.REPROGRAMADA,
          ],
        },
        AND: [
          {
            scheduledAt: {
              lt: input.endsAt,
            },
          },
          {
            OR: [
              {
                estimatedEndAt: {
                  gt: input.startsAt,
                },
              },
              {
                estimatedEndAt: null,
                scheduledAt: {
                  gte: input.startsAt,
                },
              },
            ],
          },
        ],
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

  async listBusinessHours() {
    return prisma.businessHour.findMany({
      orderBy: { dayOfWeek: "asc" },
    });
  }

  async upsertBusinessHour(input: UpsertBusinessHourInput): Promise<PublicBusinessHour> {
    const row = await prisma.businessHour.upsert({
      where: {
        dayOfWeek: input.dayOfWeek,
      },
      create: {
        dayOfWeek: input.dayOfWeek,
        openTime: input.openTime,
        closeTime: input.closeTime,
        isClosed: input.isClosed,
        note: input.note,
      },
      update: {
        openTime: input.openTime,
        closeTime: input.closeTime,
        isClosed: input.isClosed,
        note: input.note,
      },
    });

    return {
      id: row.id,
      dayOfWeek: row.dayOfWeek,
      openTime: row.openTime,
      closeTime: row.closeTime,
      isClosed: row.isClosed,
      note: row.note,
    };
  }

  async listSpecialSchedules(
    filters: ListSpecialSchedulesFilters
  ): Promise<PublicSpecialSchedule[]> {
    return prisma.specialSchedule.findMany({
      where: {
        date:
          filters.from || filters.to
            ? {
                gte: filters.from,
                lte: filters.to,
              }
            : undefined,
      },
      orderBy: { date: "asc" },
    });
  }

  async findSpecialScheduleById(id: number): Promise<PublicSpecialSchedule | null> {
    return prisma.specialSchedule.findUnique({
      where: { id },
    });
  }

  async upsertSpecialScheduleByDate(
    input: CreateSpecialScheduleInput
  ): Promise<PublicSpecialSchedule> {
    return prisma.specialSchedule.upsert({
      where: { date: input.date },
      create: {
        date: input.date,
        openTime: input.openTime,
        closeTime: input.closeTime,
        isClosed: input.isClosed,
        note: input.note,
      },
      update: {
        openTime: input.openTime,
        closeTime: input.closeTime,
        isClosed: input.isClosed,
        note: input.note,
      },
    });
  }

  async updateSpecialScheduleById(
    id: number,
    input: UpdateSpecialScheduleInput
  ): Promise<PublicSpecialSchedule> {
    return prisma.specialSchedule.update({
      where: { id },
      data: {
        openTime: input.openTime,
        closeTime: input.closeTime,
        isClosed: input.isClosed,
        note: input.note,
      },
    });
  }

  async deleteSpecialScheduleById(id: number): Promise<void> {
    await prisma.specialSchedule.delete({
      where: { id },
    });
  }
}
