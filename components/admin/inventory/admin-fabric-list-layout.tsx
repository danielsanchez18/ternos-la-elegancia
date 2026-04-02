"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, Filter, Scissors, AlertCircle, CheckCircle2, Package } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AdminCreateFabricForm from "@/components/admin/inventory/admin-create-fabric-form";
import AdminFabricActions from "@/components/admin/inventory/admin-fabric-actions";
import { getFabricStatusChipClasses } from "@/components/admin/inventory/fabric-formatters";
import { getFabricStockStatus } from "@/components/admin/inventory/fabric-stock";
import type { FabricListItem } from "@/components/admin/inventory/types";
import { AdminStatCard, AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";

export type { FabricListItem };

export default function AdminFabricListLayout({
  fabrics,
}: {
  fabrics?: FabricListItem[];
}) {
  const [data, setData] = useState<FabricListItem[]>(fabrics || []);
  const [isLoading, setIsLoading] = useState(!fabrics || fabrics.length === 0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const fetchFabrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/fabrics", {
        cache: "no-store",
        credentials: "include"
      });
      if (response.ok) {
        const payload = await response.json();
        setData(payload);
      }
    } catch (err) {
      console.error("Error fetching fabrics list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!fabrics || fabrics.length === 0) {
      void fetchFabrics();
    } else {
      setData(fabrics);
      setIsLoading(false);
    }
  }, [fabrics]);

  const filteredFabrics = useMemo(() => {
    return data.filter((f) => {
      const matchesSearch =
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.color?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? f.active : !f.active);

      const { isLowStock, isOutOfStock } = getFabricStockStatus(f);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && isLowStock && !isOutOfStock) ||
        (stockFilter === "out" && isOutOfStock) ||
        (stockFilter === "normal" && !isLowStock && !isOutOfStock);

      return matchesSearch && matchesStatus && matchesStock;
    });
  }, [data, searchTerm, statusFilter, stockFilter]);

  const stats = useMemo(() => {
    const totalMeters = data.reduce((acc, f) => acc + Number(f.metersInStock), 0);
    const lowStockCount = data.filter(f => {
      const { isLowStock, isOutOfStock } = getFabricStockStatus(f);
      return isLowStock || isOutOfStock;
    }).length;

    return {
      total: data.length,
      meters: totalMeters.toFixed(1),
      active: data.filter(f => f.active).length,
      critical: lowStockCount
    };
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard title="Telas registradas" value={stats.total} detail="Variedad de tejidos" />
        <AdminStatCard title="Stock Total" value={`${stats.meters}m`} detail="Metraje acumulado en rollos" />
        <AdminStatCard title="Telas Activas" value={stats.active} detail="Disponibles para pedidos" />
        <AdminStatCard title="Reposición" value={stats.critical} detail="Telas con stock bajo o agotado" />
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0, x: -20 }}
              animate={{ opacity: 1, width: "400px", x: 0 }}
              exit={{ opacity: 0, width: 0, x: -20 }}
              className="hidden xl:block shrink-0"
            >
              <AdminCreateFabricForm onClose={() => setIsFormOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 w-full min-w-0 space-y-6">
          <Panel
            eyebrow="Inventario"
            title="Maestro de Telas"
            action={
              !isFormOpen && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400"
                >
                  <Plus className="size-4" />
                  Nueva Tela
                </button>
              )
            }
          >
            <div className="flex flex-col gap-4 border-b border-white/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, código o color..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-4 text-sm text-stone-200 outline-none transition focus:border-emerald-500/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none rounded-xl border border-white/10 bg-black/40 py-2.5 pl-4 pr-10 text-sm text-stone-300 outline-none focus:border-emerald-500/50"
                  >
                    <option value="all">Estado: Todos</option>
                    <option value="active">Solo Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                  <Filter className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-500" />
                </div>

                <div className="relative">
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="appearance-none rounded-xl border border-white/10 bg-black/40 py-2.5 pl-4 pr-10 text-sm text-stone-300 outline-none focus:border-emerald-500/50"
                  >
                    <option value="all">Stock: Todos</option>
                    <option value="normal">Normal</option>
                    <option value="low">Bajo</option>
                    <option value="out">Agotado</option>
                  </select>
                  <Filter className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-500" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="min-w-full text-left text-sm">
                <thead className="text-stone-500 uppercase tracking-widest text-[10px]">
                  <tr className="border-b border-white/8">
                    <th className="px-3 py-3 font-medium">Identificación</th>
                    <th className="px-3 py-3 font-medium">Características</th>
                    <th className="px-3 py-3 font-medium text-center">Disponibilidad (m)</th>
                    <th className="px-3 py-3 font-medium text-center">Estado</th>
                    <th className="px-3 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-20 text-center animate-pulse font-mono text-stone-600 italic tracking-widest uppercase text-[10px]">
                        Sincronizando almacén maestro...
                      </td>
                    </tr>
                  ) : filteredFabrics.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-20 text-center text-stone-500 font-mono italic">
                        No se encontraron telas con los criterios actuales.
                      </td>
                    </tr>
                  ) : (
                    filteredFabrics.map((fabric) => {
                      const { stockValue, minStock, isLowStock, isOutOfStock } = getFabricStockStatus(fabric);

                      return (
                        <tr key={fabric.id} className="group hover:bg-white/2 transition-colors">
                          <td className="px-3 py-5">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-white/5 p-2 transition group-hover:bg-emerald-500/10">
                                <Scissors className="size-4 text-stone-400 group-hover:text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-base font-bold text-white leading-none">{fabric.code}</p>
                                <p className="mt-1.5 text-xs text-stone-500 font-medium uppercase tracking-tighter">{fabric.nombre}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-5">
                            <div className="flex flex-col gap-1 text-xs">
                              <span className="text-stone-300 font-medium">{fabric.composition || "--"}</span>
                              <span className="text-stone-600 text-[10px] uppercase">{fabric.color || "Sin color especificado"}</span>
                            </div>
                          </td>
                          <td className="px-3 py-5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-lg font-mono font-bold ${isOutOfStock ? "text-rose-400" : isLowStock ? "text-amber-400" : "text-emerald-400"
                                }`}>
                                {stockValue.toFixed(1)}
                              </span>
                              <span className="text-[9px] text-stone-600 uppercase tracking-widest">
                                Mín: {minStock.toFixed(1)}m
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-5 text-center">
                            <div className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${fabric.active
                              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                              : "border-white/10 bg-white/5 text-stone-500"
                              }`}>
                              {fabric.active ? "Activo" : "Inactivo"}
                            </div>
                          </td>
                          <td className="px-3 py-5 text-right">
                            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <AdminFabricActions fabric={fabric} />
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

          {isFormOpen && (
            <div className="xl:hidden">
              <AdminCreateFabricForm onClose={() => setIsFormOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
