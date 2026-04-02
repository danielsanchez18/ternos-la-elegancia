"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  History,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  ShoppingBag,
  RefreshCcw,
  PlusCircle,
  Trash2,
  MoreHorizontal
} from "lucide-react";

import { formatMediumDate, formatStatusLabel } from "@/components/admin/orders/custom-order-shared";
import { rentalOrderStatusChipClasses } from "@/components/admin/orders/order-status-styles";
import { AdminStatCard, AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";

type CustomerOption = {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
};

type ProductOption = {
  id: string;
  nombre: string;
  kind: string;
  allowsRental: boolean;
  active: boolean;
};

type RentalUnitListItem = {
  id: string;
  productId: string;
  variantId: string | null;
  internalCode: string;
  sizeLabel: string | null;
  color: string | null;
  status: string;
  currentTier: string;
  normalPrice: string | number;
  premierePrice: string | number;
};

type RentalOrderItem = {
  id: string;
  rentalUnitId: string;
  itemNameSnapshot: string;
  tierAtRental: string;
  unitPrice: string | number;
};

type RentalOrderListItem = {
  id: string;
  customerId: string;
  code: string;
  status: string;
  total: string | number;
  pickupAt: string;
  dueBackAt: string;
  returnedAt: string | null;
  items: RentalOrderItem[];
};

type RentalOrderListResponse = {
  items: RentalOrderListItem[];
};

type RentalRequestRow = {
  rowId: string;
  productId: string;
  sizeKey: string;
  quantity: number;
};

type SizeOption = {
  sizeKey: string;
  label: string;
  totalCount: number;
  availableCount: number;
};

const NO_SIZE_KEY = "__NO_SIZE__";

function toDateTimeLocalValue(date: Date): string {
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function buildDefaultDueBackAt(): string {
  return toDateTimeLocalValue(new Date(Date.now() + 2 * 60 * 60 * 1000));
}

function createRentalRequestRow(): RentalRequestRow {
  return {
    rowId: `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
    productId: "",
    sizeKey: "",
    quantity: 1,
  };
}

function normalizeSizeLabel(label: string | null | undefined): string {
  const normalized = (label ?? "").trim();
  return normalized ? normalized : "Sin talla";
}

function toSizeKey(label: string | null | undefined): string {
  const normalized = (label ?? "").trim().toLowerCase();
  return normalized || NO_SIZE_KEY;
}

function buildComboKey(productId: string, sizeKey: string): string {
  return `${productId}::${sizeKey}`;
}

async function parseApiError(response: Response, fallback: string): Promise<string> {
  const payload = await response.json().catch(() => null);
  if (payload && typeof payload.error === "string") {
    return payload.error;
  }
  return fallback;
}

function getRentalActions(status: string): Array<{ action: string; label: string }> {
  if (status === "ENTREGADO") {
    return [
      { action: "MARK_RETURNED", label: "Marcar devuelto" },
      { action: "MARK_LATE", label: "Marcar retraso" },
    ];
  }
  if (status === "ATRASADO") {
    return [{ action: "MARK_RETURNED", label: "Marcar devuelto" }];
  }
  if (status === "DEVUELTO") {
    return [{ action: "CLOSE", label: "Cerrar orden" }];
  }
  if (status === "RESERVADO") {
    return [{ action: "CANCEL", label: "Cancelar" }];
  }
  return [];
}

function summarizeOrderItems(items: RentalOrderItem[]): string {
  if (items.length === 0) return "Sin items";
  const names = Array.from(new Set(items.map((item) => item.itemNameSnapshot).filter(Boolean)));
  if (names.length === 0) return `${items.length} item(s)`;
  if (names.length === 1) return names[0];
  return `${names.slice(0, 2).join(" + ")}${names.length > 2 ? "..." : ""}`;
}

export default function AdminRentalOrdersSubroute() {
  const [orders, setOrders] = useState<RentalOrderListItem[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [rentalUnits, setRentalUnits] = useState<RentalUnitListItem[]>([]);
  const [requestRows, setRequestRows] = useState<RentalRequestRow[]>([createRentalRequestRow()]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [returnHasDamage, setReturnHasDamage] = useState(false);
  const [returnNotes, setReturnNotes] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [dueBackAt, setDueBackAt] = useState(buildDefaultDueBackAt);
  const [notes, setNotes] = useState("");

  const availableUnits = useMemo(
    () => rentalUnits.filter((unit) => unit.status === "DISPONIBLE"),
    [rentalUnits]
  );

  const customerById = useMemo(
    () => new Map(customers.map((c) => [c.id, `${c.nombres} ${c.apellidos}`.trim()])),
    [customers]
  );

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const availableCountByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const unit of availableUnits) {
      map.set(unit.productId, (map.get(unit.productId) ?? 0) + 1);
    }
    return map;
  }, [availableUnits]);

  const sizeOptionsByProduct = useMemo(() => {
    const totalMap = new Map<string, number>();
    const availableMap = new Map<string, number>();
    const labelByProductSize = new Map<string, string>();
    for (const unit of rentalUnits) {
      const sizeKey = toSizeKey(unit.sizeLabel);
      const comboKey = buildComboKey(unit.productId, sizeKey);
      totalMap.set(comboKey, (totalMap.get(comboKey) ?? 0) + 1);
      labelByProductSize.set(comboKey, normalizeSizeLabel(unit.sizeLabel));
    }
    for (const unit of availableUnits) {
      const sizeKey = toSizeKey(unit.sizeLabel);
      const comboKey = buildComboKey(unit.productId, sizeKey);
      availableMap.set(comboKey, (availableMap.get(comboKey) ?? 0) + 1);
    }
    const map = new Map<string, SizeOption[]>();
    for (const [comboKey, totalCount] of totalMap) {
      const [productId, sizeKey] = comboKey.split("::");
      const current = map.get(productId) ?? [];
      current.push({
        sizeKey,
        label: labelByProductSize.get(comboKey) ?? "Sin talla",
        totalCount,
        availableCount: availableMap.get(comboKey) ?? 0,
      });
      map.set(productId, current);
    }
    for (const [productId, options] of map) {
      options.sort((a, b) => a.label.localeCompare(b.label, "es"));
      map.set(productId, options);
    }
    return map;
  }, [rentalUnits, availableUnits]);

  const availableCountByCombo = useMemo(() => {
    const map = new Map<string, number>();
    for (const unit of availableUnits) {
      const sizeKey = toSizeKey(unit.sizeLabel);
      const comboKey = buildComboKey(unit.productId, sizeKey);
      map.set(comboKey, (map.get(comboKey) ?? 0) + 1);
    }
    return map;
  }, [availableUnits]);

  const rentalEnabledProducts = useMemo(
    () => products.filter((p) => p.active && p.allowsRental),
    [products]
  );

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersRes, customersRes, unitsRes, productsRes] = await Promise.all([
        fetch("/api/rental-orders?page=1&pageSize=100&orderBy=createdAt&order=desc", { cache: "no-store", credentials: "include" }),
        fetch("/api/customers", { cache: "no-store", credentials: "include" }),
        fetch("/api/rental-units", { cache: "no-store", credentials: "include" }),
        fetch("/api/products?active=true&allowsRental=true", { cache: "no-store", credentials: "include" }),
      ]);
      if (ordersRes.ok && customersRes.ok && unitsRes.ok && productsRes.ok) {
        setOrders(((await ordersRes.json()) as RentalOrderListResponse).items || []);
        setCustomers((await customersRes.json()) as CustomerOption[]);
        setRentalUnits((await unitsRes.json()) as RentalUnitListItem[]);
        setProducts((await productsRes.json()) as ProductOption[]);
      }
    } catch { setError("Error de red."); } finally { setIsLoading(false); }
  };

  useEffect(() => { void refreshData(); }, []);

  const updateRequestRow = (rowId: string, updater: (row: RentalRequestRow) => RentalRequestRow) => {
    setRequestRows((current) => current.map((row) => (row.rowId === rowId ? updater(row) : row)));
  };

  const handleChangeRowProduct = (rowId: string, nextProductId: string) => {
    const productSizes = sizeOptionsByProduct.get(nextProductId) ?? [];
    const preferredSize = productSizes.find((o) => o.availableCount > 0)?.sizeKey ?? productSizes[0]?.sizeKey ?? "";
    updateRequestRow(rowId, (row) => ({ ...row, productId: nextProductId, sizeKey: preferredSize, quantity: 1 }));
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault(); setFeedback(null); setError(null);
    if (!customerId) { setError("Selecciona cliente."); return; }
    if (requestRows.length === 0) { setError("Agrega prendas."); return; }
    setIsSubmitting(true);
    try {
      const items: any[] = [];
      for (const row of requestRows) {
        const comboKey = buildComboKey(row.productId, row.sizeKey);
        const candidates = availableUnits.filter(u => buildComboKey(u.productId, toSizeKey(u.sizeLabel)) === comboKey);
        candidates.slice(0, row.quantity).forEach(u => items.push({ rentalUnitId: u.id }));
      }
      const res = await fetch("/api/rental-orders", {
        method: "POST", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ customerId, dueBackAt: new Date(dueBackAt).toISOString(), notes: notes.trim() || undefined, items }),
      });
      if (res.ok) {
        setFeedback("Orden creada."); setRequestRows([createRentalRequestRow()]); setNotes(""); await refreshData();
      } else { setError(await parseApiError(res, "Error al crear.")); }
    } catch { setError("Error de red."); } finally { setIsSubmitting(false); }
  };

  const handleOrderAction = async (orderId: string, action: string) => {
    if (action === "MARK_RETURNED") { setReturnOrderId(orderId); return; }
    setActiveOrderId(orderId); setFeedback(null); setError(null);
    try {
      const res = await fetch(`/api/rental-orders/${orderId}`, {
        method: "PATCH", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) { setFeedback("Estado actualizado."); await refreshData(); }
    } finally { setActiveOrderId(null); }
  };

  const handleConfirmReturn = async () => {
    if (!returnOrderId) return;
    setActiveOrderId(returnOrderId); setFeedback(null); setError(null);
    try {
      const res = await fetch(`/api/rental-orders/${returnOrderId}`, {
        method: "PATCH", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "MARK_RETURNED", hasDamage: returnHasDamage, returnNotes: returnNotes.trim() || undefined }),
      });
      if (res.ok) { setFeedback("Devolución registrada."); setReturnOrderId(null); await refreshData(); }
    } finally { setActiveOrderId(null); }
  };

  const stats = useMemo(() => ({
    total: orders.length,
    active: orders.filter(o => ["ENTREGADO", "ATRASADO"].includes(o.status)).length,
    returned: orders.filter(o => o.status === "DEVUELTO").length,
    availableUnits: availableUnits.length
  }), [orders, availableUnits]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard title="Total Alquileres" value={stats.total} detail="Histórico acumulado" />
        <AdminStatCard title="Rentas Activas" value={stats.active} detail="Prendas fuera de tienda" />
        <AdminStatCard title="Para Cierre" value={stats.returned} detail="Devueltas pendientes de revisión" />
        <AdminStatCard title="Stock Disponible" value={stats.availableUnits} detail="Unidades listas en rack" />
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 w-full space-y-6 min-w-0">
          <Panel eyebrow="Maestro" title="Control de Alquileres">
            <div className="flex flex-col gap-4 border-b border-white/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Buscar por código u cliente..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-4 text-sm text-stone-200 outline-none transition focus:border-emerald-500/50"
                />
              </div>
              <button
                onClick={() => void refreshData()}
                className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-stone-400 hover:text-white transition"
              >
                <RefreshCcw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[10px] uppercase tracking-widest text-stone-600 font-bold border-b border-white/8">
                  <tr>
                    <th className="px-3 py-3 font-medium">Orden / Cliente</th>
                    <th className="px-3 py-3 font-medium text-center">Items</th>
                    <th className="px-3 py-3 font-medium text-center">Plazos</th>
                    <th className="px-3 py-3 font-medium text-center">Estado</th>
                    <th className="px-3 py-3 font-medium text-right">Total</th>
                    <th className="px-3 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr><td colSpan={6} className="py-20 text-center animate-pulse text-stone-600 font-mono text-[10px] uppercase tracking-widest">Analizando registros de rack...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={6} className="py-20 text-center text-stone-600 italic">No hay órdenes registradas</td></tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="group hover:bg-white/2 transition-colors">
                        <td className="px-3 py-5">
                          <p className="text-base font-bold text-white leading-none">{o.code}</p>
                          <p className="text-[11px] text-stone-400 mt-1.5 font-medium">{customerById.get(o.customerId) || "Cliente desconocido"}</p>
                        </td>
                        <td className="px-3 py-5 text-center">
                          <p className="text-xs font-bold text-stone-300 truncate max-w-[150px] mx-auto">{summarizeOrderItems(o.items)}</p>
                          <p className="text-[9px] uppercase tracking-widest text-stone-600 font-bold mt-1">{o.items.length} un.</p>
                        </td>
                        <td className="px-3 py-5 text-center">
                          <div className="space-y-1">
                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-tighter">Recogida: {formatMediumDate(o.pickupAt)}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${o.status === "ATRASADO" ? "text-rose-400" : "text-amber-400/80"}`}>
                              Vence: {formatMediumDate(o.dueBackAt)}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-5 text-center text-[10px] font-bold uppercase tracking-widest">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 ${rentalOrderStatusChipClasses(o.status)}`}>
                            {formatStatusLabel(o.status)}
                          </span>
                        </td>
                        <td className="px-3 py-5 text-right font-mono font-bold text-emerald-400">
                          S/ {Number(o.total).toFixed(2)}
                        </td>
                        <td className="px-3 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {getRentalActions(o.status).map(action => (
                              <button
                                key={action.action}
                                onClick={() => void handleOrderAction(o.id, action.action)}
                                disabled={activeOrderId === o.id}
                                className="rounded-lg bg-emerald-500/10 text-emerald-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition disabled:opacity-50"
                              >
                                {action.label}
                              </button>
                            ))}
                            <Link
                              href={`/admin/ordenes/alquiler/${o.id}`}
                              className="rounded-lg bg-white/5 text-stone-300 p-1.5 hover:bg-white/10 transition"
                            >
                              <MoreHorizontal className="size-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="w-full xl:w-[400px] shrink-0">
          <Panel eyebrow="Operación" title="Nueva Renta Inmediata">
            <form onSubmit={handleCreateOrder} className="space-y-5">
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase font-bold text-stone-600 ml-1 tracking-widest">Cliente titular</p>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                  required
                >
                  <option value="">Selecciona cliente...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.nombres} {c.apellidos} - {c.dni}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] uppercase font-bold text-stone-600 ml-1 tracking-widest">Devolución Pactada</p>
                <input
                  type="datetime-local"
                  value={dueBackAt}
                  onChange={e => setDueBackAt(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white font-mono"
                  required
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Prendas / Tallas</p>
                  <button
                    type="button"
                    onClick={() => setRequestRows(curr => [...curr, createRentalRequestRow()])}
                    className="text-emerald-400 hover:text-emerald-300 transition"
                  >
                    <PlusCircle className="size-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {requestRows.map((row, idx) => {
                    const sizes = row.productId ? sizeOptionsByProduct.get(row.productId) ?? [] : [];
                    return (
                      <div key={row.rowId} className="p-3 rounded-2xl bg-white/2 border border-white/5 space-y-3 relative">
                        {requestRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setRequestRows(curr => curr.filter(r => r.rowId !== row.rowId))}
                            className="absolute -top-2 -right-2 bg-black border border-white/10 text-stone-500 p-1 rounded-full hover:text-rose-400 transition"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        )}
                        <select
                          value={row.productId}
                          onChange={e => handleChangeRowProduct(row.rowId, e.target.value)}
                          className="w-full bg-transparent text-xs text-stone-200 border-none outline-none focus:ring-0 p-0"
                          required
                        >
                          <option value="">Producto...</option>
                          {rentalEnabledProducts.map(p => (
                            <option key={p.id} value={p.id} disabled={(availableCountByProduct.get(p.id) ?? 0) === 0}>
                              {p.nombre} ({(availableCountByProduct.get(p.id) ?? 0)} disp.)
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
                          <select
                            value={row.sizeKey}
                            onChange={e => updateRequestRow(row.rowId, r => ({ ...r, sizeKey: e.target.value }))}
                            className="bg-transparent text-[10px] font-bold uppercase text-emerald-400 border-none outline-none p-0"
                            required
                          >
                            <option value="">Talla</option>
                            {sizes.map(s => <option key={s.sizeKey} value={s.sizeKey} disabled={s.availableCount === 0}>{s.label}</option>)}
                          </select>
                          <input
                            type="number"
                            min={1}
                            value={row.quantity}
                            onChange={e => updateRequestRow(row.rowId, r => ({ ...r, quantity: parseInt(e.target.value) || 1 }))}
                            className="w-10 bg-transparent text-right text-[10px] font-bold text-white border-none outline-none p-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Notas u observaciones del alquiler..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-stone-400 min-h-[80px] outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-400 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Procesando..." : "Registrar Alquiler"}
                </button>
              </div>
            </form>
          </Panel>
        </div>
      </div>

      {returnOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[2.5rem] bg-[#0e0e0e] border border-white/10 p-8 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-2">Devolución</p>
              <h3 className="text-2xl font-bold text-white">Registrar Retorno</h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`size-5 rounded-md border flex items-center justify-center transition ${returnHasDamage ? "bg-rose-500 border-rose-500" : "border-white/10 bg-white/5"}`}>
                  {returnHasDamage && <CheckCircle2 className="size-3 text-white" />}
                </div>
                <input type="checkbox" checked={returnHasDamage} onChange={e => setReturnHasDamage(e.target.checked)} className="hidden" />
                <span className={`text-sm font-bold uppercase tracking-widest ${returnHasDamage ? "text-rose-400" : "text-stone-500 group-hover:text-stone-300"}`}>Posee Daños / Manchas</span>
              </label>

              <textarea
                value={returnNotes}
                onChange={e => setReturnNotes(e.target.value)}
                placeholder="Estado de la prenda al recibir..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-stone-200 min-h-[120px] outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setReturnOrderId(null)} className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-bold text-stone-400 hover:bg-white/10">Cancelar</button>
              <button onClick={handleConfirmReturn} className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-400">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-emerald-500/20 bg-[#0e0e0e] px-6 py-3 shadow-2xl shadow-emerald-500/10">
          <p className="text-sm text-emerald-400 font-bold flex items-center gap-2"><CheckCircle2 className="size-4" /> {feedback}</p>
        </div>
      )}
    </div>
  );
}
