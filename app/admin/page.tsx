import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  MessagesSquare,
  Package2,
  ShoppingCart,
  Users,
} from "lucide-react";

import { getAdminDashboardMetricsFromApi } from "@/lib/admin-api";

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "short",
  timeStyle: "short",
});

function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase();
}

export default async function AdminPage() {
  const metrics = await getAdminDashboardMetricsFromApi();

  const heroCards = [
    {
      title: "Clientes",
      value: metrics.totalCustomers.toLocaleString("es-PE"),
      detail: `+${metrics.newCustomersThisMonth} este mes`,
      icon: Users,
      href: "/admin/clientes",
    },
    {
      title: "Ordenes activas",
      value: metrics.openOrders.total.toLocaleString("es-PE"),
      detail: `${metrics.openOrders.sale} ventas · ${metrics.openOrders.custom} personalizadas`,
      icon: ShoppingCart,
      href: "/admin/ordenes",
    },
    {
      title: "Cobranza 30d",
      value: currencyFormatter.format(metrics.revenue.approvedThirtyDaysAmount),
      detail: `${metrics.revenue.approvedThirtyDaysCount} pagos aprobados`,
      icon: CreditCard,
      href: "/admin/comercial/pagos",
    },
    {
      title: "Agenda de hoy",
      value: metrics.todayAppointments.toLocaleString("es-PE"),
      detail: `${metrics.upcomingWeekAppointments} citas en 7 dias`,
      icon: CalendarClock,
      href: "/admin/citas/agenda",
    },
  ];

  const orderPipeline = [
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
  ];

  const alertCards = [
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
      detail: currencyFormatter.format(metrics.revenue.pendingAmount),
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
  ];

  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,rgba(14,33,24,0.85),rgba(8,8,8,0.95))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
              Operacion en vivo
            </span>
            <div className="space-y-3">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Supervisa cartera, agenda, inventario y cobranza desde un solo lugar.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
                La home del dashboard ahora prioriza presion operativa real: pipeline
                de ordenes, citas de corto plazo, inventario en riesgo y salud de
                pagos y notificaciones.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {heroCards.map((card) => {
                const Icon = card.icon;

                return (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="rounded-3xl border border-white/8 bg-black/20 p-5 transition hover:bg-black/30"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-stone-200">
                        {card.title}
                      </p>
                      <Icon className="size-4 text-emerald-200" strokeWidth={1.7} />
                    </div>
                    <p className="mt-4 text-3xl font-semibold text-white">
                      {card.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-stone-400">
                      {card.detail}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 p-3">
                <AlertTriangle className="size-5 text-amber-200" strokeWidth={1.7} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                  Atencion inmediata
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  Enfoque operativo
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <p className="text-sm font-medium text-stone-200">Cobranza pendiente</p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {currencyFormatter.format(metrics.revenue.pendingAmount)}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  {metrics.revenue.pendingCount} pagos estan pendientes u observados.
                </p>
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <p className="text-sm font-medium text-stone-200">Agenda proxima</p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {metrics.upcomingWeekAppointments}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  citas activas previstas dentro de los proximos 7 dias.
                </p>
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                <p className="text-sm font-medium text-stone-200">
                  Comunicaciones en riesgo
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {metrics.communications.failuresThirtyDays}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  fallidas en 30 dias y {metrics.communications.pendingNotifications} pendientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Pipeline
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Ordenes en proceso
              </h2>
            </div>
            <span className="rounded-full border border-white/8 px-3 py-1 text-xs text-stone-400">
              {metrics.openOrders.total} activas
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {orderPipeline.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    Seguimiento del flujo operativo
                  </p>
                </div>
                <p className="text-2xl font-semibold text-white">{item.value}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Agenda inmediata
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Proximas citas
              </h2>
            </div>
            <Link
              href="/admin/citas/agenda"
              className="text-sm text-emerald-200 transition hover:text-emerald-100"
            >
              Ver agenda
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {metrics.recentAppointments.length ? (
              metrics.recentAppointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {appointment.customerName}
                      </p>
                      <p className="mt-1 text-sm text-stone-400">
                        {appointment.type.replaceAll("_", " ").toLowerCase()} · {appointment.code}
                      </p>
                    </div>
                    <div className="text-sm text-stone-300">
                      {dateFormatter.format(new Date(appointment.scheduledAt))}
                    </div>
                  </div>
                  <div className="mt-3 inline-flex rounded-full border border-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-400">
                    {statusLabel(appointment.status)}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
                No hay citas proximas registradas.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
          <div className="flex items-center gap-3">
            <Package2 className="size-5 text-amber-200" strokeWidth={1.7} />
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Riesgos de inventario
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                Alertas de stock y alquiler
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {alertCards.map((alert) => (
              <Link
                key={alert.title}
                href={alert.href}
                className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
              >
                <p className="text-sm font-medium text-white">{alert.title}</p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {alert.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-400">
                  {alert.detail}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Caja reciente
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Ultimos pagos registrados
              </h2>
            </div>
            <Link
              href="/admin/comercial/pagos"
              className="text-sm text-emerald-200 transition hover:text-emerald-100"
            >
              Ver pagos
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {metrics.recentPayments.length ? (
              metrics.recentPayments.map((payment) => (
                <article
                  key={payment.id}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {payment.customerName}
                      </p>
                      <p className="mt-1 text-sm text-stone-400">
                        {payment.method.toLowerCase()} · {dateFormatter.format(new Date(payment.paidAt))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">
                        {currencyFormatter.format(payment.amount)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                        {statusLabel(payment.status)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
                Aun no hay pagos registrados.
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
        <div className="flex items-center gap-3">
          <MessagesSquare className="size-5 text-emerald-200" strokeWidth={1.7} />
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Cierre del tablero
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              Resumen ejecutivo del sistema
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <p className="text-sm font-medium text-white">Presion operativa</p>
            <p className="mt-3 text-sm leading-7 text-stone-400">
              Hoy tienes {metrics.todayAppointments} citas activas y {metrics.openOrders.total} ordenes en
              proceso entre venta, confeccion, renta y alteraciones.
            </p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <p className="text-sm font-medium text-white">Liquidez</p>
            <p className="mt-3 text-sm leading-7 text-stone-400">
              Se aprobaron {metrics.revenue.approvedThirtyDaysCount} pagos en 30 dias, mientras{" "}
              {metrics.revenue.pendingCount} siguen pendientes u observados.
            </p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <p className="text-sm font-medium text-white">Salud de servicio</p>
            <p className="mt-3 text-sm leading-7 text-stone-400">
              Hay {metrics.communications.failuresThirtyDays} notificaciones fallidas,
              {` ${metrics.noShowThisMonth} no show este mes`} y{" "}
              {metrics.inventory.lowStockVariants + metrics.inventory.lowStockFabrics} alertas
              de inventario prioritarias.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
