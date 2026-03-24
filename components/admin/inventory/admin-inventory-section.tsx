import Link from "next/link";
import {
  AlertTriangle,
  FolderKanban,
  Scissors,
} from "lucide-react";

import { getAdminFabricsOverviewData } from "@/lib/admin-inventory";

import { fabricNumberFormatter, formatDate } from "@/components/admin/inventory/fabric-formatters";
import { InventorySectionLinks, panel, statCard } from "@/components/admin/inventory/inventory-ui";

export async function AdminInventorySection() {
  const data = await getAdminFabricsOverviewData();

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {statCard({
          title: "Total de telas",
          value: fabricNumberFormatter.format(data.totalFabrics),
          detail: "Tipos de telas registradas en almacén.",
          icon: Scissors,
        })}
        {statCard({
          title: "Telas activas",
          value: fabricNumberFormatter.format(data.activeFabrics),
          detail: "Telas habilitadas para confecciones.",
        })}
        {statCard({
          title: "Stock normal",
          value: fabricNumberFormatter.format(
            data.activeFabrics - data.lowStockFabrics - data.outOfStockFabrics
          ),
          detail: "Telas con stock suficiente.",
        })}
        {statCard({
          title: "Requieren compra",
          value: fabricNumberFormatter.format(
            data.lowStockFabrics + data.outOfStockFabrics
          ),
          detail: `${data.lowStockFabrics} bajo métrica, ${data.outOfStockFabrics} agotadas.`,
          icon: AlertTriangle,
          alert: data.lowStockFabrics > 0 || data.outOfStockFabrics > 0,
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3">
              <FolderKanban
                className="size-5 text-emerald-200"
                strokeWidth={1.7}
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Flujos del módulo
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Accesos rápidos
              </h2>
            </div>
          </div>

          <div className="mt-6">
            <InventorySectionLinks />
          </div>
        </div>

        {panel({
          eyebrow: "Actividad",
          title: "Últimos movimientos",
          action: (
            <Link
              href="/admin/inventario/telas"
              className="text-sm text-emerald-200 transition hover:text-emerald-100"
            >
              Ver almacén
            </Link>
          ),
          children: (
            <div className="space-y-3">
              {data.recentMovements.length ? (
                data.recentMovements.map((movement) => {
                  const movementType = String(movement.type);

                  return (
                  <article
                    key={movement.id}
                    className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {movement.fabric.code} - {movement.fabric.nombre}
                      </p>
                      <p className="mt-1 text-xs text-stone-400">
                        {movement.note || "Sin nota"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          movementType === "INGRESO"
                            ? "text-emerald-400"
                            : movementType === "SALIDA"
                              ? "text-rose-400"
                              : "text-amber-400"
                        }`}
                      >
                        {movementType === "INGRESO" ? "+" : ""}
                        {Number(movement.quantity)}m
                      </p>
                      <p className="mt-1 text-[10px] text-stone-500">
                        {formatDate(movement.happenedAt)}
                      </p>
                    </div>
                  </article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
                  No hay movimientos de inventario recientes.
                </div>
              )}
            </div>
          ),
        })}
      </div>
    </section>
  );
}
