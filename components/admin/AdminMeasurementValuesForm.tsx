"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import {
  GARMENT_LABELS,
  type MeasurementGarmentType,
} from "@/components/admin/customers/measurement-garments";
import {
  type FieldData,
  type ValuesResponse,
  buildInitialMeasurementValues,
  buildMeasurementPayloadValues,
} from "@/components/admin/customers/measurement-values-helpers";

export type { MeasurementGarmentType };

function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 my-auto w-full max-w-3xl">{children}</div>
    </div>
  );
}

function ModalCard({
  children,
  onClose,
  title,
  eyebrow,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  eyebrow: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/8 bg-[#0e0e0e] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-white/[0.06] hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-300/40";

export function MeasurementValuesFormContent({
  profileId,
  customerName,
  garmentType,
  onClose,
}: {
  profileId: number;
  customerName: string;
  garmentType: MeasurementGarmentType;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fields, setFields] = useState<FieldData[]>([]);
  const [values, setValues] = useState<Record<number, { num: string; txt: string }>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        const [fieldsRes, valuesRes] = await Promise.all([
          fetch(`/api/measurement-fields?garmentType=${garmentType}`),
          fetch(
            `/api/measurement-profiles/${profileId}/values?garmentType=${garmentType}`
          ),
        ]);

        if (!active) {
          return;
        }

        if (!fieldsRes.ok) {
          throw new Error("Could not fetch fields");
        }

        const fieldsData = (await fieldsRes.json()) as FieldData[];
        setFields(fieldsData);

        if (valuesRes.ok) {
          const valuesData = (await valuesRes.json()) as ValuesResponse;
          setValues(buildInitialMeasurementValues(valuesData));
        } else if (valuesRes.status !== 404) {
          throw new Error("Could not fetch values");
        } else {
          setValues({});
        }
      } catch {
        if (active) {
          setErrorMessage("Error al cargar los datos de la prenda.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      active = false;
    };
  }, [profileId, garmentType]);

  function handleValueChange(fieldId: number, type: "num" | "txt", value: string) {
    setValues((previous) => ({
      ...previous,
      [fieldId]: {
        ...(previous[fieldId] || { num: "", txt: "" }),
        [type]: value,
      },
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const buildResult = buildMeasurementPayloadValues(fields, values);

    if (buildResult.hasInvalidNumber) {
      setErrorMessage("Algunos valores numéricos son inválidos.");
      return;
    }

    if (buildResult.payload.length === 0) {
      setErrorMessage("Debes ingresar al menos una medida.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/measurement-profiles/${profileId}/values`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            garmentType,
            values: buildResult.payload,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          setErrorMessage(payload?.error ?? "No se pudieron guardar las medidas.");
          return;
        }

        router.refresh();
        onClose();
      } catch {
        setErrorMessage("Ocurrió un error de red al intentar guardar.");
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => {
            const value = values[field.id] || { num: "", txt: "" };

            return (
              <div
                key={field.id}
                className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
              >
                <p className="mb-3 text-xs uppercase tracking-[0.15em] text-stone-400">
                  {field.label}
                </p>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Valor ej: 42.5"
                      value={value.num}
                      onChange={(event) =>
                        handleValueChange(field.id, "num", event.target.value)
                      }
                      className={`${inputClasses} pr-8`}
                    />
                    {field.unit ? (
                      <span className="pointer-events-none absolute right-3 top-2.5 select-none text-xs font-medium text-stone-500">
                        {field.unit}
                      </span>
                    ) : null}
                  </div>
                  <input
                    type="text"
                    placeholder="Nota / Texto..."
                    value={value.txt}
                    onChange={(event) =>
                      handleValueChange(field.id, "txt", event.target.value)
                    }
                    className={inputClasses}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

      <div className="flex items-center gap-3 border-t border-white/8 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-stone-300 transition hover:bg-white/[0.06] disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Check className="size-4" />
          {isPending ? "Guardando..." : "Guardar medidas"}
        </button>
      </div>
    </form>
  );
}

export function MeasurementValuesModal({
  profileId,
  customerName,
  garmentType,
  onClose,
}: {
  profileId: number;
  customerName: string;
  garmentType: MeasurementGarmentType;
  onClose: () => void;
}) {
  return (
    <Overlay onClose={onClose}>
      <ModalCard
        onClose={onClose}
        eyebrow="Toma de medidas"
        title={GARMENT_LABELS[garmentType]}
      >
        <p className="mb-6 text-sm text-stone-400">
          Ingresando medidas para{" "}
          <span className="font-medium text-white">{customerName}</span>
        </p>
        <MeasurementValuesFormContent
          profileId={profileId}
          customerName={customerName}
          garmentType={garmentType}
          onClose={onClose}
        />
      </ModalCard>
    </Overlay>
  );
}
