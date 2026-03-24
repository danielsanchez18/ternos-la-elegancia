import {
  AlterationOrderStatus,
  AppointmentStatus,
  NotificationStatus,
  PaymentStatus,
  RentalOrderStatus,
  RentalUnitStatus,
  SaleOrderStatus,
  CustomOrderStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (
    value &&
    typeof value === "object" &&
    "toNumber" in value &&
    typeof value.toNumber === "function"
  ) {
    return value.toNumber();
  }

  return Number(value ?? 0);
}

function buildCustomerName(input: { nombres: string; apellidos: string | null }) {
  return `${input.nombres} ${input.apellidos ?? ""}`.trim();
}

type RecentAppointmentSummary = {
  id: number;
  code: string;
  type: string;
  status: string;
  scheduledAt: Date;
  customer: {
    nombres: string;
    apellidos: string | null;
  };
};

type RecentPaymentSummary = {
  id: number;
  amount: unknown;
  status: string;
  method: string;
  paidAt: Date;
  customer: {
    nombres: string;
    apellidos: string | null;
  };
};

function mapRecentAppointments(appointments: RecentAppointmentSummary[]) {
  return appointments.map((appointment) => ({
    id: appointment.id,
    code: appointment.code,
    type: appointment.type,
    status: appointment.status,
    scheduledAt: appointment.scheduledAt,
    customerName: buildCustomerName(appointment.customer),
  }));
}

function mapRecentPayments(payments: RecentPaymentSummary[]) {
  return payments.map((payment) => ({
    id: payment.id,
    amount: toNumber(payment.amount),
    status: payment.status,
    method: payment.method,
    paidAt: payment.paidAt,
    customerName: buildCustomerName(payment.customer),
  }));
}

const saleOpenStatuses = [
  SaleOrderStatus.PENDIENTE_PAGO,
  SaleOrderStatus.PAGADO,
  SaleOrderStatus.EN_PREPARACION,
  SaleOrderStatus.LISTO_PARA_RECOJO,
];

const customOpenStatuses = [
  CustomOrderStatus.PENDIENTE_RESERVA,
  CustomOrderStatus.RESERVA_CONFIRMADA,
  CustomOrderStatus.MEDIDAS_TOMADAS,
  CustomOrderStatus.EN_CONFECCION,
  CustomOrderStatus.EN_PRUEBA,
  CustomOrderStatus.LISTO,
];

const rentalOpenStatuses = [
  RentalOrderStatus.RESERVADO,
  RentalOrderStatus.ENTREGADO,
  RentalOrderStatus.ATRASADO,
];

const alterationOpenStatuses = [
  AlterationOrderStatus.RECIBIDO,
  AlterationOrderStatus.EN_EVALUACION,
  AlterationOrderStatus.EN_PROCESO,
  AlterationOrderStatus.LISTO,
];

export async function getAdminDashboardMetrics() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const nextSevenDays = addDays(todayEnd, 7);
  const thirtyDaysAgo = addDays(todayStart, -30);

  const [
    totalCustomers,
    newCustomersThisMonth,
    todayAppointments,
    upcomingWeekAppointments,
    noShowThisMonth,
    openSaleOrders,
    openCustomOrders,
    openRentalOrders,
    openAlterationOrders,
    approvedPaymentsThirtyDays,
    pendingPayments,
    stockVariantLevels,
    fabricLevels,
    busyRentalUnits,
    maintenanceRentalUnits,
    notificationFailuresThirtyDays,
    pendingNotifications,
    recentAppointments,
    recentPayments,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
    }),
    prisma.appointment.count({
      where: {
        scheduledAt: {
          gte: todayStart,
          lt: todayEnd,
        },
        status: {
          in: [
            AppointmentStatus.PENDIENTE,
            AppointmentStatus.CONFIRMADA,
            AppointmentStatus.REPROGRAMADA,
          ],
        },
      },
    }),
    prisma.appointment.count({
      where: {
        scheduledAt: {
          gte: todayStart,
          lt: nextSevenDays,
        },
        status: {
          in: [
            AppointmentStatus.PENDIENTE,
            AppointmentStatus.CONFIRMADA,
            AppointmentStatus.REPROGRAMADA,
          ],
        },
      },
    }),
    prisma.appointment.count({
      where: {
        noShowAt: {
          gte: monthStart,
        },
      },
    }),
    prisma.saleOrder.count({
      where: {
        status: {
          in: saleOpenStatuses,
        },
      },
    }),
    prisma.customOrder.count({
      where: {
        status: {
          in: customOpenStatuses,
        },
      },
    }),
    prisma.rentalOrder.count({
      where: {
        status: {
          in: rentalOpenStatuses,
        },
      },
    }),
    prisma.alterationOrder.count({
      where: {
        status: {
          in: alterationOpenStatuses,
        },
      },
    }),
    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
      where: {
        status: PaymentStatus.APROBADO,
        paidAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
      where: {
        status: {
          in: [PaymentStatus.PENDIENTE, PaymentStatus.OBSERVADO],
        },
      },
    }),
    prisma.productVariant.findMany({
      where: {
        active: true,
      },
      select: {
        stock: true,
        minStock: true,
      },
    }),
    prisma.fabric.findMany({
      where: {
        active: true,
      },
      select: {
        metersInStock: true,
        minMeters: true,
      },
    }),
    prisma.rentalUnit.count({
      where: {
        status: RentalUnitStatus.ALQUILADO,
      },
    }),
    prisma.rentalUnit.count({
      where: {
        status: {
          in: [RentalUnitStatus.EN_MANTENIMIENTO, RentalUnitStatus.DANADO],
        },
      },
    }),
    prisma.notification.count({
      where: {
        status: NotificationStatus.FALLIDA,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    prisma.notification.count({
      where: {
        status: NotificationStatus.PENDIENTE,
      },
    }),
    prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: todayStart,
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
      take: 5,
      select: {
        id: true,
        code: true,
        type: true,
        status: true,
        scheduledAt: true,
        customer: {
          select: {
            nombres: true,
            apellidos: true,
          },
        },
      },
    }),
    prisma.payment.findMany({
      orderBy: {
        paidAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        amount: true,
        status: true,
        method: true,
        paidAt: true,
        customer: {
          select: {
            nombres: true,
            apellidos: true,
          },
        },
      },
    }),
  ]);

  return {
    totalCustomers,
    newCustomersThisMonth,
    todayAppointments,
    upcomingWeekAppointments,
    noShowThisMonth,
    openOrders: {
      sale: openSaleOrders,
      custom: openCustomOrders,
      rental: openRentalOrders,
      alteration: openAlterationOrders,
      total:
        openSaleOrders +
        openCustomOrders +
        openRentalOrders +
        openAlterationOrders,
    },
    revenue: {
      approvedThirtyDaysAmount: toNumber(approvedPaymentsThirtyDays._sum.amount),
      approvedThirtyDaysCount: approvedPaymentsThirtyDays._count._all,
      pendingAmount: toNumber(pendingPayments._sum.amount),
      pendingCount: pendingPayments._count._all,
    },
    inventory: {
      lowStockVariants: stockVariantLevels.filter(
        (variant) => variant.stock <= variant.minStock
      ).length,
      lowStockFabrics: fabricLevels.filter(
        (fabric) => toNumber(fabric.metersInStock) <= toNumber(fabric.minMeters)
      ).length,
      busyRentalUnits,
      maintenanceRentalUnits,
    },
    communications: {
      failuresThirtyDays: notificationFailuresThirtyDays,
      pendingNotifications,
    },
    recentAppointments: mapRecentAppointments(recentAppointments),
    recentPayments: mapRecentPayments(recentPayments),
    generatedAt: now,
  };
}
