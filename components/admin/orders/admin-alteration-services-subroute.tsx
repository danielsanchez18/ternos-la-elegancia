"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Scissors,
  Plus,
  Search,
  Edit3,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Hammer,
  Trash2
} from "lucide-react";

import { AdminStatCard, AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";

type AlterationService = {
  id: string;
  nombre: string;
  precioBase: number | string | null;
  activo: boolean;
  updatedAt: string;
};

async function parseApiError(response: Response, fallback: string): Promise<string> {
  const payload = await response.json().catch(() => null);
  if (payload && typeof payload.error === "string") {
    return payload.error;
  }
  return fallback;
}

export default function AdminAlterationServicesSubroute() {
  const [services, setServices] = useState<AlterationService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [precioBase, setPrecioBase] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editPrecioBase, setEditPrecioBase] = useState("");
  const [editActivo, setEditActivo] = useState(true);

  const stats = useMemo(() => ({
    total: services.length,
    active: services.filter((s) => s.activo).length,
    inactive: services.filter((s) => !s.activo).length
  }), [services]);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/alteration-services", { method: "GET", credentials: "include", cache: "no-store" });
      if (response.ok) {
        const payload = (await response.json()) as AlterationService[];
        setServices(Array.isArray(payload) ? payload : []);
      }
    } catch { setError("Error de red."); } finally { setIsLoading(false); }
  };

  useEffect(() => { void refreshData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setFeedback(null); setError(null);
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/alteration-services", {
        method: "POST", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), precioBase: precioBase ? Number(precioBase) : undefined, activo: true }),
      });
      if (res.ok) { setNombre(""); setPrecioBase(""); setFeedback("Servicio creado."); await refreshData(); }
      else { setError(await parseApiError(res, "No se pudo crear.")); }
    } finally { setIsSubmitting(false); }
  };

  const handleToggleActive = async (service: AlterationService) => {
    try {
      const res = await fetch(`/api/alteration-services/${service.id}`, {
        method: service.activo ? "DELETE" : "PATCH", credentials: "include",
        ...(service.activo ? {} : { headers: { "content-type": "application/json" }, body: JSON.stringify({ activo: true }) })
      });
      if (res.ok) { setFeedback("Estado actualizado."); await refreshData(); }
    } catch { setError("Error de red."); }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/alteration-services/${editingId}`, {
        method: "PATCH", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ nombre: editNombre.trim(), precioBase: editPrecioBase ? Number(editPrecioBase) : null, activo: editActivo }),
      });
      if (res.ok) { setFeedback("Servicio actualizado."); setEditingId(null); await refreshData(); }
    } catch { setError("Error de red."); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard title="Total Servicios" value={stats.total} detail="Catálogo de sastrería" />
        <AdminStatCard title="Habilitados" value={stats.active} detail="Disponibles para nuevas órdenes" />
        <AdminStatCard title="Históricos" value={stats.inactive} detail="Servicios fuera de catálogo" />
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 w-full space-y-6 min-w-0">
          <Panel eyebrow="Catálogo" title="Servicios de Alteración">
            <div className="flex flex-col gap-4 border-b border-white/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Filtrar servicios..."
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
                    <th className="px-3 py-3 font-medium">Servicio</th>
                    <th className="px-3 py-3 font-medium text-center">Precio Base</th>
                    <th className="px-3 py-3 font-medium text-center">Estado</th>
                    <th className="px-3 py-3 font-medium text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr><td colSpan={4} className="py-20 text-center animate-pulse text-stone-600 font-mono text-[10px] uppercase tracking-widest">Sincronizando catálogo...</td></tr>
                  ) : services.length === 0 ? (
                    <tr><td colSpan={4} className="py-20 text-center text-stone-600 italic">No hay servicios registrados</td></tr>
                  ) : (
                    services.map((s) => (
                      <tr key={s.id} className="group hover:bg-white/2 transition-colors">
                        <td className="px-3 py-5">
                          <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors uppercase tracking-tight">{s.nombre}</p>
                          <p className="text-[10px] text-stone-600 mt-0.5 font-mono">CODE: {s.id.split("-")[0].toUpperCase()}</p>
                        </td>
                        <td className="px-3 py-5 text-center font-mono text-xs text-stone-300 font-bold">
                          {s.precioBase ? `S/ ${Number(s.precioBase).toFixed(2)}` : "--"}
                        </td>
                        <td className="px-3 py-5 text-center text-[10px] font-bold uppercase tracking-widest">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 ${s.activo ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-white/5 text-stone-500"}`}>
                            {s.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-3 py-5 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setEditingId(s.id); setEditNombre(s.nombre); setEditPrecioBase(String(s.precioBase || "")); setEditActivo(s.activo); }}
                              className="rounded-lg bg-white/5 text-stone-400 p-2 hover:bg-white/10 hover:text-white transition"
                            >
                              <Edit3 className="size-3.5" />
                            </button>
                            <button
                              onClick={() => void handleToggleActive(s)}
                              className={`rounded-lg p-2 transition ${s.activo ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"}`}
                            >
                              {s.activo ? <Trash2 className="size-3.5" /> : <RefreshCcw className="size-3.5" />}
                            </button>
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
          <Panel eyebrow="Configuración" title={editingId ? "Editar Servicio" : "Nuevo Servicio"}>
            <form onSubmit={editingId ? e => { e.preventDefault(); void saveEdit(); } : handleCreate} className="space-y-5">
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase font-bold text-stone-600 ml-1 tracking-widest">Nombre del Servicio</p>
                <input
                  type="text"
                  value={editingId ? editNombre : nombre}
                  onChange={e => editingId ? setEditNombre(e.target.value) : setNombre(e.target.value)}
                  placeholder="Ej: Basta de pantalón"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] uppercase font-bold text-stone-600 ml-1 tracking-widest">Precio Base (S/)</p>
                <input
                  type="number"
                  step="0.01"
                  value={editingId ? editPrecioBase : precioBase}
                  onChange={e => editingId ? setEditPrecioBase(e.target.value) : setPrecioBase(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white font-mono outline-none"
                />
              </div>

              {editingId && (
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-white/3 border border-white/5">
                  <div className={`size-5 rounded-md border flex items-center justify-center transition ${editActivo ? "bg-emerald-500 border-emerald-500" : "border-white/10 bg-white/5"}`}>
                    {editActivo && <CheckCircle2 className="size-3 text-white" />}
                  </div>
                  <input type="checkbox" checked={editActivo} onChange={e => setEditActivo(e.target.checked)} className="hidden" />
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-widest leading-none">Servicio Habilitado</span>
                </label>
              )}

              <div className="flex gap-3 pt-2">
                {editingId && (
                  <button type="button" onClick={() => setEditingId(null)} className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-bold text-stone-400 hover:bg-white/10 transition">Cancelar</button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-400 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : editingId ? "Guardar Cambios" : "Registrar Servicio"}
                </button>
              </div>
            </form>
          </Panel>
        </div>
      </div>

      {feedback && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-emerald-500/20 bg-[#0e0e0e] px-6 py-3 shadow-2xl shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom-5">
          <p className="text-sm text-emerald-400 font-bold flex items-center gap-2"><CheckCircle2 className="size-4" /> {feedback}</p>
        </div>
      )}
    </div>
  );
}
