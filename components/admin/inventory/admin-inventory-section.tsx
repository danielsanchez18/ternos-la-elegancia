"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  History,
  Scissors,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { AdminStatCard, AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";
import { formatDate } from "@/components/admin/inventory/fabric-formatters";

type InventoryOverview = {
  fabrics: {
    totalFabrics: number;
    activeFabrics: number;
    lowStockFabrics: number;
    outOfStockFabrics: number;
    recentMovements: Array<{
      id: string;
      type: string;
      quantity: any;
      note: string | null;
      happenedAt: string;
      fabric: {
        code: string;
        nombre: string;
      };
    }>;
  };
  rental: {
    total: number;
    available: number;
    rented: number;
    inMaintenance: number;
    availabilityRate: number;
  };
};

export function AdminInventorySection({ isSubroute = false }: { isSubroute?: boolean }) {
  const [data, setData] = useState<InventoryOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const response = await fetch("/api/catalog/inventory-overview", {
          cache: "no-store",
          credentials: "include"
        });
        if (response.ok) {
          const payload = await response.json();
          setData(payload);
        }
      } catch (err) {
        console.error("Error fetching inventory overview:", err);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center animate-pulse">
        <p className="text-sm font-mono text-stone-500 uppercase tracking-widest">
          Sincronizando almacén maestro...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const lowStockTotal = data.fabrics.lowStockFabrics + data.fabrics.outOfStockFabrics;

  return (
    <section className="space-y-8 animate-in fade-in duration-700">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Telas en Catálogo"
          value={data.fabrics.totalFabrics}
          detail="Tipos de tejidos registrados"
        />
        <AdminStatCard
          title="Stock Crítico"
          value={lowStockTotal}
          detail={`${data.fabrics.outOfStockFabrics} agotadas, ${data.fabrics.lowStockFabrics} bajo métrica`}
        // No alert prop in AdminStatCard but we can use colors in detail if needed
        />
        <AdminStatCard
          title="Unidades de Renta"
          value={data.rental.total}
          detail={`${data.rental.available} disponibles para reserva`}
        />
        <AdminStatCard
          title="Disponibilidad Renta"
          value={`${data.rental.availabilityRate.toFixed(0)}%`}
          detail={`${data.rental.rented} piezas actualmente en uso`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <Panel eyebrow="Actividad" title="Últimos Movimientos de Telar">
          <div className="space-y-4">
            {data.fabrics.recentMovements.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/5 rounded-3xl">
                <p className="text-sm text-stone-500 italic">No hay actividad reciente en el almacén de telas.</p>
              </div>
            ) : (
              data.fabrics.recentMovements.map((movement) => {
                const isIngreso = movement.type === "INGRESO";
                const isSalida = movement.type === "SALIDA";

                return (
                  <article
                    key={movement.id}
                    className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/1 p-4 transition hover:bg-white/3"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rounded-full p-2.5 ${isIngreso ? "bg-emerald-500/10 text-emerald-400" :
                        isSalida ? "bg-rose-500/10 text-rose-400" :
                          "bg-amber-500/10 text-amber-400"
                        }`}>
                        {isIngreso ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition">
                          {movement.fabric.code} • {movement.fabric.nombre}
                        </p>
                        <p className="mt-1 text-xs text-stone-500 truncate max-w-[250px]">
                          {movement.note || "Ajuste de inventario manual"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold font-mono ${isIngreso ? "text-emerald-400" : "text-rose-400"
                        }`}>
                        {isIngreso ? "+" : "-"}{Number(movement.quantity).toFixed(1)}m
                      </p>
                      <p className="mt-1 text-[10px] text-stone-600 uppercase tracking-tighter">
                        {formatDate(movement.happenedAt)}
                      </p>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel eyebrow="Alertas" title="Stock Crítico">
            <div className="rounded-3xl border border-amber-500/10 bg-amber-500/5 p-6">
              <div className="flex items-center gap-3 text-amber-300">
                <AlertTriangle className="size-5" />
                <span className="text-sm font-bold uppercase tracking-widest">Atención</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-stone-400">
                Hay <span className="text-white font-bold">{lowStockTotal} telas</span> que requieren reposición inmediata para evitar interrupciones en el taller.
              </p>
              <a href="/admin/inventario/telas" className="mt-6 block w-full rounded-xl bg-amber-500/10 py-3 text-center text-xs font-bold text-amber-300 transition hover:bg-amber-500/20">
                Ver Almacén Crítico
              </a>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}
