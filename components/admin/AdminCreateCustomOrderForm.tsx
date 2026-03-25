"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Scissors } from "lucide-react";
import Link from "next/link";
import {
  addItemDraft,
  addPartDraft,
  buildCreateCustomOrderPayload,
  calculateCustomOrderTotal,
  createCustomOrderFormInitialState,
  createCustomOrderInitialItems,
  fetchCustomerProfiles,
  GARMENT_TYPES,
  getProfileGarments,
  removeItemDraft,
  removePartDraft,
  resolveCreateErrorMessage,
  type Customer,
  type Fabric,
  updateItemDraft,
  updatePartDraft,
} from "@/components/admin/orders/custom-order-form";

export default function AdminCreateCustomOrderForm({
  customers,
  fabrics,
}: {
  customers: Customer[];
  fabrics: Fabric[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; itemIdx: number; partIdx: number } | null>(null);

  const [form, setForm] = useState(createCustomOrderFormInitialState);

  const [customerProfiles, setCustomerProfiles] = useState<any[]>([]);
  const [isFetchingProfiles, setIsFetchingProfiles] = useState(false);

  const [items, setItems] = useState(createCustomOrderInitialItems);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    
    if (key === "customerId" && value) {
      void fetchCustomerProfilesForCustomer(value);
    }
  };

  const fetchCustomerProfilesForCustomer = async (id: string) => {
    setIsFetchingProfiles(true);
    try {
      const data = await fetchCustomerProfiles(id);
      setCustomerProfiles(data);
    } catch (err) {
      console.error("Error fetching customer profiles", err);
    } finally {
      setIsFetchingProfiles(false);
    }
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

    if (!form.customerId) {
      setErrorMsg("Debe seleccionar un cliente.");
      return;
    }

    if (items.length === 0) {
      setErrorMsg("La orden debe tener al menos un ítem.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = buildCreateCustomOrderPayload(form, items);

        const res = await fetch(`/api/custom-orders`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const resData = await res.json().catch(() => null);
        
        if (res.ok && resData?.id) {
          router.push(`/admin/ordenes/personalizadas/${resData.id}`);
          router.refresh();
          return;
        }

        if (!res.ok) {
          console.error("API Error Response:", resData);
          setErrorMsg(resolveCreateErrorMessage(resData));
          return;
        }
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
            href="/admin/ordenes/personalizadas"
            className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 hover:bg-white/[0.06] hover:text-white transition"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Nueva
            </p>
            <h1 className="text-2xl font-semibold text-white">Orden a Medida</h1>
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
            {/* BUILDER PRINCIPAL */}
            <div className="space-y-4">
              {items.map((item, iIndex) => (
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
                        onClick={() => removeItem(iIndex)}
                        className="text-stone-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </header>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="col-span-2 md:col-span-4">
                        <span className={labelClasses}>Nombre de Venta (ej. Terno 2 piezas) *</span>
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

                    {/* PARTES */}
                    <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-stone-300">
                          Prendas (Partes a confeccionar)
                        </p>
                        <button
                          type="button"
                          onClick={() => addPart(iIndex)}
                          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          <Plus className="size-3" /> Añadir prenda
                        </button>
                      </div>

                      <div className="space-y-3">
                        {item.parts.length === 0 ? (
                          <p className="text-xs text-stone-500 italic">No hay prendas definidas.</p>
                        ) : (
                          item.parts.map((part, pIndex) => (
                            <div key={part.id} className="relative rounded-lg border border-white/5 bg-black/40 p-4 pr-12">
                              {item.parts.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDelete({ isOpen: true, itemIdx: iIndex, partIdx: pIndex })}
                                  className="absolute right-3 top-4 flex flex-col items-center gap-1 group/del"
                                  title="Quitar prenda"
                                >
                                  <div className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500/50 group-hover/del:text-rose-400 group-hover/del:bg-rose-500/20 transition">
                                    <Trash2 className="size-3.5" />
                                  </div>
                                  <span className="text-[9px] text-stone-600 group-hover/del:text-rose-400 transition uppercase font-bold">Quitar</span>
                                </button>
                              )}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <label>
                                  <span className={labelClasses}>Etiqueta</span>
                                  <input
                                    type="text"
                                    required
                                    value={part.label}
                                    placeholder="ej. Saco"
                                    onChange={(e) => updatePart(iIndex, pIndex, "label", e.target.value)}
                                    className={`${inputClasses} bg-transparent border-stone-800`}
                                  />
                                </label>
                                <label>
                                  <span className={labelClasses}>Tipo de Prenda</span>
                                  <select
                                    value={part.garmentType}
                                    onChange={(e) => updatePart(iIndex, pIndex, "garmentType", e.target.value)}
                                    className={`${inputClasses} bg-transparent border-stone-800`}
                                  >
                                    {GARMENT_TYPES.map((t) => (
                                      <option key={t} value={t} className="bg-stone-900">
                                        {t.replace(/_/g, " ")}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label>
                                  <span className={labelClasses}>Tela (Opcional)</span>
                                  <select
                                    value={part.fabricId}
                                    onChange={(e) => updatePart(iIndex, pIndex, "fabricId", e.target.value)}
                                    className={`${inputClasses} bg-transparent border-stone-800`}
                                  >
                                    <option value="" className="bg-stone-900">-- Cliente trae tela / Pendiente --</option>
                                    {fabrics.map((f) => (
                                      <option key={f.id} value={f.id} className="bg-stone-900">
                                        {f.code} - {f.nombre}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <div className="space-y-1">
                                  <span className={labelClasses}>Modelo de Trabajo</span>
                                  <select
                                    value={part.workMode}
                                    onChange={(e) => updatePart(iIndex, pIndex, "workMode", e.target.value)}
                                    className={`${inputClasses} bg-transparent border-stone-800`}
                                  >
                                    <option value="A_TODO_COSTO" className="bg-stone-900">A Todo Costo (Kardex)</option>
                                    <option value="SOLO_CONFECCION" className="bg-stone-900">Solo Confección (CMT)</option>
                                  </select>
                                  <p className="text-[10px] text-stone-500 mt-1 leading-tight">
                                    {part.workMode === "A_TODO_COSTO" 
                                      ? "Descuenta inventario interno." 
                                      : "El cliente trae su propia tela."}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <span className={labelClasses}>Vincular Medida</span>
                                  <div className="flex gap-2">
                                    <select
                                      value={part.measurementProfileId}
                                      onChange={(e) => {
                                        const profileId = e.target.value;
                                        updatePart(iIndex, pIndex, "measurementProfileId", profileId);
                                        // Reset garment if profile changes or is cleared
                                        updatePart(iIndex, pIndex, "measurementProfileGarmentId", "");
                                      }}
                                      className={`${inputClasses} bg-transparent border-stone-800 text-[11px]`}
                                      disabled={!form.customerId || customerProfiles.length === 0}
                                    >
                                      <option value="" className="bg-stone-900">-- Sin medidas --</option>
                                      {customerProfiles.map((p) => (
                                        <option key={p.id} value={p.id} className="bg-stone-900">
                                          {new Date(p.takenAt).toLocaleDateString()} {p.isActive ? "(Vigente)" : "(Antiguo)"}
                                        </option>
                                      ))}
                                    </select>

                                    {part.measurementProfileId && (
                                      <select
                                        required
                                        value={part.measurementProfileGarmentId}
                                        onChange={(e) => updatePart(iIndex, pIndex, "measurementProfileGarmentId", e.target.value)}
                                        className={`${inputClasses} bg-transparent border-stone-800 text-[11px]`}
                                      >
                                        <option value="" className="bg-stone-900">-- Elegir tipo --</option>
                                        {getProfileGarments(
                                          customerProfiles,
                                          part.measurementProfileId
                                        ).map((g: any) => (
                                            <option key={g.id} value={g.id} className="bg-stone-900">
                                              {g.garmentType.replace(/_/g, " ")}
                                            </option>
                                          ))
                                        }
                                      </select>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-stone-500 mt-1 leading-tight">
                                    {customerProfiles.length === 0 && form.customerId 
                                      ? "Este cliente no tiene perfiles registrados."
                                      : !form.customerId 
                                        ? "Selecciona un cliente primero."
                                        : "Toma de medidas técnica asociada."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-transparent py-4 text-sm font-medium text-stone-400 hover:text-white hover:border-white/40 transition"
            >
              <Plus className="size-4" />
              Añadir otro paquete/ítem a la misma orden
            </button>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-[#0e0e0e] p-6 space-y-4">
              <h3 className="font-medium text-white border-b border-white/5 pb-2 mb-4">
                Detalles de Operación
              </h3>
              <label className="block">
                <span className={labelClasses}>Cliente asociado *</span>
                <select
                  required
                  value={form.customerId}
                  onChange={(e) => updateForm("customerId", e.target.value)}
                  className={inputClasses}
                >
                  <option value="" className="bg-stone-900">-- Selecciona un cliente --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-stone-900">
                      {c.nombres} {c.apellidos} {c.dni ? `(${c.dni})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelClasses}>Fecha de entrega prometida (Opcional)</span>
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
                  placeholder="Instrucciones del cliente..."
                />
              </label>

              <label className="block">
                <span className={labelClasses}>Notas internas (Admin)</span>
                <textarea
                  value={form.internalNotes}
                  onChange={(e) => updateForm("internalNotes", e.target.value)}
                  className={`${inputClasses} min-h-[60px] bg-stone-900/50`}
                />
              </label>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 shadow-xl">
              <div className="flex justify-between items-end mb-6">
                <p className="text-emerald-300 font-medium">Total Estimado</p>
                <p className="text-3xl font-bold text-emerald-400">
                  S/ {totalOrder.toFixed(2)}
                </p>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {isPending ? "Procesando..." : "Registrar Orden"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {confirmDelete?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0e0e0e] p-6 shadow-2xl text-left">
            <h3 className="text-xl font-semibold text-white mb-2 ml-1">Quitar Prenda</h3>
            <p className="text-sm text-stone-400 mb-6 ml-1">
              ¿Estás seguro de quitar esta prenda de la configuración? Tendrás que añadirla de nuevo si cambias de opinión.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-stone-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  removePart(confirmDelete.itemIdx, confirmDelete.partIdx);
                  setConfirmDelete(null);
                }}
                className="rounded-xl bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 transition"
              >
                Sí, quitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
