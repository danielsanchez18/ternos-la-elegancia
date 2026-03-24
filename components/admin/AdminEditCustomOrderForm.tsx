"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import {
  addItemDraft,
  addPartDraft,
  buildUpdateCustomOrderPayload,
  calculateCustomOrderTotal,
  createEditCustomOrderFormState,
  GARMENT_TYPES,
  mapItemsFromExistingOrder,
  removeItemDraft,
  removePartDraft,
  type Customer,
  type Fabric,
  updateItemDraft,
  updatePartDraft,
} from "@/components/admin/orders/custom-order-form";

export default function AdminEditCustomOrderForm({
  initialOrder,
  customers,
  fabrics,
}: {
  initialOrder: any;
  customers: Customer[];
  fabrics: Fabric[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ 
    isOpen: boolean; 
    type: 'ITEM' | 'PART';
    itemIdx: number; 
    partIdx?: number; 
  } | null>(null);

  const [form, setForm] = useState(() => createEditCustomOrderFormState(initialOrder));

  const [items, setItems] = useState(() => mapItemsFromExistingOrder(initialOrder));

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (index: number, key: string, value: any) => {
    setItems((prev) => updateItemDraft(prev, index, key, value));
  };

  const updatePart = (itemIndex: number, partIndex: number, key: string, value: any) => {
    setItems((prev) => updatePartDraft(prev, itemIndex, partIndex, key, value));
  };

  const addPart = (itemIndex: number) => {
    setItems((prev) => addPartDraft(prev, itemIndex));
  };

  const removePart = (itemIndex: number, partIndex: number) => {
    setItems((prev) => removePartDraft(prev, itemIndex, partIndex));
  };

  const addItem = () => {
    setItems((prev) => addItemDraft(prev));
  };

  const removeItem = (index: number) => {
    setItems((prev) => removeItemDraft(prev, index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (items.length === 0) {
      setErrorMsg("La orden debe tener al menos un ítem.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = buildUpdateCustomOrderPayload(form, items);

        const res = await fetch(`/api/custom-orders/${initialOrder.id}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const resData = await res.json().catch(() => null);
          setErrorMsg(resData?.error || "Error al actualizar orden");
          return;
        }

        router.push(`/admin/ordenes/personalizadas/${initialOrder.id}`);
        router.refresh();
      } catch (err) {
        setErrorMsg("Error de red");
      }
    });
  };

  const totalOrder = calculateCustomOrderTotal(items);

  const inputClasses =
    "w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-stone-500 outline-none transition focus:border-emerald-500/50";
  const labelClasses = "block text-xs font-medium text-stone-400 mb-1";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/ordenes/personalizadas/${initialOrder.id}`}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 hover:bg-white/[0.06] hover:text-white transition"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Editar Orden {initialOrder.code}
            </p>
            <h1 className="text-2xl font-semibold text-white">Editar Pedido</h1>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="space-y-4">
              {items.map((item: any, iIndex: number) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-[#121212] overflow-hidden">
                  <header className="flex items-center justify-between bg-black/40 p-4 border-b border-white/5">
                    <h3 className="font-medium text-white flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-400">
                        {iIndex + 1}
                      </span>
                      Configuración de Ítem
                    </h3>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete({ isOpen: true, type: 'ITEM', itemIdx: iIndex })}
                        className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 transition"
                      >
                        <Trash2 className="size-3.5" />
                        Eliminar Ítem
                      </button>
                    )}
                  </header>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="col-span-2 md:col-span-4">
                        <span className={labelClasses}>Nombre de Venta *</span>
                        <input
                          type="text"
                          required
                          value={item.itemNameSnapshot}
                          onChange={(e) => updateItem(iIndex, "itemNameSnapshot", e.target.value)}
                          className={inputClasses}
                        />
                      </label>
                      <label>
                        <span className={labelClasses}>Cantidad</span>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => updateItem(iIndex, "quantity", Number(e.target.value))}
                          className={inputClasses}
                        />
                      </label>
                      <label>
                        <span className={labelClasses}>Precio Unit. (S/)</span>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          required
                          value={item.unitPrice}
                          onChange={(e) => updateItem(iIndex, "unitPrice", Number(e.target.value))}
                          className={inputClasses}
                        />
                      </label>
                      <label className="col-span-2 text-right self-end pb-2">
                        <span className="text-sm text-stone-500 mr-2">Subtotal:</span>
                        <span className="font-medium text-emerald-400">
                          S/ {(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </label>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-stone-300">Prendas</p>
                        <button
                          type="button"
                          onClick={() => addPart(iIndex)}
                          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          <Plus className="size-3" /> Añadir prenda
                        </button>
                      </div>

                      <div className="space-y-3">
                        {item.parts.map((part: any, pIndex: number) => (
                          <div key={part.id} className="relative rounded-lg border border-white/5 bg-black/40 p-4 pr-12">
                            {item.parts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setConfirmDelete({ isOpen: true, type: 'PART', itemIdx: iIndex, partIdx: pIndex })}
                                className="absolute right-3 top-4 flex flex-col items-center gap-1 group/del shadow-sm hover:scale-105 transition"
                              >
                                <div className="rounded-lg bg-rose-500/20 p-2 text-rose-400 hover:bg-rose-500/30 transition">
                                  <Trash2 className="size-4" />
                                </div>
                                <span className="text-[10px] text-rose-500/60 group-hover/del:text-rose-400 transition uppercase font-bold tracking-tight">Quitar</span>
                              </button>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              <label>
                                <span className={labelClasses}>Etiqueta</span>
                                <input
                                  type="text"
                                  required
                                  value={part.label}
                                  onChange={(e) => updatePart(iIndex, pIndex, "label", e.target.value)}
                                  className={`${inputClasses} bg-transparent border-stone-800`}
                                />
                              </label>
                              <label>
                                <span className={labelClasses}>Tipo</span>
                                <select
                                  value={part.garmentType}
                                  onChange={(e) => updatePart(iIndex, pIndex, "garmentType", e.target.value)}
                                  className={`${inputClasses} bg-transparent border-stone-800`}
                                >
                                  {GARMENT_TYPES.map((t) => (
                                    <option key={t} value={t} className="bg-stone-900">{t.replace(/_/g, " ")}</option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                <span className={labelClasses}>Tela</span>
                                <select
                                  value={part.fabricId}
                                  onChange={(e) => updatePart(iIndex, pIndex, "fabricId", e.target.value)}
                                  className={`${inputClasses} bg-transparent border-stone-800`}
                                >
                                  <option value="" className="bg-stone-900">-- Cliente trae tela --</option>
                                  {fabrics.map((f) => (
                                    <option key={f.id} value={f.id} className="bg-stone-900">{f.code} - {f.nombre}</option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-4 text-sm text-stone-400 hover:text-white transition"
            >
              <Plus className="size-4" /> Añadir otro ítem
            </button>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-[#0e0e0e] p-6 space-y-4">
              <h3 className="font-medium text-white border-b border-white/5 pb-2 mb-4">Operación</h3>
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                <p className={labelClasses}>Cliente (No editable)</p>
                <p className="text-sm text-stone-300 font-medium">
                  {initialOrder.customer.nombres} {initialOrder.customer.apellidos}
                </p>
              </div>

              <label className="block">
                <span className={labelClasses}>Fecha de entrega prometida</span>
                <input
                  type="date"
                  value={form.promisedDeliveryAt}
                  onChange={(e) => updateForm("promisedDeliveryAt", e.target.value)}
                  className={inputClasses}
                />
              </label>

              <label className="block">
                <span className={labelClasses}>Notas para el taller</span>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  className={`${inputClasses} min-h-[80px]`}
                />
              </label>

              <label className="block">
                <span className={labelClasses}>Notas internas</span>
                <textarea
                  value={form.internalNotes}
                  onChange={(e) => updateForm("internalNotes", e.target.value)}
                  className={`${inputClasses} min-h-[60px] bg-stone-900/50`}
                />
              </label>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 shadow-xl text-center">
              <div className="flex justify-between items-end mb-6 text-left">
                <p className="text-emerald-300 font-medium">Total</p>
                <p className="text-3xl font-bold text-emerald-400">S/ {totalOrder.toFixed(2)}</p>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50 transition"
              >
                {isPending ? "Guardando..." : <><Save className="size-4" /> Guardar Cambios</>}
              </button>
            </div>
          </div>
        </div>
      </form>

      {confirmDelete?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2.5rem] border border-white/10 bg-[#0e0e0e] p-8 shadow-2xl">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-500">
              <Trash2 className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {confirmDelete.type === 'ITEM' ? '¿Eliminar este ítem?' : '¿Quitar esta prenda?'}
            </h3>
            <p className="text-sm text-stone-400 mb-8 leading-relaxed">
              {confirmDelete.type === 'ITEM' 
                ? 'Se eliminarán todas las prendas y configuraciones asociadas a este grupo de venta. Esta acción no se puede deshacer.'
                : 'Se perderán las configuraciones específicas de esta prenda dentro del ítem.'}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { 
                  if (confirmDelete.type === 'ITEM') {
                    removeItem(confirmDelete.itemIdx);
                  } else if (confirmDelete.partIdx !== undefined) {
                    removePart(confirmDelete.itemIdx, confirmDelete.partIdx);
                  }
                  setConfirmDelete(null); 
                }} 
                className="w-full rounded-2xl bg-rose-500 py-3 text-sm font-bold text-rose-950 hover:bg-rose-400 transition"
              >
                Sí, eliminar
              </button>
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-stone-400 hover:text-white transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

