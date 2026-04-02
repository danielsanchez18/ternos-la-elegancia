"use client";

import { useMemo, useState } from "react";
import { Plus, ScissorsLineDashed, Search, Filter, Clock, CheckCircle2, User, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import AdminCustomOrderActions from "@/components/admin/AdminCustomOrderActions";
import { formatMediumDate, formatStatusLabel } from "@/components/admin/orders/custom-order-shared";
import {
  customOrderStatusChipClasses,
  getCustomOrderItemCount,
  getCustomOrderPartsCount,
} from "@/components/admin/orders/custom-order-list";
import { AdminStatCard, AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";

export default function AdminCustomOrderListLayout({
  orders = [],
}: {
  orders?: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.apellidos.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const inWorkshop = orders.filter(o => ["EN_CONFECCION", "EN_PRUEBA"].includes(o.status)).length;
    const ready = orders.filter(o => o.status === "LISTO").length;
    const pending = orders.filter(o => o.status === "PENDIENTE_RESERVA").length;

    return { total, inWorkshop, ready, pending };
  }, [orders]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard title="Total Pedidos" value={stats.total} detail="Histórico de confecciones" />
        <AdminStatCard title="En Taller" value={stats.inWorkshop} detail="En proceso o prueba" />
        <AdminStatCard title="Listos p/ Entrega" value={stats.ready} detail="Esperando al cliente" />
        <AdminStatCard title="Pendientes" value={stats.pending} detail="Falta reserva o detalle" />
      </div>

      <Panel
        eyebrow="Maestro"
        title="Pedidos Personalizados"
        action={
          <Link
            href="/admin/ordenes/personalizadas/nueva"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400"
          >
            <Plus className="size-4" />
            Nueva Orden
          </Link>
        }
      >
        <div className="flex flex-col gap-4 border-b border-white/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Buscar por código u cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-4 text-sm text-stone-200 outline-none transition focus:border-emerald-500/50"
            />
          </div>

          <div className="relative group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-xl border border-white/10 bg-black/40 py-2.5 pl-4 pr-10 text-sm text-stone-300 outline-none focus:border-emerald-500/50 transition-all font-bold uppercase tracking-widest text-[10px]"
            >
              <option value="all">Siltro: Todos los estados</option>
              <option value="PENDIENTE_RESERVA">Pendiente Reserva</option>
              <option value="EN_CONFECCION">En Confección</option>
              <option value="EN_PRUEBA">En Prueba</option>
              <option value="LISTO">Listo p/ Entrega</option>
              <option value="ENTREGADO">Entregado</option>
            </select>
            <Filter className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-500" />
          </div>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-stone-600 font-bold border-b border-white/8">
              <tr>
                <th className="px-3 py-3 font-medium">Orden / Fechas</th>
                <th className="px-3 py-3 font-medium">Cliente</th>
                <th className="px-3 py-3 font-medium text-center">Detalle</th>
                <th className="px-3 py-3 font-medium text-center">Estado</th>
                <th className="px-3 py-3 font-medium text-right">Total</th>
                <th className="px-3 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-20 text-center text-stone-600 italic">
                    {orders.length === 0 ? "No hay pedidos registrados comercialmente." : "No se hallaron coincidencias con los filtros."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemCount = getCustomOrderItemCount(order);
                  const partsCount = getCustomOrderPartsCount(order);

                  return (
                    <tr key={order.id} className="group hover:bg-white/2 transition-colors">
                      <td className="px-3 py-5">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-white/5 p-2 transition group-hover:bg-emerald-500/10">
                            <FileText className="size-4 text-stone-400 group-hover:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-white leading-none">{order.code}</p>
                            <div className="mt-2 space-y-0.5">
                              <p className="text-[10px] text-stone-500 uppercase font-medium">Reg: {formatMediumDate(order.createdAt)}</p>
                              {order.promisedDeliveryAt && (
                                <p className="text-[10px] text-amber-400/60 uppercase font-bold tracking-tighter">Entrega: {formatMediumDate(order.promisedDeliveryAt)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-5">
                        <div className="flex items-center gap-2">
                          <User className="size-3 text-stone-600" />
                          <p className="text-sm font-bold text-stone-200">{order.customer.nombres} {order.customer.apellidos}</p>
                        </div>
                        {order.requiresMeasurement && (
                          <span className="mt-1.5 inline-block rounded-md bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight text-rose-400 border border-rose-500/20">
                            PENDIENTE MEDIDAS
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-5 text-center">
                        <p className="text-sm font-bold text-stone-300">{itemCount} Itm</p>
                        <p className="text-[10px] text-stone-600 font-medium uppercase mt-0.5 tracking-tighter">({partsCount} prendas)</p>
                      </td>
                      <td className="px-3 py-5 text-center">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${customOrderStatusChipClasses(order.status)}`}>
                          {formatStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-3 py-5 text-right font-mono font-bold text-emerald-400">
                        S/ {Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-3 py-5 text-right">
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <AdminCustomOrderActions order={order} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
