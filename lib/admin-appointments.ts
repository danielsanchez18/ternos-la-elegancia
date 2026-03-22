import { AppointmentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

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

const DAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
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
    recentAppointments: recentAppointments.map((a) => ({
      id: a.id,
      code: a.code,
      type: a.type,
      status: a.status,
      scheduledAt: a.scheduledAt,
      notes: a.notes,
      customerId: a.customer.id,
      customerName: fullName(a.customer),
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

  return appointments.map((a) => ({
    id: a.id,
    code: a.code,
    type: a.type,
    status: a.status,
    scheduledAt: a.scheduledAt,
    notes: a.notes,
    internalNotes: a.internalNotes,
    createdAt: a.createdAt,
    customerId: a.customer.id,
    customerName: fullName(a.customer),
    customerCelular: a.customer.celular,
    linkedOrderId:
      a.saleOrderId ?? a.customOrderId ?? a.rentalOrderId ?? a.alterationOrderId ?? null,
    linkedOrderType: a.saleOrderId
      ? "venta"
      : a.customOrderId
        ? "confección"
        : a.rentalOrderId
          ? "alquiler"
          : a.alterationOrderId
            ? "arreglo"
            : null,
  }));
}

/* ------------------------------------------------------------------ */
/*  Business hours                                                     */
/* ------------------------------------------------------------------ */

export async function getAdminBusinessHoursData() {
  const hours = await prisma.businessHour.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const existing = hours.find((h) => h.dayOfWeek === dayOfWeek);

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

  return schedules.map((s) => ({
    id: s.id,
    date: s.date,
    openTime: s.openTime,
    closeTime: s.closeTime,
    isClosed: s.isClosed,
    note: s.note,
  }));
}
