"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Power, PackagePlus } from "lucide-react";

import { apiGet, apiPatch, apiPost } from "@/components/admin/catalog/api";
import { AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";
import type { AdminBundle } from "@/components/admin/catalog/types";

type BundleDraft = {
  nombre: string;
  slug: string;
  descripcion: string;
  price: string;
  active: boolean;
};

const DEFAULT_BUNDLE_DRAFT: BundleDraft = {
  nombre: "",
  slug: "",
  descripcion: "",
  price: "0",
  active: true,
};

function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function formatMoney(value: string | number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "S/ 0.00";
  }
  return `S/ ${parsed.toFixed(2)}`;
}

export default function AdminCatalogBundlesSubroute() {
  const [bundles, setBundles] = useState<AdminBundle[]>([]);
  const [draft, setDraft] = useState<BundleDraft>(DEFAULT_BUNDLE_DRAFT);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshBundles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiGet<AdminBundle[]>("/api/bundles");
      setBundles(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "No se pudieron cargar los bundles."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshBundles();
  }, []);

  const handleCreateBundle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPost<AdminBundle>(
        "/api/bundles",
        {
          nombre: draft.nombre.trim(),
          slug: draft.slug.trim(),
          descripcion: draft.descripcion.trim() || undefined,
          price: Number.parseFloat(draft.price),
          active: draft.active,
        },
        "No se pudo crear el bundle."
      );
      setDraft(DEFAULT_BUNDLE_DRAFT);
      setIsSlugManuallyEdited(false);
      setFeedback("Paquete promocional creado.");
      await refreshBundles();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo crear el bundle."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBundleActive = async (bundle: AdminBundle) => {
    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPatch<AdminBundle>(
        `/api/bundles/${bundle.id}`,
        { active: !bundle.active },
        "No se pudo actualizar el estado del bundle."
      );
      setFeedback(
        bundle.active
          ? "Bundle pausado correctamente."
          : "Bundle activado para venta."
      );
      await refreshBundles();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar el estado del bundle."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <Panel eyebrow="Promociones" title="Crear Paquete (Bundle)">
        <form onSubmit={handleCreateBundle} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-xs text-stone-500 uppercase tracking-widest pl-1">
              Nombre Comercial
              <input
                value={draft.nombre}
                onChange={(event) => {
                  const nombre = event.target.value;
                  setDraft((current) => ({
                    ...current,
                    nombre,
                    slug: isSlugManuallyEdited ? current.slug : toSlug(nombre),
                  }));
                }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 outline-none focus:border-emerald-500/50 transition"
                required
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs text-stone-500 uppercase tracking-widest pl-1">
              Slug (URL)
              <input
                value={draft.slug}
                onChange={(event) => {
                  setIsSlugManuallyEdited(true);
                  setDraft((current) => ({
                    ...current,
                    slug: toSlug(event.target.value),
                  }));
                }}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500/50 transition"
                required
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs text-stone-500 uppercase tracking-widest pl-1">
              Precio Especial Bundle
              <input
                type="number"
                step="0.01"
                min="0"
                value={draft.price}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition"
                required
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-xs text-stone-500 uppercase tracking-widest pl-1">
            Descripción de la oferta
            <textarea
              value={draft.descripcion}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  descripcion: event.target.value,
                }))
              }
              rows={3}
              placeholder="Detalla qué incluye este paquete..."
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-stone-600 outline-none focus:border-emerald-500/50 transition"
            />
          </label>

          <footer className="flex items-center justify-between">
            <label className="inline-flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft(curr => ({ ...curr, active: e.target.checked }))}
                className="size-4 rounded border-white/10 bg-black/40 text-emerald-500 focus:ring-emerald-500/50"
              />
              <span className="text-sm text-stone-400 group-hover:text-stone-200 transition">Habilitar inmediatamente para venta</span>
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-emerald-500 px-8 py-2.5 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-2"
            >
              <PackagePlus className="size-4" />
              {isSaving ? "Creando..." : "Crear Bundle"}
            </button>
          </footer>
        </form>
      </Panel>

      <Panel eyebrow="Maestro" title="Paquetes Registrados">
        {isLoading ? (
          <div className="py-20 text-center animate-pulse font-mono text-stone-600 text-sm italic">
            Cargando ofertas...
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-500 uppercase tracking-widest text-[10px]">
                <tr className="border-b border-white/8">
                  <th className="px-3 py-3 font-medium">Nombre del Bundle</th>
                  <th className="px-3 py-3 font-medium text-center">Precio</th>
                  <th className="px-3 py-3 font-medium text-center">Contenido</th>
                  <th className="px-3 py-3 font-medium text-center">Estado</th>
                  <th className="px-3 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bundles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-20 text-center text-stone-500 italic">
                      No hay bundles configurados actualmente.
                    </td>
                  </tr>
                ) : (
                  bundles.map((bundle) => (
                    <tr key={bundle.id} className="group hover:bg-white/2">
                      <td className="px-3 py-6">
                        <p className="font-semibold text-white text-base">{bundle.nombre}</p>
                        <p className="mt-1 font-mono text-[10px] text-stone-500 uppercase tracking-tighter">
                          {bundle.slug}
                        </p>
                      </td>
                      <td className="px-3 py-6 text-center text-emerald-300 font-mono">
                        {formatMoney(bundle.price)}
                      </td>
                      <td className="px-3 py-6 text-center">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-stone-400">
                            {bundle.items.length} productos
                          </span>
                          <span className="text-[10px] text-stone-600">
                            {bundle.variantItems.length} variantes
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-6 text-center">
                        <div className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${bundle.active
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-white/10 bg-white/5 text-stone-500"
                          }`}>
                          {bundle.active ? "Activo" : "Inactivo"}
                        </div>
                      </td>
                      <td className="px-3 py-6 text-right">
                        <button
                          onClick={() => void handleToggleBundleActive(bundle)}
                          className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-tighter transition opacity-0 group-hover:opacity-100 ${bundle.active
                              ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                            }`}
                        >
                          {bundle.active ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-center">
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
