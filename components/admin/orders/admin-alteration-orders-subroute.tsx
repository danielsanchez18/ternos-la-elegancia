"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Scissors,
  Hammer,
  Package,
  CheckCircle2,
  MoreHorizontal,
  User,
  Clock as ClockIcon,
  TrendingUp,
  Search,
  RefreshCcw,
  PlusCircle,
  FileText
} from "lucide-react";

import { alterationOrderStatusChipClasses } from "@/components/admin/orders/order-status-styles";
import { formatMediumDate, formatStatusLabel } from "@/components/admin/orders/custom-order-shared";
import { AdminStatCard, AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";

type CustomerOption = {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
};

type AlterationServiceOption = {
  id: string;
  nombre: string;
  activo: boolean;
};

type AlterationOrder = {
  id: string;
  customerId: string;
  code: string;
  status: string;
  serviceId: string | null;
  garmentDescription: string;
  workDescription: string;
  receivedAt: string;
  promisedAt: string | null;
  deliveredAt: string | null;
  total: string | number;
  service: {
    id: string;
    nombre: string;
  } | null;
};

type AlterationOrderListResponse = {
  items: AlterationOrder[];
};

function toDateTimeLocalValue(date: Date): string {
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function buildDefaultPromisedAt(): string {
  return toDateTimeLocalValue(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
}

async function parseApiError(response: Response, fallback: string): Promise<string> {
  const payload = await response.json().catch(() => null);
  if (payload && typeof payload.error === "string") {
    return payload.error;
  }
  return fallback;
}

function getAlterationActions(status: string): Array<{ action: string; label: string }> {
  if (status === "RECIBIDO") {
    return [
      { action: "START_EVALUATION", label: "Iniciar evaluación" },
      { action: "CANCEL", label: "Cancelar" },
    ];
  }
  if (status === "EN_EVALUACION") {
    return [
      { action: "START_WORK", label: "Iniciar trabajo" },
      { action: "CANCEL", label: "Cancelar" },
    ];
  }
  if (status === "EN_PROCESO") {
    return [
      { action: "MARK_READY", label: "Marcar listo" },
      { action: "CANCEL", label: "Cancelar" },
    ];
  }
  if (status === "LISTO") {
    return [
      { action: "MARK_DELIVERED", label: "Marcar entregado" },
      { action: "CANCEL", label: "Cancelar" },
    ];
  }
  return [];
}

export default function AdminAlterationOrdersSubroute() {
  const [orders, setOrders] = useState<AlterationOrder[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [services, setServices] = useState<AlterationServiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [garmentDescription, setGarmentDescription] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [promisedAt, setPromisedAt] = useState(buildDefaultPromisedAt);
  const [notes, setNotes] = useState("");

  const customerById = useMemo(
    () => new Map(customers.map((c) => [c.id, `${c.nombres} ${c.apellidos}`.trim()])),
    [customers]
  );

  const activeServices = useMemo(() => services.filter((s) => s.activo), [services]);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersRes, customersRes, servicesRes] = await Promise.all([
        fetch("/api/alteration-orders?page=1&pageSize=100&orderBy=createdAt&order=desc", { cache: "no-store", credentials: "include" }),
        fetch("/api/customers", { cache: "no-store", credentials: "include" }),
        fetch("/api/alteration-services", { cache: "no-store", credentials: "include" }),
      ]);
      if (ordersRes.ok && customersRes.ok && servicesRes.ok) {
        setOrders(((await ordersRes.json()) as AlterationOrderListResponse).items || []);
        setCustomers((await customersRes.json()) as CustomerOption[]);
        setServices((await servicesRes.json()) as AlterationServiceOption[]);
      }
    } catch { setError("Error de red."); } finally { setIsLoading(false); }
  };

  useEffect(() => { void refreshData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFeedback(null); setError(null);
    if (!customerId || !garmentDescription.trim() || !workDescription.trim()) { setError("Completa los campos obligatorios."); return; }
    setIsSubmitting(true);
    try {
      const promisedAtDate = promisedAt ? new Date(promisedAt) : null;
      const res = await fetch("/api/alteration-orders", {
        method: "POST", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ customerId, serviceId: serviceId || undefined, garmentDescription: garmentDescription.trim(), workDescription: workDescription.trim(), promisedAt: promisedAtDate?.toISOString(), notes: notes.trim() || undefined }),
      });
      if (res.ok) {
        setFeedback("Orden creada."); setGarmentDescription(""); setWorkDescription(""); setNotes(""); setPromisedAt(buildDefaultPromisedAt()); await refreshData();
      } else { setError(await parseApiError(res, "Error al crear.")); }
    } catch { setError("Error de red."); } finally { setIsSubmitting(false); }
  };

  const handleOrderAction = async (orderId: string, action: string) => {
    setActiveOrderId(orderId); setFeedback(null); setError(null);
    try {
      const res = await fetch(`/api/alteration-orders/${orderId}`, {
        method: "PATCH", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) { setFeedback("Estado actualizado."); await refreshData(); }
    } finally { setActiveOrderId(null); }
  };

  const stats = useMemo(() => ({
    total: orders.length,
    active: orders.filter(o => ["RECIBIDO", "EN_EVALUACION", "EN_PROCESO", "LISTO"].includes(o.status)).length,
    delivered: orders.filter(o => o.status === "ENTREGADO").length,
    servicesCount: activeServices.length
  }), [orders, activeServices]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard title="Total Ajustes" value={stats.total} detail="Histórico de sastrería" />
        <AdminStatCard title="En Taller" value={stats.active} detail="Pendientes de entrega" />
        <AdminStatCard title="Entregadas" value={stats.delivered} detail="Ordenes finalizadas" />
        <AdminStatCard title="Servicios Base" value={stats.servicesCount} detail="Catálogo habilitado" />
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 w-full space-y-6 min-w-0">
          <Panel eyebrow="Taller" title="Maestro de Alteraciones">
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
                    <th className="px-3 py-3 font-medium">Orden / Prenda</th>
                    <th className="px-3 py-3 font-medium text-center">Referencia</th>
                    <th className="px-3 py-3 font-medium text-center">Plazos</th>
                    <th className="px-3 py-3 font-medium text-center">Estado</th>
                    <th className="px-3 py-3 font-medium text-right">Total</th>
                    <th className="px-3 py-3 font-medium text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr><td colSpan={6} className="py-20 text-center animate-pulse text-stone-600 font-mono text-[10px] uppercase tracking-widest">Consultando mesa de trabajo...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={6} className="py-20 text-center text-stone-600 italic">No hay alteraciones registradas</td></tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="group hover:bg-white/2 transition-colors">
                        <td className="px-3 py-5">
                          <p className="text-base font-bold text-white leading-none">{o.code}</p>
                          <p className="text-[10px] text-stone-500 mt-1.5 uppercase font-mono tracking-tighter truncate max-w-[150px]">{o.garmentDescription}</p>
                        </td>
                        <td className="px-3 py-5 text-center">
                          <p className="text-sm font-bold text-stone-300">{customerById.get(o.customerId) || "Clin."}</p>
                          <p className="text-[9px] uppercase tracking-widest text-stone-600 font-bold mt-1">{o.service?.nombre || "Sin servicio base"}</p>
                        </td>
                        <td className="px-3 py-5 text-center">
                          <div className="space-y-1">
                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-tighter">Recibo: {formatMediumDate(o.receivedAt)}</p>
                            {o.promisedAt && (
                              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
                                Meta: {formatMediumDate(o.promisedAt)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-5 text-center text-[10px] font-bold uppercase tracking-widest">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 ${alterationOrderStatusChipClasses(o.status)}`}>
                            {formatStatusLabel(o.status)}
                          </span>
                        </td>
                        <td className="px-3 py-5 text-right font-mono font-bold text-emerald-400">
                          S/ {Number(o.total).toFixed(2)}
                        </td>
                        <td className="px-3 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {getAlterationActions(o.status).map(action => (
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
                              href={`/admin/ordenes/alteraciones/${o.id}`}
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
          <Panel eyebrow="Registro" title="Nueva Alteración">
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase font-bold text-stone-600 ml-1 tracking-widest">Cliente Titular</p>
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

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-[9px] uppercase font-bold text-stone-600 ml-1 tracking-widest">Tipo Prenda</p>
                  <input
                    type="text"
                    value={garmentDescription}
                    onChange={e => setGarmentDescription(e.target.value)}
                    placeholder="Ej: Saco Azul"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] uppercase font-bold text-stone-600 ml-1 tracking-widest">Servicio Base</p>
                  <select
                    value={serviceId}
                    onChange={e => setServiceId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="">Opcional...</option>
                    {activeServices.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] uppercase font-bold text-stone-600 ml-1 tracking-widest">Trabajo a Realizar</p>
                <textarea
                  value={workDescription}
                  onChange={e => setWorkDescription(e.target.value)}
                  placeholder="Ej: Entallar mangas 2cm, subir basta..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white min-h-[100px] outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] uppercase font-bold text-stone-600 ml-1 tracking-widest">Fecha Prometida</p>
                <input
                  type="datetime-local"
                  value={promisedAt}
                  onChange={e => setPromisedAt(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-400 transition disabled:opacity-50"
              >
                {isSubmitting ? "Registrando..." : "Crear Orden de Ajuste"}
              </button>
            </form>
          </Panel>
        </div>
      </div>

      {feedback && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-emerald-500/20 bg-[#0e0e0e] px-6 py-3 shadow-2xl shadow-emerald-500/10">
          <p className="text-sm text-emerald-400 font-bold flex items-center gap-2"><CheckCircle2 className="size-4" /> {feedback}</p>
        </div>
      )}
    </div>
  );
}
