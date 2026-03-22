"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import type { AdminFabricActionData } from "./AdminFabricActions";

export default function AdminEditFabricModal({
  fabric,
  onClose,
}: {
  fabric: AdminFabricActionData;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    nombre: fabric.nombre,
    color: fabric.color || "",
    supplier: fabric.supplier || "",
    composition: fabric.composition || "",
    pattern: fabric.pattern || "",
    minMeters: Number(fabric.minMeters),
    costPerMeter: Number(fabric.costPerMeter) || 0,
    pricePerMeter: Number(fabric.pricePerMeter) || 0,
  });

  const updateField = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    startTransition(async () => {
      try {
        const res = await fetch(`/api/fabrics/${fabric.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            nombre: form.nombre.trim(),
            color: form.color.trim() || null,
            supplier: form.supplier.trim() || null,
            composition: form.composition.trim() || null,
            pattern: form.pattern.trim() || null,
            minMeters: form.minMeters,
            costPerMeter: form.costPerMeter || null,
            pricePerMeter: form.pricePerMeter || null,
          }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          setErrorMsg(payload?.error?.message ?? "Error actualizando tela");
          return;
        }

        router.refresh();
        onClose();
      } catch (err) {
        setErrorMsg("Error de red");
      }
    });
  };

  const inputClasses =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none transition focus:border-emerald-500/50";
  const labelClasses = "block text-xs font-medium text-stone-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm text-start">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e0e0e] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-white/5 p-6 md:p-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Edición
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Editar Tela</h2>
            <p className="mt-1 text-sm text-stone-400">{fabric.code}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto min-h-0 relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 sm:col-span-2">
                <span className={labelClasses}>Nombre de tela *</span>
                <input
                  required
                  type="text"
                  value={form.nombre}
                  onChange={(e) => updateField("nombre", e.target.value)}
                  className={inputClasses}
                />
              </label>

              <label className="space-y-1">
                <span className={labelClasses}>Color</span>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => updateField("color", e.target.value)}
                  className={inputClasses}
                />
              </label>

              <label className="space-y-1">
                <span className={labelClasses}>Composición</span>
                <input
                  type="text"
                  value={form.composition}
                  onChange={(e) => updateField("composition", e.target.value)}
                  className={inputClasses}
                />
              </label>

              <label className="space-y-1">
                <span className={labelClasses}>Patrón</span>
                <input
                  type="text"
                  value={form.pattern}
                  onChange={(e) => updateField("pattern", e.target.value)}
                  className={inputClasses}
                />
              </label>

              <label className="space-y-1">
                <span className={labelClasses}>Proveedor</span>
                <input
                  type="text"
                  value={form.supplier}
                  onChange={(e) => updateField("supplier", e.target.value)}
                  className={inputClasses}
                />
              </label>
            </div>

            <hr className="border-white/5 my-4" />

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-1">
                <span className={labelClasses}>Stock Mínimo</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.minMeters}
                  onChange={(e) => updateField("minMeters", Number(e.target.value))}
                  className={inputClasses}
                />
              </label>

              <label className="space-y-1">
                <span className={labelClasses}>Costo/m</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.costPerMeter}
                  onChange={(e) => updateField("costPerMeter", Number(e.target.value))}
                  className={inputClasses}
                />
              </label>

              <label className="space-y-1">
                <span className={labelClasses}>Precio/m</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.pricePerMeter}
                  onChange={(e) => updateField("pricePerMeter", Number(e.target.value))}
                  className={inputClasses}
                />
              </label>
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">
                {errorMsg}
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-stone-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-stone-200 disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
