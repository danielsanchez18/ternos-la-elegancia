"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Save, Power } from "lucide-react";

import { apiGet, apiPatch, apiPost } from "@/components/admin/catalog/api";
import { AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";
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
      setFeedback("Marca actualizada con éxito.");
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
      <Panel eyebrow="Maestro" title="Gestión de Marcas">
        <form onSubmit={handleCreateBrand} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <p className="mb-1.5 text-[10px] text-stone-500 uppercase tracking-widest pl-1">Nueva Marca</p>
            <input
              value={newBrandName}
              onChange={(event) => setNewBrandName(event.target.value)}
              placeholder="Ej: Scabal, Loro Piana..."
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 outline-none focus:border-emerald-500/50 transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Crear marca"}
          </button>
        </form>

        <div className="mt-12 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-stone-500 uppercase tracking-widest text-[10px]">
              <tr className="border-b border-white/8">
                <th className="px-3 py-3 font-medium">Nombre de Marca</th>
                <th className="px-3 py-3 font-medium text-center">Estado</th>
                <th className="px-3 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-20 text-center text-stone-500 font-mono italic">
                    Sin marcas registradas actualmente.
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id} className="group hover:bg-white/2">
                    <td className="px-3 py-4">
                      <input
                        value={nameDraftById[brand.id] ?? ""}
                        onChange={(e) => setNameDraftById(curr => ({ ...curr, [brand.id]: e.target.value }))}
                        className="w-full max-w-sm rounded-lg border border-transparent bg-transparent px-3 py-2 text-base font-semibold text-white transition hover:border-white/5 focus:bg-white/5 focus:border-emerald-500/30 outline-none"
                      />
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${brand.activo
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : "border-white/10 bg-white/5 text-stone-500"
                        }`}>
                        {brand.activo ? "Activa" : "Inactiva"}
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => void handleRenameBrand(brand)}
                          title="Guardar nombre"
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition"
                        >
                          <Save className="size-4" />
                        </button>
                        <button
                          onClick={() => void handleToggleBrandActive(brand)}
                          title={brand.activo ? "Desactivar" : "Activar"}
                          className="p-2 rounded-lg bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white transition"
                        >
                          <Power className="size-4" />
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

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-center animate-in fade-in zoom-in-95 duration-300">
          <p className="text-sm text-rose-300 font-medium">Error: {error}</p>
        </div>
      )}

      {feedback && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-emerald-500/20 bg-[#0e0e0e] px-6 py-3 shadow-2xl shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-sm text-emerald-300 font-medium flex items-center gap-2">
            <Sparkles className="size-4" />
            {feedback}
          </p>
        </div>
      )}
    </section>
  );
}
