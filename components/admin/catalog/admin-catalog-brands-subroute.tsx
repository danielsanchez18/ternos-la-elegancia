"use client";

import { useEffect, useMemo, useState } from "react";

import { apiGet, apiPatch, apiPost } from "@/components/admin/catalog/api";
import { catalogStatCard } from "@/components/admin/catalog/catalog-ui";
import type { AdminBrand } from "@/components/admin/catalog/types";

export default function AdminCatalogBrandsSubroute() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [nameDraftById, setNameDraftById] = useState<Record<string, string>>({});
  const [newBrandName, setNewBrandName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshBrands = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiGet<AdminBrand[]>("/api/brands");
      setBrands(response);
      setNameDraftById(
        Object.fromEntries(response.map((brand) => [brand.id, brand.nombre]))
      );
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "No se pudieron cargar las marcas."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshBrands();
  }, []);

  const activeBrands = useMemo(
    () => brands.filter((brand) => brand.activo).length,
    [brands]
  );

  const handleCreateBrand = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPost<AdminBrand>(
        "/api/brands",
        { nombre: newBrandName.trim(), activo: true },
        "No se pudo crear la marca."
      );
      setNewBrandName("");
      setFeedback("Marca creada correctamente.");
      await refreshBrands();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo crear la marca."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenameBrand = async (brand: AdminBrand) => {
    const nextName = (nameDraftById[brand.id] ?? "").trim();
    if (!nextName || nextName === brand.nombre) {
      return;
    }

    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPatch<AdminBrand>(
        `/api/brands/${brand.id}`,
        { nombre: nextName },
        "No se pudo actualizar la marca."
      );
      setFeedback("Marca actualizada correctamente.");
      await refreshBrands();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar la marca."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBrandActive = async (brand: AdminBrand) => {
    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPatch<AdminBrand>(
        `/api/brands/${brand.id}`,
        { activo: !brand.activo },
        "No se pudo actualizar el estado de la marca."
      );
      setFeedback(
        brand.activo
          ? "Marca desactivada correctamente."
          : "Marca activada correctamente."
      );
      await refreshBrands();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar el estado de la marca."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {catalogStatCard({
          title: "Marcas",
          value: brands.length,
          detail: "Registradas en catalogo",
        })}
        {catalogStatCard({
          title: "Activas",
          value: activeBrands,
          detail: "Disponibles para productos",
        })}
        {catalogStatCard({
          title: "Inactivas",
          value: brands.length - activeBrands,
          detail: "Ocultas temporalmente",
        })}
      </div>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
          Nueva marca
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Registrar marca</h2>

        <form onSubmit={handleCreateBrand} className="mt-4 flex flex-wrap gap-3">
          <input
            value={newBrandName}
            onChange={(event) => setNewBrandName(event.target.value)}
            placeholder="Nombre de marca"
            className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-stone-500"
            required
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
          >
            {isSaving ? "Guardando..." : "Crear marca"}
          </button>
        </form>
      </article>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Listado</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Marcas registradas</h2>
          </div>
          <button
            type="button"
            onClick={() => void refreshBrands()}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-stone-200 transition hover:bg-white/[0.06]"
          >
            Actualizar
          </button>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-stone-400">Cargando marcas...</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-500">
                <tr className="border-b border-white/8">
                  <th className="px-3 py-3 font-medium">Marca</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-10 text-center text-stone-500">
                      No hay marcas registradas.
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => (
                    <tr key={brand.id} className="border-b border-white/6">
                      <td className="px-3 py-4">
                        <input
                          value={nameDraftById[brand.id] ?? ""}
                          onChange={(event) =>
                            setNameDraftById((current) => ({
                              ...current,
                              [brand.id]: event.target.value,
                            }))
                          }
                          className="w-full max-w-sm rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white"
                        />
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${
                            brand.activo
                              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                              : "border-white/12 bg-white/[0.03] text-stone-400"
                          }`}
                        >
                          {brand.activo ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => void handleRenameBrand(brand)}
                            className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1.5 text-xs text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Guardar nombre
                          </button>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => void handleToggleBrandActive(brand)}
                            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-stone-200 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {brand.activo ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {feedback ? (
        <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}
    </section>
  );
}

