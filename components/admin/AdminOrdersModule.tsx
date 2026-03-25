/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import {
  ScissorsLineDashed,
  ShoppingBag,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  getAdminCustomOrdersListData,
  getAdminOrdersOverviewData,
} from "@/lib/admin-orders";
import { getAdminSection } from "@/lib/admin-dashboard";
import AdminCustomOrderListLayout from "@/components/admin/AdminCustomOrderListLayout";
import { formatMediumDate, formatStatusLabel, numberFormatter } from "@/components/admin/orders/custom-order-shared";
import {
  getOrdersInWorkshopTotal,
  getOrdersRevenueTotal,
  getOtherOrdersTotal,
  orderSectionIconsBySlug,
} from "@/components/admin/orders/admin-orders-overview";
import AdminRentalOrdersSubroute from "@/components/admin/orders/admin-rental-orders-subroute";
import AdminAlterationOrdersSubroute from "@/components/admin/orders/admin-alteration-orders-subroute";
import AdminAlterationServicesSubroute from "@/components/admin/orders/admin-alteration-services-subroute";

function statCard({
  title,
  value,
  detail,
  icon: Icon,
  alert = false,
}: {
  title: string;
  value: string | number;
  detail: React.ReactNode;
  icon?: React.ElementType;
  alert?: boolean;
}) {
  return (
    <article
      className={`rounded-[2rem] border p-6 ${
        alert
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-white/8 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-[11px] uppercase tracking-[0.3em] ${
            alert ? "text-emerald-400" : "text-stone-500"
          }`}
        >
          {title}
        </p>
        {Icon && (
          <Icon
            className={`size-5 ${alert ? "text-emerald-400" : "text-stone-600"}`}
          />
        )}
      </div>
      <p
        className={`mt-4 text-4xl font-semibold tracking-tight ${
          alert ? "text-emerald-50" : "text-white"
        }`}
      >
        {value}
      </p>
      <div
        className={`mt-3 text-sm leading-6 ${
          alert ? "text-emerald-200" : "text-stone-400"
        }`}
      >
        {detail}
      </div>
    </article>
  );
}

function panel({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <article className="rounded-[2rem] border border-white/8 bg-black/30 p-6 sm:p-8">
      <header className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        </div>
        {action}
      </header>
      <div className="mt-6">{children}</div>
    </article>
  );
}

function sectionLinks() {
  const section = getAdminSection("ordenes");
  if (!section) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {section.subroutes.map((sub) => (
        <Link
          key={sub.slug}
          href={sub.href}
          className="group block rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-2 text-stone-400 group-hover:text-emerald-400 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/10 transition">
              {(() => {
                const Icon = orderSectionIconsBySlug[sub.slug];
                return Icon ? <Icon className="size-4" /> : null;
              })()}
            </div>
            <div>
              <p className="font-medium text-white group-hover:text-emerald-300">
                {sub.label}
              </p>
              <p className="text-xs text-stone-500">{sub.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export async function AdminOrdersSection() {
  const data = await getAdminOrdersOverviewData();

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {statCard({
          title: "A medida",
          value: numberFormatter.format(data.customOrders.total),
          detail: "Órdenes de confección personalizadas.",
          icon: ScissorsLineDashed,
        })}
        {statCard({
          title: "En confección",
          value: numberFormatter.format(data.customOrders.active),
          detail: "En proceso o prueba.",
          icon: Clock,
        })}
        {statCard({
          title: "Listos para entrega",
          value: numberFormatter.format(data.customOrders.ready),
          detail: "A la espera del cliente.",
          icon: CheckCircle2,
          alert: data.customOrders.ready > 0,
        })}
        {statCard({
          title: "Otras operaciones",
          value: numberFormatter.format(getOtherOrdersTotal(data.otherOrders)),
          detail: `${data.otherOrders.sales} ventas, ${data.otherOrders.rentals} alquileres.`,
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3">
              <ShoppingBag
                className="size-5 text-emerald-200"
                strokeWidth={1.7}
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Centro de Operaciones
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Módulos de Órdenes
              </h2>
            </div>
          </div>

          {sectionLinks()}
        </div>

        {panel({
          eyebrow: "Confecciones",
          title: "Últimos pedidos",
          action: (
            <Link
              href="/admin/ordenes/personalizadas"
              className="text-sm text-emerald-200 transition hover:text-emerald-100"
            >
              Ver todos
            </Link>
          ),
          children: (
            <div className="space-y-3">
              {data.customOrders.recent.length ? (
                data.customOrders.recent.map((order: any) => (
                  <article
                    key={order.id}
                    className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {order.code} - {order.customer.nombres}{" "}
                        {order.customer.apellidos}
                      </p>
                      <p className="mt-1 text-xs text-stone-400">
                        Total: S/ {Number(order.total).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-stone-400 border border-white/10 rounded-md px-2 py-0.5 bg-black/50">
                        {formatStatusLabel(order.status)}
                      </p>
                      <p className="mt-2 text-[10px] text-stone-500">
                        {formatMediumDate(order.createdAt)}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
                  No hay órdenes recientes.
                </div>
              )}
            </div>
          ),
        })}
      </div>
    </section>
  );
}

export async function AdminOrdersSubroute({ subroute }: { subroute: string }) {
  if (subroute === "personalizadas") {
    const orders = await getAdminCustomOrdersListData();

    return (
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {statCard({
            title: "Total",
            value: orders.length,
            detail: "Histórico completo de órdenes.",
          })}
          {statCard({
            title: "En taller",
            value: getOrdersInWorkshopTotal(orders),
            detail: "Prendas actualmente en desarrollo.",
          })}
          {statCard({
            title: "Ingresos",
            value: `S/ ${getOrdersRevenueTotal(orders).toFixed(2)}`,
            detail: "Monto total transaccionado.",
          })}
        </div>

        <AdminCustomOrderListLayout orders={orders as any} />
      </section>
    );
  }

  if (subroute === "rentas") {
    return <AdminRentalOrdersSubroute />;
  }

  if (subroute === "alteraciones") {
    return <AdminAlterationOrdersSubroute />;
  }

  if (subroute === "servicios") {
    return <AdminAlterationServicesSubroute />;
  }

  return (
    <div className="rounded-[2rem] border border-dashed border-white/10 p-12 text-center">
      <CheckCircle2 className="mx-auto size-12 text-stone-700" />
      <h3 className="mt-4 text-lg font-medium text-white">Próximamente</h3>
      <p className="mt-2 text-stone-400">
        Esta sección de órdenes ({subroute}) estará disponible pronto.
      </p>
    </div>
  );
}
