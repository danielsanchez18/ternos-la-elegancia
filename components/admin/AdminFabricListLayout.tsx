"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Scissors } from "lucide-react";
import AdminCreateFabricForm from "@/components/admin/AdminCreateFabricForm";
import AdminFabricActions from "@/components/admin/AdminFabricActions";

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

function statusChipClasses(isPositive: boolean) {
  return isPositive
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
    : "border-stone-500/20 bg-stone-500/10 text-stone-300";
}

export type FabricListItem = {
  id: number;
  code: string;
  nombre: string;
  color: string | null;
  composition: string | null;
  metersInStock: any; // Prisma Decimal
  minMeters: any;
  active: boolean;
  updatedAt: Date | string;
  _count: { movements: number; customParts: number };
};

export default function AdminFabricListLayout({
  fabrics,
}: {
  fabrics: FabricListItem[];
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="flex flex-col 2xl:flex-row gap-4 items-start relative w-full overflow-hidden">
      {/* Form Panel (Animated) */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0, x: -50 }}
            animate={{ opacity: 1, width: "380px", x: 0 }}
            exit={{ opacity: 0, width: 0, x: -50 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="flex-shrink-0 w-full sm:w-[380px]"
          >
            <div className="w-full sm:w-[380px]">
              <AdminCreateFabricForm onClose={() => setIsFormOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Panel (Animated) */}
      <motion.div
        layout
        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
        className="flex-grow w-full 2xl:w-auto min-w-0"
      >
        <div className="rounded-[1.75rem] border border-white/8 bg-[#0e0e0e] flex flex-col min-w-0">
          <div className="flex items-center justify-between border-b border-white/5 p-6 md:px-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                Almacén
              </p>
              <h3 className="mt-1 text-xl font-semibold text-white">
                Catálogo de Telas
              </h3>
            </div>

            {!isFormOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-white/10 hover:text-emerald-100"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">Añadir Tela</span>
              </motion.button>
            )}
          </div>

          <div className="p-6 md:px-8">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-stone-500">
                  <tr className="border-b border-white/8">
                    <th className="px-4 py-3 font-medium">Tela</th>
                    <th className="px-4 py-3 font-medium">Composición/Color</th>
                    <th className="px-4 py-3 font-medium">Stock (m)</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {fabrics.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-500">
                        No hay telas registradas
                      </td>
                    </tr>
                  ) : (
                    fabrics.map((fabric) => {
                      const stockValue = Number(fabric.metersInStock);
                      const minStock = Number(fabric.minMeters);
                      const isLowStock = stockValue <= minStock && stockValue > 0;
                      const isOutOfStock = stockValue <= 0;

                      return (
                        <tr key={fabric.id} className="border-b border-white/6 align-top">
                          <td className="px-4 py-4">
                            <p className="font-medium text-white">{fabric.code}</p>
                            <p className="mt-1 text-stone-400">{fabric.nombre}</p>
                          </td>
                          <td className="px-4 py-4 text-stone-300">
                            <p>{fabric.composition || "Sin composición"}</p>
                            <p className="mt-1 text-stone-500">{fabric.color || "Sin color"}</p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold text-lg ${
                                  isOutOfStock
                                    ? "text-rose-400"
                                    : isLowStock
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {stockValue.toFixed(1)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-stone-500">
                              Mínimo: {minStock.toFixed(1)}m
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] ${statusChipClasses(
                                fabric.active
                              )}`}
                            >
                              {fabric.active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <AdminFabricActions fabric={fabric as any} />
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
