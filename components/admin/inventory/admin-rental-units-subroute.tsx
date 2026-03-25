"use client";

import { useEffect, useMemo, useState } from "react";

import { rentalUnitStatusChipClasses } from "@/components/admin/orders/order-status-styles";
import { formatStatusLabel } from "@/components/admin/orders/custom-order-shared";

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
  MARK_DAMAGED: "Danado",
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
  if (unit.status === "ALQUILADO") {
    return [];
  }

  const actions: string[] = [];

  if (unit.status !== "DISPONIBLE") {
    actions.push("MARK_AVAILABLE");
  }
  if (unit.status !== "EN_MANTENIMIENTO") {
    actions.push("MARK_MAINTENANCE");
  }
  if (unit.status !== "DANADO") {
    actions.push("MARK_DAMAGED");
  }
  if (unit.status !== "RETIRADO") {
    actions.push("MARK_RETIRED");
  }
  if (unit.currentTier !== "NORMAL") {
    actions.push("MARK_NORMAL_TIER");
  }

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

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product.nombre])),
    [products]
  );

  const availableProducts = useMemo(
    () => products.filter((product) => product.active),
    [products]
  );

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [productsResponse, unitsResponse] = await Promise.all([
        fetch("/api/products?active=true&allowsRental=true", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/rental-units", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (!productsResponse.ok || !unitsResponse.ok) {
        setError("No se pudo cargar la data de unidades de renta.");
        return;
      }

      const productsPayload = (await productsResponse.json()) as ProductOption[];
      const unitsPayload = (await unitsResponse.json()) as RentalUnit[];
      setProducts(Array.isArray(productsPayload) ? productsPayload : []);
      setUnits(Array.isArray(unitsPayload) ? unitsPayload : []);
    } catch {
      setError("Error de red al cargar unidades de renta.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshData();
  }, []);

  const handleCreateUnit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setError(null);

    if (!productId || !internalCode.trim()) {
      setError("Producto e codigo interno son obligatorios.");
      return;
    }

    if (!normalPrice.trim() || !premierePrice.trim()) {
      setError("Registra precio normal y precio estreno.");
      return;
    }

    const parsedNormalPrice = Number(normalPrice);
    const parsedPremierePrice = Number(premierePrice);

    if (
      !Number.isFinite(parsedNormalPrice) ||
      !Number.isFinite(parsedPremierePrice) ||
      parsedNormalPrice < 0 ||
      parsedPremierePrice < 0
    ) {
      setError("Precios invalidos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rental-units", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          internalCode: internalCode.trim(),
          sizeLabel: sizeLabel.trim() || undefined,
          color: color.trim() || undefined,
          currentTier,
          normalPrice: parsedNormalPrice,
          premierePrice: parsedPremierePrice,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        setError(await parseApiError(response, "No se pudo crear la unidad."));
        return;
      }

      setFeedback("Unidad de renta creada.");
      setInternalCode("");
      setSizeLabel("");
      setColor("");
      setCurrentTier("ESTRENO");
      setNormalPrice("");
      setPremierePrice("");
      setNotes("");
      await refreshData();
    } catch {
      setError("Error de red al crear la unidad.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyAction = async (unit: RentalUnit) => {
    const action = selectedActionByUnit[unit.id];
    if (!action) {
      setError("Selecciona una accion para la unidad.");
      return;
    }

    setActiveUnitId(unit.id);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(`/api/rental-units/${unit.id}/actions`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        setError(await parseApiError(response, "No se pudo aplicar la accion."));
        return;
      }

      setFeedback("Unidad actualizada.");
      await refreshData();
    } catch {
      setError("Error de red al aplicar accion.");
    } finally {
      setActiveUnitId(null);
    }
  };

  const availableUnits = units.filter((unit) => unit.status === "DISPONIBLE").length;
  const rentedUnits = units.filter((unit) => unit.status === "ALQUILADO").length;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Unidades</p>
          <p className="mt-3 text-3xl font-semibold text-white">{units.length}</p>
          <p className="mt-2 text-sm text-stone-400">Piezas fisicas registradas.</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Disponibles</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-200">{availableUnits}</p>
          <p className="mt-2 text-sm text-stone-400">Listas para alquilar.</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Alquiladas</p>
          <p className="mt-3 text-3xl font-semibold text-blue-300">{rentedUnits}</p>
          <p className="mt-2 text-sm text-stone-400">Bloqueadas por orden activa.</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Productos</p>
          <p className="mt-3 text-3xl font-semibold text-white">{availableProducts.length}</p>
          <p className="mt-2 text-sm text-stone-400">Catalogo activo en admin.</p>
        </article>
      </div>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Nueva unidad</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Registrar unidad de renta</h2>

        <form onSubmit={handleCreateUnit} className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Producto
            <select
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
              required
            >
              <option value="">Selecciona producto</option>
              {availableProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Codigo interno
            <input
              type="text"
              value={internalCode}
              onChange={(event) => setInternalCode(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Tier inicial
            <select
              value={currentTier}
              onChange={(event) => setCurrentTier(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
            >
              <option value="ESTRENO">ESTRENO</option>
              <option value="NORMAL">NORMAL</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Talla
            <input
              type="text"
              value={sizeLabel}
              onChange={(event) => setSizeLabel(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Color
            <input
              type="text"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Nota
            <input
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Precio normal
            <input
              type="number"
              min="0"
              step="0.01"
              value={normalPrice}
              onChange={(event) => setNormalPrice(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
              required
            />
            <span className="text-[11px] text-stone-500">Obligatorio</span>
          </label>

          <label className="flex flex-col gap-1 text-sm text-stone-300">
            Precio estreno
            <input
              type="number"
              min="0"
              step="0.01"
              value={premierePrice}
              onChange={(event) => setPremierePrice(event.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white"
              required
            />
            <span className="text-[11px] text-stone-500">Obligatorio</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:self-end inline-flex h-[42px] items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
          >
            {isSubmitting ? "Guardando..." : "Crear unidad"}
          </button>
        </form>

        {feedback && (
          <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
            {feedback}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        )}
      </article>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Listado</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Unidades de renta</h2>
          </div>
          <button
            onClick={() => void refreshData()}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-stone-200 transition hover:bg-white/[0.06]"
          >
            Actualizar
          </button>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-stone-400">Cargando unidades...</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-500">
                <tr className="border-b border-white/8">
                  <th className="px-3 py-3 font-medium">Unidad</th>
                  <th className="px-3 py-3 font-medium">Producto</th>
                  <th className="px-3 py-3 font-medium">Tier/Estado</th>
                  <th className="px-3 py-3 font-medium">Precios</th>
                  <th className="px-3 py-3 font-medium">Accion</th>
                </tr>
              </thead>
              <tbody>
                {units.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-stone-500">
                      No hay unidades registradas.
                    </td>
                  </tr>
                ) : (
                  units.map((unit) => {
                    const options = getActionOptions(unit);
                    const selectedAction = selectedActionByUnit[unit.id] ?? "";

                    return (
                      <tr key={unit.id} className="border-b border-white/6 align-top">
                        <td className="px-3 py-4">
                          <p className="font-medium text-white">{unit.internalCode}</p>
                          <p className="mt-1 text-xs text-stone-500">
                            {unit.sizeLabel ?? "--"} / {unit.color ?? "--"}
                          </p>
                        </td>
                        <td className="px-3 py-4 text-stone-200">
                          {productById.get(unit.productId) ?? unit.productId}
                        </td>
                        <td className="px-3 py-4">
                          <p className="text-xs text-stone-400">Tier: {unit.currentTier}</p>
                          <span
                            className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${rentalUnitStatusChipClasses(unit.status)}`}
                          >
                            {formatStatusLabel(unit.status)}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-xs text-stone-300">
                          <p>Normal: S/ {Number(unit.normalPrice).toFixed(2)}</p>
                          <p className="mt-1">
                            Estreno: S/ {Number(unit.premierePrice).toFixed(2)}
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          {options.length === 0 ? (
                            <p className="text-xs text-stone-500">Sin acciones disponibles</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <select
                                value={selectedAction}
                                onChange={(event) =>
                                  setSelectedActionByUnit((current) => ({
                                    ...current,
                                    [unit.id]: event.target.value,
                                  }))
                                }
                                className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-xs text-white"
                              >
                                <option value="">Selecciona accion</option>
                                {options.map((action) => (
                                  <option key={action} value={action}>
                                    {ACTION_LABELS[action] ?? action}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => void handleApplyAction(unit)}
                                disabled={activeUnitId === unit.id}
                                className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Aplicar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}
