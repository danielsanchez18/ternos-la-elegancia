"use client";

import { useEffect, useMemo, useState } from "react";

import { apiGet, apiPatch, apiPost } from "@/components/admin/catalog/api";
import { catalogStatCard } from "@/components/admin/catalog/catalog-ui";
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

  const activeBundles = useMemo(
    () => bundles.filter((bundle) => bundle.active).length,
    [bundles]
  );

  const totalBundleItems = useMemo(
    () =>
      bundles.reduce(
        (accumulator, bundle) =>
          accumulator + bundle.items.length + bundle.variantItems.length,
        0
      ),
    [bundles]
  );

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
      setFeedback("Bundle creado correctamente.");
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
          ? "Bundle desactivado correctamente."
          : "Bundle activado correctamente."
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
      <div className="grid gap-4 md:grid-cols-3">
        {catalogStatCard({
          title: "Bundles",
          value: bundles.length,
          detail: "Paquetes comerciales",
        })}
        {catalogStatCard({
          title: "Activos",
          value: activeBundles,
          detail: "Disponibles para venta",
        })}
        {catalogStatCard({
          title: "Items ligados",
          value: totalBundleItems,
          detail: "Productos o variantes asociadas",
        })}
      </div>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
          Nuevo bundle
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Crear paquete</h2>

        <form onSubmit={handleCreateBundle} className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Nombre
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
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Slug
              <input
                value={draft.slug}
                onChange={(event) => {
                  setIsSlugManuallyEdited(true);
                  setDraft((current) => ({
                    ...current,
                    slug: toSlug(event.target.value),
                  }));
                }}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Precio
              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.price}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
                required
              />
            </label>

            <label className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs text-stone-300">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
              />
              Bundle activo
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs text-stone-300">
            Descripcion
            <textarea
              value={draft.descripcion}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  descripcion: event.target.value,
                }))
              }
              rows={3}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
          >
            {isSaving ? "Guardando..." : "Crear bundle"}
          </button>
        </form>
      </article>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Listado</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Bundles registrados</h2>
          </div>
          <button
            type="button"
            onClick={() => void refreshBundles()}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-stone-200 transition hover:bg-white/[0.06]"
          >
            Actualizar
          </button>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-stone-400">Cargando bundles...</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-stone-500">
                <tr className="border-b border-white/8">
                  <th className="px-3 py-3 font-medium">Bundle</th>
                  <th className="px-3 py-3 font-medium">Precio</th>
                  <th className="px-3 py-3 font-medium">Items</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 font-medium">Accion</th>
                </tr>
              </thead>
              <tbody>
                {bundles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-stone-500">
                      No hay bundles registrados.
                    </td>
                  </tr>
                ) : (
                  bundles.map((bundle) => (
                    <tr key={bundle.id} className="border-b border-white/6">
                      <td className="px-3 py-4">
                        <p className="font-medium text-white">{bundle.nombre}</p>
                        <p className="mt-1 text-xs text-stone-500">{bundle.slug}</p>
                      </td>
                      <td className="px-3 py-4 text-stone-300">
                        {formatMoney(bundle.price)}
                      </td>
                      <td className="px-3 py-4 text-stone-400">
                        {bundle.items.length} producto(s), {bundle.variantItems.length} variante(s)
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${
                            bundle.active
                              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                              : "border-white/12 bg-white/[0.03] text-stone-400"
                          }`}
                        >
                          {bundle.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => void handleToggleBundleActive(bundle)}
                          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-stone-200 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
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

