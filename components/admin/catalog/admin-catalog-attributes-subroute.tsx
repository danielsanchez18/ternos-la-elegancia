"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles, Power, Settings2, Plus } from "lucide-react";

import { apiGet, apiPatch, apiPost } from "@/components/admin/catalog/api";
import { AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";
import type {
  AdminCatalogAttributeDefinition,
  AdminCatalogAttributeOption,
} from "@/components/admin/catalog/types";

const ATTRIBUTE_SCOPES = ["PRODUCT", "VARIANT"] as const;
const INPUT_TYPES = [
  "SELECT",
  "MULTISELECT",
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "BOOLEAN",
  "COLOR",
] as const;
const PRODUCT_KINDS = [
  "TERNO",
  "SACO",
  "PANTALON",
  "CAMISA",
  "BLUSA",
  "CHALECO",
  "ACCESORIO",
  "SMOKING",
  "BUNDLE",
] as const;

type DefinitionDraft = {
  code: string;
  label: string;
  scope: (typeof ATTRIBUTE_SCOPES)[number];
  inputType: (typeof INPUT_TYPES)[number];
  appliesToKind: string;
  sortOrder: string;
  active: boolean;
};

type OptionDraft = {
  definitionId: string;
  code: string;
  label: string;
  sortOrder: string;
  active: boolean;
};

const DEFAULT_DEFINITION_DRAFT: DefinitionDraft = {
  code: "",
  label: "",
  scope: "PRODUCT",
  inputType: "SELECT",
  appliesToKind: "",
  sortOrder: "0",
  active: true,
};

const DEFAULT_OPTION_DRAFT: OptionDraft = {
  definitionId: "",
  code: "",
  label: "",
  sortOrder: "0",
  active: true,
};

function toCode(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function AdminCatalogAttributesSubroute() {
  const [definitions, setDefinitions] = useState<AdminCatalogAttributeDefinition[]>(
    []
  );
  const [definitionDraft, setDefinitionDraft] = useState<DefinitionDraft>(
    DEFAULT_DEFINITION_DRAFT
  );
  const [optionDraft, setOptionDraft] = useState<OptionDraft>(DEFAULT_OPTION_DRAFT);
  const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);
  const [isOptionCodeManuallyEdited, setIsOptionCodeManuallyEdited] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshDefinitions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiGet<AdminCatalogAttributeDefinition[]>(
        "/api/catalog/attribute-definitions"
      );
      setDefinitions(response);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "No se pudieron cargar los atributos."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshDefinitions();
  }, [refreshDefinitions]);

  const handleCreateDefinition = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPost<AdminCatalogAttributeDefinition>(
        "/api/catalog/attribute-definitions",
        {
          code: definitionDraft.code.trim(),
          label: definitionDraft.label.trim(),
          scope: definitionDraft.scope,
          inputType: definitionDraft.inputType,
          appliesToKind: definitionDraft.appliesToKind || null,
          sortOrder: Number.parseInt(definitionDraft.sortOrder, 10),
          active: definitionDraft.active,
        },
        "No se pudo crear la definicion de atributo."
      );

      setDefinitionDraft(DEFAULT_DEFINITION_DRAFT);
      setIsCodeManuallyEdited(false);
      setFeedback("Atributo definido correctamente.");
      await refreshDefinitions();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo crear el atributo."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDefinitionActive = async (
    definition: AdminCatalogAttributeDefinition
  ) => {
    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPatch<AdminCatalogAttributeDefinition>(
        `/api/catalog/attribute-definitions/${definition.id}`,
        { active: !definition.active },
        "No se pudo actualizar la definicion."
      );
      setFeedback(
        definition.active
          ? "Definición desactivada."
          : "Definición reactivada."
      );
      await refreshDefinitions();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar la definicion."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateOption = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!optionDraft.definitionId) {
      setError("Selecciona un atributo para añadir la opción.");
      return;
    }

    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPost<AdminCatalogAttributeOption>(
        `/api/catalog/attribute-definitions/${optionDraft.definitionId}/options`,
        {
          code: optionDraft.code.trim(),
          label: optionDraft.label.trim(),
          sortOrder: Number.parseInt(optionDraft.sortOrder, 10),
          active: optionDraft.active,
        },
        "No se pudo crear la opcion."
      );

      setOptionDraft((current) => ({
        ...DEFAULT_OPTION_DRAFT,
        definitionId: current.definitionId,
      }));
      setIsOptionCodeManuallyEdited(false);
      setFeedback("Opción registrada con éxito.");
      await refreshDefinitions();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "No se pudo crear la opcion."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleOptionActive = async (
    option: AdminCatalogAttributeOption,
    currentActive: boolean
  ) => {
    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await apiPatch<AdminCatalogAttributeOption>(
        `/api/catalog/attribute-options/${option.id}`,
        { active: !currentActive },
        "No se pudo actualizar la opcion."
      );
      setFeedback(
        currentActive
          ? "Opción desactivada."
          : "Opción activada."
      );
      await refreshDefinitions();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar la opcion."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel eyebrow="Definiciones" title="Configurar Atributo">
          <form onSubmit={handleCreateDefinition} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs text-stone-500 uppercase tracking-widest pl-1">
                Nombre Visible (Label)
                <input
                  value={definitionDraft.label}
                  onChange={(event) => {
                    const label = event.target.value;
                    setDefinitionDraft((current) => ({
                      ...current,
                      label,
                      code: isCodeManuallyEdited ? current.code : toCode(label),
                    }));
                  }}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 transition"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs text-stone-500 uppercase tracking-widest pl-1">
                Código Interno (Slug)
                <input
                  value={definitionDraft.code}
                  onChange={(event) => {
                    setIsCodeManuallyEdited(true);
                    setDefinitionDraft((current) => ({
                      ...current,
                      code: toCode(event.target.value),
                    }));
                  }}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-mono text-emerald-400 outline-none focus:border-emerald-500/50 transition"
                  required
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs text-stone-500 uppercase tracking-widest pl-1">
                Nivel Aplicable (Scope)
                <select
                  value={definitionDraft.scope}
                  onChange={(e) => setDefinitionDraft(curr => ({ ...curr, scope: e.target.value as any }))}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-stone-200 outline-none focus:border-emerald-500/50 transition"
                >
                  {ATTRIBUTE_SCOPES.map(s => <option key={s} value={s}>{s === "PRODUCT" ? "Producto Base" : "Variante Específica"}</option>)}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs text-stone-500 uppercase tracking-widest pl-1">
                Tipo de Selección
                <select
                  value={definitionDraft.inputType}
                  onChange={(e) => setDefinitionDraft(curr => ({ ...curr, inputType: e.target.value as any }))}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-stone-200 outline-none focus:border-emerald-500/50 transition"
                >
                  {INPUT_TYPES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </label>
            </div>

            <footer className="flex items-center justify-between pt-2">
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={definitionDraft.active}
                  onChange={(e) => setDefinitionDraft(curr => ({ ...curr, active: e.target.checked }))}
                  className="size-4 rounded border-white/10 bg-black/40 text-emerald-500"
                />
                <span className="text-xs text-stone-400">Atributo activo</span>
              </label>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:opacity-50"
              >
                Crear Atributo
              </button>
            </footer>
          </form>
        </Panel>

        <Panel eyebrow="Opciones" title="Añadir Valores">
          <form onSubmit={handleCreateOption} className="space-y-4">
            <label className="flex flex-col gap-1.5 text-xs text-stone-500 uppercase tracking-widest pl-1">
              Atributo Maestro
              <select
                value={optionDraft.definitionId}
                onChange={(e) => setOptionDraft(curr => ({ ...curr, definitionId: e.target.value }))}
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-stone-200 outline-none focus:border-emerald-500/50 transition"
                required
              >
                <option value="">Selecciona un atributo...</option>
                {definitions.map(d => <option key={d.id} value={d.id}>{d.label} [{d.scope}]</option>)}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs text-stone-500 uppercase tracking-widest pl-1">
                Etiqueta Opción
                <input
                  value={optionDraft.label}
                  onChange={(event) => {
                    const label = event.target.value;
                    setOptionDraft((current) => ({
                      ...current,
                      label,
                      code: isOptionCodeManuallyEdited ? current.code : toCode(label),
                    }));
                  }}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 transition"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs text-stone-500 uppercase tracking-widest pl-1">
                Código Valor
                <input
                  value={optionDraft.code}
                  onChange={(event) => {
                    setIsOptionCodeManuallyEdited(true);
                    setOptionDraft((current) => ({
                      ...current,
                      code: toCode(event.target.value),
                    }));
                  }}
                  className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm font-mono text-cyan-400 outline-none focus:border-emerald-500/50 transition"
                  required
                />
              </label>
            </div>

            <footer className="flex items-center justify-between pt-2">
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optionDraft.active}
                  onChange={(e) => setOptionDraft(curr => ({ ...curr, active: e.target.checked }))}
                  className="size-4 rounded border-white/10 bg-black/40 text-cyan-500"
                />
                <span className="text-xs text-stone-400">Valor activo</span>
              </label>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="size-4" />
                Añadir Opción
              </button>
            </footer>
          </form>
        </Panel>
      </div>

      <Panel eyebrow="Maestro" title="Definiciones y Diccionario de Valores">
        {isLoading ? (
          <div className="py-20 text-center animate-pulse text-sm text-stone-600 font-mono italic">
            Sincronizando definiciones...
          </div>
        ) : (
          <div className="mt-4 grid gap-6">
            {definitions.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl">
                <p className="text-stone-500 text-sm font-mono">No hay atributos definidos en el catálogo.</p>
              </div>
            ) : (
              definitions.map((def) => (
                <article key={def.id} className="rounded-[2rem] border border-white/5 bg-white/1 p-6 group transition hover:bg-white/2">
                  <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-white/5 p-3">
                        <Settings2 className="size-5 text-stone-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{def.label}</h4>
                        <p className="font-mono text-[10px] text-emerald-400 uppercase tracking-tighter mt-0.5">
                          {def.code} • {def.scope} • {def.inputType}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => void handleToggleDefinitionActive(def)}
                      className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition opacity-0 group-hover:opacity-100 ${def.active ? "text-stone-500 hover:text-rose-300" : "text-emerald-500 hover:text-emerald-400"
                        }`}
                    >
                      {def.active ? "Desactivar" : "Reactivar Atributo"}
                    </button>
                  </header>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {def.options.map((opt) => (
                      <div key={opt.id} className="group/opt flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-3 transition hover:border-white/10 hover:bg-black/40">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-white">{opt.label}</span>
                          <span className="font-mono text-[9px] text-stone-600 uppercase">{opt.code}</span>
                        </div>
                        <button
                          onClick={() => void handleToggleOptionActive(opt, opt.active)}
                          className={`size-2 rounded-full transition-all ring-4 ring-transparent ${opt.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-stone-700 opacity-50 group-hover/opt:ring-rose-500/20"}`}
                        />
                      </div>
                    ))}
                    {def.options.length === 0 && (
                      <p className="text-xs text-stone-600 italic py-2 pl-2">Sin opciones configuradas.</p>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </Panel>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-center">
          <p className="text-sm text-rose-300 font-medium">{error}</p>
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
