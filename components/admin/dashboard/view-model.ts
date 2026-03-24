import type { AdminDashboardMetrics } from "@/lib/admin-api";

import {
  formatCurrency,
  formatDateTime,
  formatEnumLabel,
  formatStatusLabel,
} from "@/components/admin/dashboard/formatters";
import type { AdminDashboardViewModel } from "@/components/admin/dashboard/types";

export function buildAdminDashboardViewModel(
  metrics: AdminDashboardMetrics
): AdminDashboardViewModel {
  return {
    heroCards: [
      {
        title: "Clientes",
        value: metrics.totalCustomers.toLocaleString("es-PE"),
        detail: `+${metrics.newCustomersThisMonth} este mes`,
        icon: "customers",
        href: "/admin/clientes",
      },
      {
        title: "Ordenes activas",
        value: metrics.openOrders.total.toLocaleString("es-PE"),
        detail: `${metrics.openOrders.sale} ventas · ${metrics.openOrders.custom} personalizadas`,
        icon: "orders",
        href: "/admin/ordenes",
      },
      {
        title: "Cobranza 30d",
        value: formatCurrency(metrics.revenue.approvedThirtyDaysAmount),
        detail: `${metrics.revenue.approvedThirtyDaysCount} pagos aprobados`,
        icon: "revenue",
        href: "/admin/comercial/pagos",
      },
      {
        title: "Agenda de hoy",
        value: metrics.todayAppointments.toLocaleString("es-PE"),
        detail: `${metrics.upcomingWeekAppointments} citas en 7 dias`,
        icon: "agenda",
        href: "/admin/citas/agenda",
      },
    ],
    focusMetrics: [
      {
        title: "Cobranza pendiente",
        value: formatCurrency(metrics.revenue.pendingAmount),
        detail: `${metrics.revenue.pendingCount} pagos estan pendientes u observados.`,
      },
      {
        title: "Agenda proxima",
        value: metrics.upcomingWeekAppointments,
        detail: "citas activas previstas dentro de los proximos 7 dias.",
      },
      {
        title: "Comunicaciones en riesgo",
        value: metrics.communications.failuresThirtyDays,
        detail: `fallidas en 30 dias y ${metrics.communications.pendingNotifications} pendientes.`,
      },
    ],
    orderPipeline: [
      { label: "Ventas", value: metrics.openOrders.sale, href: "/admin/ordenes/venta" },
      {
        label: "Personalizadas",
        value: metrics.openOrders.custom,
        href: "/admin/ordenes/personalizadas",
      },
      { label: "Rentas", value: metrics.openOrders.rental, href: "/admin/ordenes/rentas" },
      {
        label: "Alteraciones",
        value: metrics.openOrders.alteration,
        href: "/admin/ordenes/alteraciones",
      },
    ],
    totalOpenOrders: metrics.openOrders.total,
    alertCards: [
      {
        title: "Variantes en minimo",
        value: metrics.inventory.lowStockVariants,
        detail: "Productos con stock por debajo del umbral.",
        href: "/admin/inventario/stock",
      },
      {
        title: "Telas criticas",
        value: metrics.inventory.lowStockFabrics,
        detail: "Material con metraje debajo del minimo.",
        href: "/admin/inventario/telas",
      },
      {
        title: "Unidades ocupadas",
        value: metrics.inventory.busyRentalUnits,
        detail: `${metrics.inventory.maintenanceRentalUnits} en mantenimiento o danadas`,
        href: "/admin/inventario/unidades-renta",
      },
      {
        title: "Cobros pendientes",
        value: metrics.revenue.pendingCount,
        detail: formatCurrency(metrics.revenue.pendingAmount),
        href: "/admin/comercial/pagos",
      },
      {
        title: "Fallas de notificacion",
        value: metrics.communications.failuresThirtyDays,
        detail: `${metrics.communications.pendingNotifications} pendientes por enviar`,
        href: "/admin/notificaciones/bandeja",
      },
      {
        title: "No show del mes",
        value: metrics.noShowThisMonth,
        detail: "Clientes que no asistieron a su cita.",
        href: "/admin/citas/agenda",
      },
    ],
    recentAppointments: metrics.recentAppointments.map((appointment) => ({
      id: appointment.id,
      customerName: appointment.customerName,
      typeLabel: formatEnumLabel(appointment.type),
      code: appointment.code,
      scheduledAtLabel: formatDateTime(appointment.scheduledAt),
      statusLabel: formatStatusLabel(appointment.status),
    })),
    recentPayments: metrics.recentPayments.map((payment) => ({
      id: payment.id,
      customerName: payment.customerName,
      methodLabel: formatEnumLabel(payment.method),
      paidAtLabel: formatDateTime(payment.paidAt),
      amountLabel: formatCurrency(payment.amount),
      statusLabel: formatStatusLabel(payment.status),
    })),
    executiveSummary: {
      operational: `Hoy tienes ${metrics.todayAppointments} citas activas y ${metrics.openOrders.total} ordenes en proceso entre venta, confeccion, renta y alteraciones.`,
      liquidity: `Se aprobaron ${metrics.revenue.approvedThirtyDaysCount} pagos en 30 dias, mientras ${metrics.revenue.pendingCount} siguen pendientes u observados.`,
      serviceHealth: `Hay ${metrics.communications.failuresThirtyDays} notificaciones fallidas, ${metrics.noShowThisMonth} no show este mes y ${metrics.inventory.lowStockVariants + metrics.inventory.lowStockFabrics} alertas de inventario prioritarias.`,
    },
  };
}
