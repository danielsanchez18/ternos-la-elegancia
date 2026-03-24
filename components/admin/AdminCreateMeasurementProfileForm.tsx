"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Ruler } from "lucide-react";
import { GARMENT_OPTIONS } from "@/components/admin/customers/measurement-garments";
import {
  buildCreateMeasurementProfilePayload,
  resolveCustomerId,
} from "@/components/admin/customers/measurement-profile-form-helpers";

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-300/40";

const labelClasses = "text-xs uppercase tracking-[0.18em] text-stone-500";

export default function AdminCreateMeasurementProfileForm({
  customerId: initialCustomerId,
  customerName,
  customers = [],
  onSuccess,
}: {
  customerId?: number;
  customerName?: string;
  customers?: Array<{ id: number; name: string }>;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [customerIdInput, setCustomerIdInput] = useState(
    initialCustomerId?.toString() ?? ""
  );
  const [notes, setNotes] = useState("");
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split("T")[0]);
  const [selectedGarments, setSelectedGarments] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function toggleGarment(garment: string) {
    setSelectedGarments((previous) =>
      previous.includes(garment)
        ? previous.filter((item) => item !== garment)
        : [...previous, garment]
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const resolvedCustomer = resolveCustomerId(initialCustomerId, customerIdInput);
    if (!resolvedCustomer || Number.isNaN(resolvedCustomer)) {
      setErrorMessage("Ingresa un ID de cliente válido.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/customers/${resolvedCustomer}/measurement-profiles`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify(
              buildCreateMeasurementProfilePayload({
                notes,
                takenAt,
                selectedGarments,
              })
            ),
          }
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          setErrorMessage(payload?.error ?? "No se pudo crear el perfil de medidas.");
          return;
        }

        setSuccessMessage("Perfil creado correctamente.");
        setNotes("");
        setSelectedGarments([]);
        setTakenAt(new Date().toISOString().split("T")[0]);
        onSuccess?.();
        router.refresh();
      } catch {
        setErrorMessage("Ocurrió un problema al crear el perfil.");
      }
    });
  }

  return (
    <article className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
          Nuevo perfil
        </p>
        <h2 className="text-2xl font-semibold text-white">Crear perfil de medidas</h2>
        <p className="text-sm text-stone-400">
          Registra un nuevo perfil de medición
          {customerName ? (
            <>
              {" "}
              para <span className="font-medium text-white">{customerName}</span>
            </>
          ) : null}
          . Válido por 3 meses desde la fecha de toma.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {!initialCustomerId ? (
            <label className="space-y-1">
              <span className={labelClasses}>Cliente</span>
              {customers.length > 0 ? (
                <select
                  value={customerIdInput}
                  onChange={(event) => setCustomerIdInput(event.target.value)}
                  className={inputClasses}
                  required
                >
                  <option value="" disabled>
                    Selecciona un cliente...
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={customerIdInput}
                  onChange={(event) => setCustomerIdInput(event.target.value)}
                  placeholder="ID del cliente (ej: 1)"
                  className={inputClasses}
                  min={1}
                  required
                />
              )}
            </label>
          ) : null}
          <label className="space-y-1">
            <span className={labelClasses}>Fecha de toma</span>
            <input
              type="date"
              value={takenAt}
              onChange={(event) => setTakenAt(event.target.value)}
              className={inputClasses}
              required
            />
          </label>

          <label className="space-y-1">
            <span className={labelClasses}>Notas (opcional)</span>
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Observaciones del perfil..."
              className={inputClasses}
            />
          </label>
        </div>

        <div className="space-y-2">
          <p className={labelClasses}>Tipos de prenda</p>
          <div className="flex flex-wrap gap-2">
            {GARMENT_OPTIONS.map((garment) => {
              const isSelected = selectedGarments.includes(garment.value);

              return (
                <button
                  key={garment.value}
                  type="button"
                  onClick={() => toggleGarment(garment.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    isSelected
                      ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-200"
                      : "border-white/8 bg-white/[0.03] text-stone-400 hover:bg-white/[0.06]"
                  }`}
                >
                  {isSelected ? <span className="mr-1">✓</span> : null}
                  {garment.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-stone-500">
            {selectedGarments.length
              ? `${selectedGarments.length} seleccionados`
              : "Opcional — se pueden agregar después"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Ruler className="size-4" />
            {isPending ? "Creando..." : "Crear perfil"}
          </button>

          {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
          {successMessage ? (
            <p className="text-sm text-emerald-300">{successMessage}</p>
          ) : null}
        </div>
      </form>
    </article>
  );
}
