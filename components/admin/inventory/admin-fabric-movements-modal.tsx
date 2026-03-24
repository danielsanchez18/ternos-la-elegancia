"use client";

import { ArrowDownRight, ArrowRightLeft, ArrowUpRight, X } from "lucide-react";

import { useFabricMovementsModalController } from "@/components/admin/inventory/fabric-movements-modal.controller";
import type { AdminFabricActionData, FabricMovementType } from "@/components/admin/inventory/types";

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function isPositiveMovement(type: FabricMovementType) {
  return type === "INGRESO" || type === "AJUSTE";
}

function resolveMovementIcon(type: FabricMovementType) {
  if (type === "INGRESO") {
    return ArrowDownRight;
  }

  if (type === "SALIDA") {
    return ArrowUpRight;
  }

  return ArrowRightLeft;
}

export default function AdminFabricMovementsModal({
  fabric,
  onClose,
}: {
  fabric: AdminFabricActionData;
  onClose: () => void;
}) {
  const {
    movements,
    isLoading,
    type,
    setType,
    quantity,
    setQuantity,
    note,
    setNote,
    isPending,
    errorMsg,
    handleAddMovement,
  } = useFabricMovementsModalController(fabric.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e0e0e] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-white/5 p-6 md:p-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Inventario
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              Historial de movimientos
            </h2>
            <p className="mt-1 text-sm text-stone-400">
              {fabric.code} - {fabric.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto grid gap-6 md:grid-cols-2 flex-grow min-h-0">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-300">Movimientos recientes</h3>
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center text-sm text-stone-500 py-6">Cargando...</div>
              ) : movements.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-stone-500">
                  No hay movimientos registrados.
                </div>
              ) : (
                movements.map((movement) => {
                  const positive = isPositiveMovement(movement.type);
                  const Icon = resolveMovementIcon(movement.type);

                  return (
                    <article
                      key={movement.id}
                      className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-full p-2 ${
                            positive
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{movement.type}</p>
                          <p className="text-xs text-stone-500">{movement.note || "Sin nota"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            positive ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {positive ? "+" : "-"}
                          {Number(movement.quantity)}m
                        </p>
                        <p className="text-[10px] text-stone-500">
                          {dateFormatter.format(new Date(movement.happenedAt))}
                        </p>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 h-fit">
            <h3 className="text-sm font-medium text-stone-300 mb-4">Registrar Movimiento</h3>
            <form onSubmit={handleAddMovement} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-400">Tipo</span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as FabricMovementType)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="INGRESO">INGRESO</option>
                  <option value="SALIDA">SALIDA</option>
                  <option value="MERMA">MERMA</option>
                  <option value="AJUSTE">AJUSTE</option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-400">Metros</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantity || ""}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none"
                  required
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-400">Nota (Opcional)</span>
                <input
                  type="text"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Ej: Nuevo rollo recibido"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none"
                />
              </label>

              {errorMsg && (
                <div className="rounded-lg bg-rose-500/10 p-2 text-xs text-rose-400 border border-rose-500/20">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-stone-200 disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Registrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
