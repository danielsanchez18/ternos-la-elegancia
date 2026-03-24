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

type AppointmentDbClient = typeof prisma | Prisma.TransactionClient;

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

function appointmentDateLockParts(date: Date): { keyPart1: number; keyPart2: number } {
  return {
    keyPart1: date.getFullYear() * 100 + (date.getMonth() + 1),
    keyPart2: date.getDate(),
  };
}

export class AppointmentRepository {
  async transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }

  async customerExists(
    customerId: string,
    db: AppointmentDbClient = prisma
  ): Promise<boolean> {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    return Boolean(customer);
  }

  async list(
    filters: ListAppointmentsFilters,
    db: AppointmentDbClient = prisma
  ): Promise<PublicAppointment[]> {
    return db.appointment.findMany({
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

  async findById(
    id: string,
    db: AppointmentDbClient = prisma
  ): Promise<PublicAppointment | null> {
    return db.appointment.findUnique({
      where: { id },
      select: publicAppointmentSelect,
    });
  }

  async findBusinessHour(dayOfWeek: number, db: AppointmentDbClient = prisma) {
    return db.businessHour.findUnique({
      where: { dayOfWeek },
    });
  }

  async findSpecialScheduleForDate(date: Date, db: AppointmentDbClient = prisma) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return db.specialSchedule.findFirst({
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
    excludeAppointmentId?: string;
  }, db: AppointmentDbClient = prisma): Promise<number> {
    return db.appointment.count({
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

  async nextCodeForDate(
    scheduledAt: Date,
    db: AppointmentDbClient = prisma
  ): Promise<string> {
    const y = scheduledAt.getFullYear();
    const m = String(scheduledAt.getMonth() + 1).padStart(2, "0");
    const d = String(scheduledAt.getDate()).padStart(2, "0");
    const prefix = `RES-${y}${m}${d}-`;

    const existing = await db.appointment.findMany({
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

  async lockAppointmentDate(date: Date, db: Prisma.TransactionClient): Promise<void> {
    const { keyPart1, keyPart2 } = appointmentDateLockParts(date);
    await db.$executeRaw`SELECT pg_advisory_xact_lock(${keyPart1}, ${keyPart2})`;
  }

  async lockAppointmentRow(
    id: string,
    db: Prisma.TransactionClient
  ): Promise<boolean> {
    const rows = await db.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM "Appointment"
      WHERE id = ${id}
      FOR UPDATE
    `;

    return rows.length > 0;
  }

  async create(input: {
    customerId: string;
    type: AppointmentType;
    scheduledAt: Date;
    estimatedEndAt: Date;
    code: string;
    rescheduleDeadlineAt: Date;
    cancelDeadlineAt: Date;
    notes?: string;
    internalNotes?: string;
  }, db: AppointmentDbClient = prisma): Promise<PublicAppointment> {
    return db.appointment.create({
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
    id: string,
    input: Prisma.AppointmentUpdateInput,
    db: AppointmentDbClient = prisma
  ): Promise<PublicAppointment> {
    return db.appointment.update({
      where: { id },
      data: input,
      select: publicAppointmentSelect,
    });
  }

  async createStatusHistory(input: {
    appointmentId: string;
    status: AppointmentStatus;
    note?: string;
  }, db: AppointmentDbClient = prisma): Promise<void> {
    await db.appointmentStatusHistory.create({
      data: {
        appointmentId: input.appointmentId,
        status: input.status,
        note: input.note,
      },
    });
  }

  async listBusinessHours(db: AppointmentDbClient = prisma) {
    return db.businessHour.findMany({
      orderBy: { dayOfWeek: "asc" },
    });
  }

  async upsertBusinessHour(
    input: UpsertBusinessHourInput,
    db: AppointmentDbClient = prisma
  ): Promise<PublicBusinessHour> {
    const row = await db.businessHour.upsert({
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
    filters: ListSpecialSchedulesFilters,
    db: AppointmentDbClient = prisma
  ): Promise<PublicSpecialSchedule[]> {
    return db.specialSchedule.findMany({
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

  async findSpecialScheduleById(
    id: string,
    db: AppointmentDbClient = prisma
  ): Promise<PublicSpecialSchedule | null> {
    return db.specialSchedule.findUnique({
      where: { id },
    });
  }

  async upsertSpecialScheduleByDate(
    input: CreateSpecialScheduleInput,
    db: AppointmentDbClient = prisma
  ): Promise<PublicSpecialSchedule> {
    return db.specialSchedule.upsert({
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
    id: string,
    input: UpdateSpecialScheduleInput,
    db: AppointmentDbClient = prisma
  ): Promise<PublicSpecialSchedule> {
    return db.specialSchedule.update({
      where: { id },
      data: {
        openTime: input.openTime,
        closeTime: input.closeTime,
        isClosed: input.isClosed,
        note: input.note,
      },
    });
  }

  async deleteSpecialScheduleById(
    id: string,
    db: AppointmentDbClient = prisma
  ): Promise<void> {
    await db.specialSchedule.delete({
      where: { id },
    });
  }
}
