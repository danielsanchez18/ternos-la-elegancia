"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiGet, apiPatch, apiPost } from "@/components/admin/catalog/api";
import { catalogStatCard } from "@/components/admin/catalog/catalog-ui";
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
      setOptionDraft((current) =>
        current.definitionId &&
        !response.some((definition) => definition.id === current.definitionId)
          ? { ...current, definitionId: "" }
          : current
      );
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

  const totalOptions = useMemo(
    () =>
      definitions.reduce(
        (accumulator, definition) => accumulator + definition.options.length,
        0
      ),
    [definitions]
  );

  const activeOptions = useMemo(
    () =>
      definitions.reduce(
        (accumulator, definition) =>
          accumulator + definition.options.filter((option) => option.active).length,
        0
      ),
    [definitions]
  );

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
      setFeedback("Definicion creada correctamente.");
      await refreshDefinitions();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo crear la definicion."
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
          ? "Definicion desactivada correctamente."
          : "Definicion activada correctamente."
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
      setError("Selecciona una definicion para registrar la opcion.");
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
      setFeedback("Opcion creada correctamente.");
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
          ? "Opcion desactivada correctamente."
          : "Opcion activada correctamente."
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
      <div className="grid gap-4 md:grid-cols-4">
        {catalogStatCard({
          title: "Definiciones",
          value: definitions.length,
          detail: "Atributos registrados",
        })}
        {catalogStatCard({
          title: "Activas",
          value: definitions.filter((definition) => definition.active).length,
          detail: "Disponibles para catalogo",
        })}
        {catalogStatCard({
          title: "Opciones",
          value: totalOptions,
          detail: "Valores para selects",
        })}
        {catalogStatCard({
          title: "Opciones activas",
          value: activeOptions,
          detail: "Usables en frontend",
        })}
      </div>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
          Nueva definicion
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Crear atributo de catalogo
        </h2>

        <form onSubmit={handleCreateDefinition} className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Label
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
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Code
              <input
                value={definitionDraft.code}
                onChange={(event) => {
                  setIsCodeManuallyEdited(true);
                  setDefinitionDraft((current) => ({
                    ...current,
                    code: toCode(event.target.value),
                  }));
                }}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Scope
              <select
                value={definitionDraft.scope}
                onChange={(event) =>
                  setDefinitionDraft((current) => ({
                    ...current,
                    scope: event.target.value as DefinitionDraft["scope"],
                  }))
                }
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
              >
                {ATTRIBUTE_SCOPES.map((scope) => (
                  <option key={scope} value={scope}>
                    {scope}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Input
              <select
                value={definitionDraft.inputType}
                onChange={(event) =>
                  setDefinitionDraft((current) => ({
                    ...current,
                    inputType: event.target.value as DefinitionDraft["inputType"],
                  }))
                }
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
              >
                {INPUT_TYPES.map((inputType) => (
                  <option key={inputType} value={inputType}>
                    {inputType}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Aplica a tipo
              <select
                value={definitionDraft.appliesToKind}
                onChange={(event) =>
                  setDefinitionDraft((current) => ({
                    ...current,
                    appliesToKind: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
              >
                <option value="">Todos</option>
                {PRODUCT_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Orden
              <input
                type="number"
                min={0}
                value={definitionDraft.sortOrder}
                onChange={(event) =>
                  setDefinitionDraft((current) => ({
                    ...current,
                    sortOrder: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
              />
            </label>

            <label className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-xs text-stone-300">
              <input
                type="checkbox"
                checked={definitionDraft.active}
                onChange={(event) =>
                  setDefinitionDraft((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
              />
              Definicion activa
            </label>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
          >
            {isSaving ? "Guardando..." : "Crear definicion"}
          </button>
        </form>
      </article>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
          Nueva opcion
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Registrar opcion para definicion
        </h2>

        <form onSubmit={handleCreateOption} className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Definicion
              <select
                value={optionDraft.definitionId}
                onChange={(event) =>
                  setOptionDraft((current) => ({
                    ...current,
                    definitionId: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
                required
              >
                <option value="">Selecciona definicion</option>
                {definitions.map((definition) => (
                  <option key={definition.id} value={definition.id}>
                    {definition.label} ({definition.scope})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Label opcion
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
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Code opcion
              <input
                value={optionDraft.code}
                onChange={(event) => {
                  setIsOptionCodeManuallyEdited(true);
                  setOptionDraft((current) => ({
                    ...current,
                    code: toCode(event.target.value),
                  }));
                }}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-stone-300">
              Orden opcion
              <input
                type="number"
                min={0}
                value={optionDraft.sortOrder}
                onChange={(event) =>
                  setOptionDraft((current) => ({
                    ...current,
                    sortOrder: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm text-white"
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-stone-300">
            <input
              type="checkbox"
              checked={optionDraft.active}
              onChange={(event) =>
                setOptionDraft((current) => ({
                  ...current,
                  active: event.target.checked,
                }))
              }
            />
            Opcion activa
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/50"
          >
            {isSaving ? "Guardando..." : "Crear opcion"}
          </button>
        </form>
      </article>

      <article className="rounded-[1.75rem] border border-white/8 bg-black/25 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">Listado</p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Definiciones y opciones
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void refreshDefinitions()}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-stone-200 transition hover:bg-white/[0.06]"
          >
            Actualizar
          </button>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-stone-400">Cargando atributos...</p>
        ) : (
          <div className="mt-6 space-y-4">
            {definitions.length === 0 ? (
              <p className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-8 text-center text-sm text-stone-500">
                No hay definiciones registradas.
              </p>
            ) : (
              definitions.map((definition) => (
                <article
                  key={definition.id}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {definition.label} ({definition.code})
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {definition.scope} | {definition.inputType} |{" "}
                        {definition.appliesToKind ?? "Todos"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ${
                          definition.active
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                            : "border-white/12 bg-white/[0.03] text-stone-400"
                        }`}
                      >
                        {definition.active ? "Activa" : "Inactiva"}
                      </span>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => void handleToggleDefinitionActive(definition)}
                        className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-stone-200 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {definition.active ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {definition.options.length === 0 ? (
                      <p className="text-xs text-stone-500">Sin opciones registradas.</p>
                    ) : (
                      definition.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between rounded-lg border border-white/8 bg-black/25 px-3 py-2 text-xs"
                        >
                          <div>
                            <p className="text-stone-200">{option.label}</p>
                            <p className="text-stone-500">{option.code}</p>
                          </div>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() =>
                              void handleToggleOptionActive(option, option.active)
                            }
                            className={`rounded-md border px-2 py-1 ${
                              option.active
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                                : "border-white/10 bg-white/[0.03] text-stone-300"
                            }`}
                          >
                            {option.active ? "Activa" : "Inactiva"}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              ))
            )}
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
