"use client";

import { useState } from "react";
import { Plus, ScissorsLineDashed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import AdminCustomOrderActions from "@/components/admin/AdminCustomOrderActions";

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
});

function parseDateValue(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: Date | string | null | undefined): string {
  const parsed = parseDateValue(value);
  return parsed ? dateFormatter.format(parsed) : "--";
}

function statusChipClasses(status: string) {
  switch (status) {
    case "PENDIENTE_RESERVA":
      return "border-stone-500/20 bg-stone-500/10 text-stone-300";
    case "MEDIDAS_TOMADAS":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";
    case "EN_CONFECCION":
    case "EN_PRUEBA":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    case "LISTO":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "ENTREGADO":
      return "border-purple-400/20 bg-purple-400/10 text-purple-300";
    case "CANCELADO":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    default:
      return "border-white/10 bg-white/5 text-stone-300";
  }
}

export default function AdminCustomOrderListLayout({
  orders,
}: {
  orders: any[]; // we'll use actual typings based on prisma return later
}) {
  return (
    <div className="flex flex-col relative w-full overflow-hidden">
      <motion.div
        layout
        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
        className="flex-grow w-full min-w-0"
      >
        <div className="rounded-[1.75rem] border border-white/8 bg-[#0e0e0e] flex flex-col min-w-0 pb-[10rem]">
          <div className="flex items-center justify-between border-b border-white/5 p-6 md:px-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Operaciones
              </p>
              <h3 className="mt-1 text-xl font-semibold text-white">
                Pedidos a Medida
              </h3>
            </div>

            <Link
              href="/admin/ordenes/personalizadas/nueva"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-white/10 hover:text-emerald-100"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Nueva Orden</span>
            </Link>
          </div>

          <div className="p-6 md:px-8">
            <div className="overflow-visible min-h-[250px] w-full">
              <table className="min-w-full text-left text-sm">
                <thead className="text-stone-500">
                  <tr className="border-b border-white/8">
                    <th className="px-4 py-3 font-medium">Orden / Fechas</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Detalle</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium text-right">Total</th>
                    <th className="px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-stone-500"
                      >
                        <ScissorsLineDashed className="mx-auto size-8 text-stone-700 mb-3" />
                        No hay pedidos a medida registrados
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const itemCount = order.items.length;
                      const partsCount = order.items.reduce(
                        (acc: number, item: any) => acc + item.parts.length,
                        0
                      );

                      return (
                        <tr
                          key={order.id}
                          className="border-b border-white/6 align-top"
                        >
                          <td className="px-4 py-4">
                            <p className="font-medium text-white">
                              {order.code}
                            </p>
                            <div className="mt-1 flex flex-col gap-1 text-[11px] text-stone-400">
                              <p>Creado: {formatDate(order.createdAt)}</p>
                              {order.promisedDeliveryAt && (
                                <p className="text-amber-200/70">
                                  Entrega: {formatDate(order.promisedDeliveryAt)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium text-stone-300">
                              {order.customer.nombres} {order.customer.apellidos}
                            </p>
                            {order.requiresMeasurement && (
                              <span className="mt-2 inline-block rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-rose-300">
                                FALTA MEDIDAS
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-stone-400 text-xs">
                            <p>
                              {itemCount} item{itemCount !== 1 ? "s" : ""}
                            </p>
                            <p className="mt-0.5 text-stone-500">
                              ({partsCount} prendas a confeccionar)
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] font-medium ${statusChipClasses(
                                order.status
                              )}`}
                            >
                              {order.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <p className="font-medium text-emerald-300">
                              S/ {Number(order.total).toFixed(2)}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <AdminCustomOrderActions order={order} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
