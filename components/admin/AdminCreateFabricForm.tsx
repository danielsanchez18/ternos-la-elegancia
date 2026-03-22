"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  code: string;
  nombre: string;
  color: string;
  supplier: string;
  composition: string;
  pattern: string;
  metersInStock: number;
  minMeters: number;
  costPerMeter: number;
  pricePerMeter: number;
};

const initialFormState: FormState = {
  code: "",
  nombre: "",
  color: "",
  supplier: "",
  composition: "",
  pattern: "",
  metersInStock: 0,
  minMeters: 5,
  costPerMeter: 0,
  pricePerMeter: 0,
};

export default function AdminCreateFabricForm({
  onClose,
}: {
  onClose?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/fabrics", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            code: form.code.trim(),
            nombre: form.nombre.trim(),
            color: form.color.trim() || null,
            supplier: form.supplier.trim() || null,
            composition: form.composition.trim() || null,
            pattern: form.pattern.trim() || null,
            metersInStock: Number(form.metersInStock),
            minMeters: Number(form.minMeters),
            costPerMeter: Number(form.costPerMeter) || null,
            pricePerMeter: Number(form.pricePerMeter) || null,
            active: true,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error: { message: string } }
            | null;
          setErrorMessage(payload?.error?.message ?? "Error inesperado al crear tela.");
          return;
        }

        setForm(initialFormState);
        setSuccessMessage("Tela registrada correctamente.");
        router.refresh();

        if (onClose) {
          setTimeout(onClose, 1500);
        }
      } catch (err) {
        setErrorMessage("Error de red.");
      }
    });
  }

  const inputClasses =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-stone-500 outline-none transition focus:border-emerald-500/50 focus:bg-white/10";
  const labelClasses = "block text-xs font-medium text-stone-400";

  return (
    <article className="rounded-[2rem] border border-white/8 bg-black/30 p-6 overflow-y-auto max-h-[85vh] relative">
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Registro rápido
            </p>
            <h2 className="text-2xl font-semibold text-white">Nueva Tela</h2>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-sm text-stone-400">
          Añade un nuevo rollo o tipo de tela al catálogo. Si ya tienes stock, añádelo aquí bajo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2">
            <span className={labelClasses}>Nombre de la tela *</span>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
              placeholder="Ej: Casimir Super 120s"
              className={inputClasses}
              required
            />
          </label>

          <label className="space-y-1 items-stretch">
            <span className={labelClasses}>Código Interno *</span>
            <input
              type="text"
              value={form.code}
              onChange={(e) => updateField("code", e.target.value.toUpperCase())}
              placeholder="Ej: CAS-001"
              className={`${inputClasses} uppercase`}
              required
            />
          </label>

          <label className="space-y-1">
            <span className={labelClasses}>Color (Opcional)</span>
            <input
              type="text"
              value={form.color}
              onChange={(e) => updateField("color", e.target.value)}
              placeholder="Ej: Azul Noche"
              className={inputClasses}
            />
          </label>

          <label className="space-y-1">
            <span className={labelClasses}>Patrón (Opcional)</span>
            <input
              type="text"
              value={form.pattern}
              onChange={(e) => updateField("pattern", e.target.value)}
              placeholder="Ej: Rayas, Liso, Cuadros"
              className={inputClasses}
            />
          </label>

          <label className="space-y-1">
            <span className={labelClasses}>Composición (Opcional)</span>
            <input
              type="text"
              value={form.composition}
              onChange={(e) => updateField("composition", e.target.value)}
              placeholder="Ej: 100% Lana"
              className={inputClasses}
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className={labelClasses}>Proveedor (Opcional)</span>
            <input
              type="text"
              value={form.supplier}
              onChange={(e) => updateField("supplier", e.target.value)}
              placeholder="Ej: Proveedor A"
              className={inputClasses}
            />
          </label>
        </div>

        <hr className="border-white/5 my-4" />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className={labelClasses}>Stock Inicial (Metros)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.metersInStock}
              onChange={(e) => updateField("metersInStock", Number(e.target.value))}
              placeholder="0.00"
              className={inputClasses}
            />
          </label>

          <label className="space-y-1">
            <span className={labelClasses}>Stock Mín. de Alerta</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.minMeters}
              onChange={(e) => updateField("minMeters", Number(e.target.value))}
              placeholder="5.00"
              className={inputClasses}
            />
          </label>

          <label className="space-y-1">
            <span className={labelClasses}>Costo por m (Opcional)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.costPerMeter}
              onChange={(e) => updateField("costPerMeter", Number(e.target.value))}
              placeholder="0.00"
              className={inputClasses}
            />
          </label>

          <label className="space-y-1">
            <span className={labelClasses}>Precio Venta sugerido/m (Opcional)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.pricePerMeter}
              onChange={(e) => updateField("pricePerMeter", Number(e.target.value))}
              placeholder="0.00"
              className={inputClasses}
            />
          </label>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {isPending ? "Registrando..." : "Registrar tela"}
        </button>
      </form>
    </article>
  );
}
