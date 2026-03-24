import { AppointmentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { isUuidLike } from "@/src/security/public-id";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function fullName(input: { nombres: string; apellidos: string | null }) {
  return `${input.nombres} ${input.apellidos ?? ""}`.trim();
}

export function parseAdminAppointmentId(value: string): string | null {
  const trimmed = value.trim();
  if (!isUuidLike(trimmed)) {
    return null;
  }

  return trimmed.toLowerCase();
}

type LinkedOrderType = "venta" | "confeccion" | "alquiler" | "arreglo";

type LinkedOrderData = {
  id: string;
  type: LinkedOrderType;
  code: string | null;
  status: string | null;
};

type LinkedOrderInput = {
  saleOrderId: string | null;
  customOrderId: string | null;
  rentalOrderId: string | null;
  alterationOrderId: string | null;
  saleOrder?: { code: string; status: string } | null;
  customOrder?: { code: string; status: string } | null;
  rentalOrder?: { code: string; status: string } | null;
  alterationOrder?: { code: string; status: string } | null;
};

function resolveLinkedOrder(input: LinkedOrderInput): LinkedOrderData | null {
  if (input.saleOrderId) {
    return {
      id: input.saleOrderId,
      type: "venta",
      code: input.saleOrder?.code ?? null,
      status: input.saleOrder?.status ?? null,
    };
  }

  if (input.customOrderId) {
    return {
      id: input.customOrderId,
      type: "confeccion",
      code: input.customOrder?.code ?? null,
      status: input.customOrder?.status ?? null,
    };
  }

  if (input.rentalOrderId) {
    return {
      id: input.rentalOrderId,
      type: "alquiler",
      code: input.rentalOrder?.code ?? null,
      status: input.rentalOrder?.status ?? null,
    };
  }

  if (input.alterationOrderId) {
    return {
      id: input.alterationOrderId,
      type: "arreglo",
      code: input.alterationOrder?.code ?? null,
      status: input.alterationOrder?.status ?? null,
    };
  }

  return null;
}

const DAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

/* ------------------------------------------------------------------ */
/*  Overview (section root)                                            */
/* ------------------------------------------------------------------ */

export async function getAdminAppointmentsOverviewData() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekEnd = addDays(todayEnd, 7);
  const monthStart = startOfMonth(now);

  const activeStatuses: AppointmentStatus[] = [
    AppointmentStatus.PENDIENTE,
    AppointmentStatus.CONFIRMADA,
    AppointmentStatus.REPROGRAMADA,
  ];

  const [
    totalAppointments,
    todayAppointments,
    weekAppointments,
    pendingConfirmation,
    noShowThisMonth,
    completedThisMonth,
    cancelledThisMonth,
    recentAppointments,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({
      where: {
        scheduledAt: { gte: todayStart, lte: todayEnd },
        status: { in: activeStatuses },
      },
    }),
    prisma.appointment.count({
      where: {
        scheduledAt: { gte: todayStart, lte: weekEnd },
        status: { in: activeStatuses },
      },
    }),
    prisma.appointment.count({
      where: { status: AppointmentStatus.PENDIENTE },
    }),
    prisma.appointment.count({
      where: {
        status: AppointmentStatus.NO_ASISTIO,
        noShowAt: { gte: monthStart },
      },
    }),
    prisma.appointment.count({
      where: {
        status: AppointmentStatus.REALIZADA,
        attendedAt: { gte: monthStart },
      },
    }),
    prisma.appointment.count({
      where: {
        status: AppointmentStatus.CANCELADA,
        cancelledAt: { gte: monthStart },
      },
    }),
    prisma.appointment.findMany({
      take: 8,
      orderBy: { scheduledAt: "asc" },
      where: {
        scheduledAt: { gte: todayStart },
        status: { in: activeStatuses },
      },
      select: {
        id: true,
        code: true,
        type: true,
        status: true,
        scheduledAt: true,
        notes: true,
        customer: {
          select: { id: true, nombres: true, apellidos: true },
        },
      },
    }),
  ]);

  return {
    summary: {
      totalAppointments,
      todayAppointments,
      weekAppointments,
      pendingConfirmation,
      noShowThisMonth,
      completedThisMonth,
      cancelledThisMonth,
    },
    recentAppointments: recentAppointments.map((appointment) => ({
      id: appointment.id,
      code: appointment.code,
      type: appointment.type,
      status: appointment.status,
      scheduledAt: appointment.scheduledAt,
      notes: appointment.notes,
      customerId: appointment.customer.id,
      customerName: fullName(appointment.customer),
    })),
  };
}

/* ------------------------------------------------------------------ */
/*  Agenda (listado)                                                   */
/* ------------------------------------------------------------------ */

export async function getAdminAppointmentsAgendaData() {
  const appointments = await prisma.appointment.findMany({
    take: 50,
    orderBy: { scheduledAt: "desc" },
    select: {
      id: true,
      code: true,
      type: true,
      status: true,
      scheduledAt: true,
      notes: true,
      internalNotes: true,
      saleOrderId: true,
      customOrderId: true,
      rentalOrderId: true,
      alterationOrderId: true,
      createdAt: true,
      customer: {
        select: { id: true, nombres: true, apellidos: true, celular: true },
      },
    },
  });

  return appointments.map((appointment) => {
    const linkedOrder = resolveLinkedOrder({
      saleOrderId: appointment.saleOrderId,
      customOrderId: appointment.customOrderId,
      rentalOrderId: appointment.rentalOrderId,
      alterationOrderId: appointment.alterationOrderId,
    });

    return {
      id: appointment.id,
      code: appointment.code,
      type: appointment.type,
      status: appointment.status,
      scheduledAt: appointment.scheduledAt,
      notes: appointment.notes,
      internalNotes: appointment.internalNotes,
      createdAt: appointment.createdAt,
      customerId: appointment.customer.id,
      customerName: fullName(appointment.customer),
      customerCelular: appointment.customer.celular,
      linkedOrderId: linkedOrder?.id ?? null,
      linkedOrderType: linkedOrder?.type ?? null,
    };
  });
}

export async function getAdminAppointmentDetail(id: string) {
  if (!isUuidLike(id)) {
    return null;
  }

  if (!id) {
    return null;
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    select: {
      id: true,
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
      saleOrderId: true,
      customOrderId: true,
      rentalOrderId: true,
      alterationOrderId: true,
      customer: {
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          email: true,
          celular: true,
          dni: true,
        },
      },
      saleOrder: {
        select: { code: true, status: true },
      },
      customOrder: {
        select: { code: true, status: true },
      },
      rentalOrder: {
        select: { code: true, status: true },
      },
      alterationOrder: {
        select: { code: true, status: true },
      },
      history: {
        orderBy: { changedAt: "desc" },
        select: {
          id: true,
          status: true,
          note: true,
          changedAt: true,
          changedBy: {
            select: {
              nombres: true,
              apellidos: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!appointment) {
    return null;
  }

  const linkedOrder = resolveLinkedOrder({
    saleOrderId: appointment.saleOrderId,
    customOrderId: appointment.customOrderId,
    rentalOrderId: appointment.rentalOrderId,
    alterationOrderId: appointment.alterationOrderId,
    saleOrder: appointment.saleOrder,
    customOrder: appointment.customOrder,
    rentalOrder: appointment.rentalOrder,
    alterationOrder: appointment.alterationOrder,
  });

  return {
    id: appointment.id,
    code: appointment.code,
    type: appointment.type,
    status: appointment.status,
    scheduledAt: appointment.scheduledAt,
    estimatedEndAt: appointment.estimatedEndAt,
    rescheduleDeadlineAt: appointment.rescheduleDeadlineAt,
    cancelDeadlineAt: appointment.cancelDeadlineAt,
    confirmedAt: appointment.confirmedAt,
    cancelledAt: appointment.cancelledAt,
    attendedAt: appointment.attendedAt,
    noShowAt: appointment.noShowAt,
    reminder24hSentAt: appointment.reminder24hSentAt,
    notes: appointment.notes,
    internalNotes: appointment.internalNotes,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
    customer: {
      id: appointment.customer.id,
      fullName: fullName(appointment.customer),
      email: appointment.customer.email,
      celular: appointment.customer.celular,
      dni: appointment.customer.dni,
    },
    linkedOrder,
    history: appointment.history.map((entry) => ({
      id: entry.id,
      status: entry.status,
      note: entry.note,
      changedAt: entry.changedAt,
      changedByName: entry.changedBy ? fullName(entry.changedBy) : null,
      changedByEmail: entry.changedBy?.email ?? null,
    })),
  };
}

/* ------------------------------------------------------------------ */
/*  Business hours                                                     */
/* ------------------------------------------------------------------ */

export async function getAdminBusinessHoursData() {
  const hours = await prisma.businessHour.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const existing = hours.find((hour) => hour.dayOfWeek === dayOfWeek);

    return {
      dayOfWeek,
      dayLabel: DAY_LABELS[dayOfWeek],
      openTime: existing?.openTime ?? null,
      closeTime: existing?.closeTime ?? null,
      isClosed: existing?.isClosed ?? true,
      note: existing?.note ?? null,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Special schedules                                                  */
/* ------------------------------------------------------------------ */

export async function getAdminSpecialSchedulesData() {
  const schedules = await prisma.specialSchedule.findMany({
    take: 30,
    orderBy: { date: "desc" },
  });

  return schedules.map((schedule) => ({
    id: schedule.id,
    date: schedule.date,
    openTime: schedule.openTime,
    closeTime: schedule.closeTime,
    isClosed: schedule.isClosed,
    note: schedule.note,
  }));
}
