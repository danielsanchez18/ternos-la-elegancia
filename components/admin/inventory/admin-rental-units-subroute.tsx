"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Shirt,
  CheckCircle2,
  RefreshCcw,
  AlertTriangle,
  Trash2,
  TrendingDown,
  Wand2
} from "lucide-react";

import { rentalUnitStatusChipClasses } from "@/components/admin/orders/order-status-styles";
import { formatStatusLabel } from "@/components/admin/orders/custom-order-shared";
import { AdminStatCard, AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";

type ProductOption = {
  id: string;
  nombre: string;
  allowsRental: boolean;
  active: boolean;
};

type RentalUnit = {
  id: string;
  productId: string;
  variantId: string | null;
  internalCode: string;
  sizeLabel: string | null;
  color: string | null;
  currentTier: string;
  normalPrice: number | string;
  premierePrice: number | string;
  status: string;
  notes: string | null;
  firstRentedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const ACTION_LABELS: Record<string, string> = {
  MARK_AVAILABLE: "Disponible",
  MARK_MAINTENANCE: "Mantenimiento",
  MARK_DAMAGED: "Dañado",
  MARK_RETIRED: "Retirar",
  MARK_NORMAL_TIER: "Pasar a NORMAL",
};

async function parseApiError(response: Response, fallback: string): Promise<string> {
  const payload = await response.json().catch(() => null);
  if (payload && typeof payload.error === "string") {
    return payload.error;
  }
  return fallback;
}

function getActionOptions(unit: RentalUnit): string[] {
  if (unit.status === "ALQUILADO") return [];
  const actions: string[] = [];
  if (unit.status !== "DISPONIBLE") actions.push("MARK_AVAILABLE");
  if (unit.status !== "EN_MANTENIMIENTO") actions.push("MARK_MAINTENANCE");
  if (unit.status !== "DANADO") actions.push("MARK_DAMAGED");
  if (unit.status !== "RETIRADO") actions.push("MARK_RETIRED");
  if (unit.currentTier !== "NORMAL") actions.push("MARK_NORMAL_TIER");
  return actions;
}

export default function AdminRentalUnitsSubroute() {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [units, setUnits] = useState<RentalUnit[]>([]);
  const [selectedActionByUnit, setSelectedActionByUnit] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [productId, setProductId] = useState("");
  const [internalCode, setInternalCode] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");
  const [color, setColor] = useState("");
  const [currentTier, setCurrentTier] = useState("ESTRENO");
  const [normalPrice, setNormalPrice] = useState("");
  const [premierePrice, setPremierePrice] = useState("");
  const [notes, setNotes] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p.nombre])),
    [products]
  );

  const availableProducts = useMemo(
    () => products.filter((p) => p.active),
    [products]
  );

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resProducts, resUnits] = await Promise.all([
        fetch("/api/products?active=true&allowsRental=true", { credentials: "include" }),
        fetch("/api/rental-units", { credentials: "include" }),
      ]);
      if (resProducts.ok && resUnits.ok) {
        setProducts(await resProducts.json());
        setUnits(await resUnits.json());
      }
    } catch {
      setError("Falla al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void refreshData(); }, []);

  const handleCreateUnit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/rental-units", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId, internalCode, sizeLabel, color,
          currentTier, normalPrice: Number(normalPrice),
          premierePrice: Number(premierePrice), notes
        }),
      });
      if (res.ok) {
        setFeedback("Pieza registrada correctamente.");
        setInternalCode(""); setSizeLabel(""); setColor("");
        setNormalPrice(""); setPremierePrice(""); setNotes("");
        await refreshData();
      } else {
        setError(await parseApiError(res, "No se pudo crear."));
      }
    } catch { setError("Error de red."); } finally { setIsSubmitting(false); }
  };

  const handleApplyAction = async (unit: RentalUnit) => {
    const action = selectedActionByUnit[unit.id];
    if (!action) return;
    setActiveUnitId(unit.id);
    try {
      const res = await fetch(`/api/rental-units/${unit.id}/actions`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setFeedback("Estado actualizado.");
        await refreshData();
      }
    } finally { setActiveUnitId(null); }
  };

  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const matchesSearch =
        u.internalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (productById.get(u.productId) || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [units, searchTerm, statusFilter, productById]);

  const stats = useMemo(() => ({
    total: units.length,
    available: units.filter(u => u.status === "DISPONIBLE").length,
    rented: units.filter(u => u.status === "ALQUILADO").length,
    maintenance: units.filter(u => u.status === "EN_MANTENIMIENTO").length,
  }), [units]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard title="Piezas en Stock" value={stats.total} detail="Inventario físico de renta" />
        <AdminStatCard title="Disponibles" value={stats.available} detail="Listas para checkout" />
        <AdminStatCard title="En uso (Alquiladas)" value={stats.rented} detail="Bloqueadas por contrato" />
        <AdminStatCard title="En Taller" value={stats.maintenance} detail="Mantenimiento o Dañadas" />
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 w-full space-y-6 min-w-0">
          <Panel eyebrow="Maestro" title="Control de Unidades Físicas">
            <div className="flex flex-col gap-4 border-b border-white/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Buscar por código o producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-4 text-sm text-stone-200 outline-none transition focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none rounded-xl border border-white/10 bg-black/40 py-2.5 pl-4 pr-10 text-sm text-stone-300 outline-none focus:border-emerald-500/50"
                  >
                    <option value="all">Filtro: Todos</option>
                    <option value="DISPONIBLE">Disponibles</option>
                    <option value="ALQUILADO">Alquilados</option>
                    <option value="EN_MANTENIMIENTO">Mantenimiento</option>
                    <option value="DANADO">Dañados</option>
                  </select>
                  <Filter className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-500" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="min-w-full text-left text-sm">
                <thead className="text-stone-500 uppercase tracking-widest text-[10px]">
                  <tr className="border-b border-white/8">
                    <th className="px-3 py-3 font-medium">Prenda (Código)</th>
                    <th className="px-3 py-3 font-medium text-center">Modelo / Talla</th>
                    <th className="px-3 py-3 font-medium text-center">Estado</th>
                    <th className="px-3 py-3 font-medium text-center">Tier / Precios</th>
                    <th className="px-3 py-3 font-medium text-right">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr><td colSpan={5} className="py-20 text-center animate-pulse font-mono text-stone-600 italic">Analizando inventario...</td></tr>
                  ) : filteredUnits.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-stone-500 italic">No hay resultados.</td></tr>
                  ) : (
                    filteredUnits.map((u) => {
                      const options = getActionOptions(u);
                      return (
                        <tr key={u.id} className="group hover:bg-white/2 transition-colors">
                          <td className="px-3 py-5">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-white/5 p-2 transition group-hover:bg-emerald-500/10">
                                <Shirt className="size-4 text-stone-400 group-hover:text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-base font-bold text-white">{u.internalCode}</p>
                                <p className="text-[10px] text-stone-500 uppercase font-mono mt-0.5 tracking-tighter">ID: {u.id.split("-")[0]}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-5 text-center">
                            <p className="text-sm font-semibold text-stone-300">{productById.get(u.productId) || "Producto"}</p>
                            <p className="text-[10px] text-stone-600 uppercase tracking-widest mt-1">
                              {u.sizeLabel || "--"} / {u.color || "--"}
                            </p>
                          </td>
                          <td className="px-3 py-5 text-center">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${rentalUnitStatusChipClasses(u.status)}`}>
                              {formatStatusLabel(u.status)}
                            </span>
                          </td>
                          <td className="px-3 py-5 text-center">
                            <p className="text-[10px] font-bold text-stone-500 uppercase mb-1">{u.currentTier}</p>
                            <div className="font-mono text-[10px] text-emerald-100 bg-white/5 rounded-lg py-1 px-2 inline-block">
                              S/ {Number(u.normalPrice).toFixed(0)} <span className="mx-1 text-white/20">|</span>
                              <span className="text-violet-300">S/ {Number(u.premierePrice).toFixed(0)}</span>
                            </div>
                          </td>
                          <td className="px-3 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              {options.length > 0 ? (
                                <div className="flex bg-black/40 rounded-xl border border-white/5 p-1">
                                  <select
                                    value={selectedActionByUnit[u.id] || ""}
                                    onChange={(e) => setSelectedActionByUnit(curr => ({ ...curr, [u.id]: e.target.value }))}
                                    className="bg-transparent border-none text-[10px] text-stone-400 uppercase font-bold px-2 py-1 outline-none"
                                  >
                                    <option value="">Acción</option>
                                    {options.map(opt => <option key={opt} value={opt}>{ACTION_LABELS[opt] || opt}</option>)}
                                  </select>
                                  <button
                                    onClick={() => void handleApplyAction(u)}
                                    disabled={activeUnitId === u.id || !selectedActionByUnit[u.id]}
                                    className="rounded-lg bg-emerald-500/10 text-emerald-400 p-1.5 hover:bg-emerald-500/20 disabled:opacity-0 transition"
                                  >
                                    <CheckCircle2 className="size-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-stone-700 uppercase font-bold mr-2">Bloqueado</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="w-full xl:w-[400px] shrink-0">
          <Panel eyebrow="Registro" title="Nueva Unidad">
            <form onSubmit={handleCreateUnit} className="space-y-4">
              <div>
                <p className="text-[9px] uppercase font-bold text-stone-600 mb-2 ml-1 tracking-[.2em]">Selección de Prenda</p>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50 transition"
                  required
                >
                  <option value="">Selecciona un producto...</option>
                  {availableProducts.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <label className="space-y-1.5 flex-1">
                  <span className="text-[9px] uppercase font-bold text-stone-600 tracking-widest ml-1">Código</span>
                  <input
                    value={internalCode}
                    onChange={(e) => setInternalCode(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm font-mono text-emerald-400 outline-none"
                    required
                  />
                </label>
                <label className="space-y-1.5 flex-1">
                  <span className="text-[9px] uppercase font-bold text-stone-600 tracking-widest ml-1">Tier</span>
                  <select
                    value={currentTier}
                    onChange={(e) => setCurrentTier(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-stone-300 outline-none"
                  >
                    <option value="ESTRENO">ESTRENO</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <label className="space-y-1.5 flex-1">
                  <span className="text-[9px] uppercase font-bold text-stone-600 tracking-widest ml-1">Talla</span>
                  <input
                    value={sizeLabel}
                    onChange={(e) => setSizeLabel(e.target.value)}
                    placeholder="Ej: 50/44"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none"
                  />
                </label>
                <label className="space-y-1.5 flex-1">
                  <span className="text-[9px] uppercase font-bold text-stone-600 tracking-widest ml-1">Color</span>
                  <input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <label className="space-y-1.5 flex-1">
                  <span className="text-[9px] uppercase font-bold text-stone-600 tracking-widest ml-1">Precio Normal</span>
                  <input
                    type="number"
                    value={normalPrice}
                    onChange={(e) => setNormalPrice(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm font-mono text-white outline-none"
                    required
                  />
                </label>
                <label className="space-y-1.5 flex-1">
                  <span className="text-[9px] uppercase font-bold text-stone-600 tracking-widest ml-1">Precio Estreno</span>
                  <input
                    type="number"
                    value={premierePrice}
                    onChange={(e) => setPremierePrice(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm font-mono text-violet-300 outline-none"
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {isSubmitting ? "Registrando..." : "Crear Unidad"}
              </button>
            </form>
          </Panel>
        </div>
      </div>

      {feedback && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-emerald-500/20 bg-[#0e0e0e] px-6 py-3 shadow-2xl shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-sm text-emerald-300 font-medium flex items-center gap-2">
            <Wand2 className="size-4" />
            {feedback}
          </p>
        </div>
      )}
    </div>
  );
}
