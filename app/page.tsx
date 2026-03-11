"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type AlterationService = {
  id: number;
  nombre: string;
  precioBase: string | null;
  activo: boolean;
};

type FormState = {
  customerId: string;
  serviceId: string;
  garmentDescription: string;
  workDescription: string;
  initialCondition: string;
  promisedAt: string;
  notes: string;
};

const initialFormState: FormState = {
  customerId: "",
  serviceId: "",
  garmentDescription: "",
  workDescription: "",
  initialCondition: "",
  promisedAt: "",
  notes: "",
};

export default function Home() {
  const [services, setServices] = useState<AlterationService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadServices() {
      setIsLoadingServices(true);
      setServicesError(null);

      try {
        const response = await fetch("/api/alteration-services?active=true", {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar los servicios de arreglo");
        }

        const payload = (await response.json()) as AlterationService[];
        setServices(payload);
      } catch (error: unknown) {
        if ((error as { name?: string }).name === "AbortError") {
          return;
        }

        setServicesError("No se pudieron cargar los servicios activos.");
      } finally {
        setIsLoadingServices(false);
      }
    }

    void loadServices();

    return () => controller.abort();
  }, []);

  const selectedService = useMemo(() => {
    if (!form.serviceId) {
      return null;
    }

    return services.find((service) => String(service.id) === form.serviceId) ?? null;
  }, [form.serviceId, services]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);

    try {
      const payload = {
        customerId: Number(form.customerId),
        serviceId: form.serviceId ? Number(form.serviceId) : undefined,
        garmentDescription: form.garmentDescription,
        workDescription: form.workDescription,
        initialCondition: form.initialCondition || undefined,
        promisedAt: form.promisedAt ? new Date(form.promisedAt).toISOString() : undefined,
        notes: form.notes || undefined,
      };

      const response = await fetch("/api/alteration-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as { error?: string };
        throw new Error(errorPayload.error ?? "No se pudo crear la orden de arreglo");
      }

      const order = (await response.json()) as { id: number; code: string };
      setSubmitSuccess(`Orden creada correctamente: ${order.code}`);
      setForm(initialFormState);
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo crear la orden de arreglo"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#f7f3e8_0%,#f1ebe1_50%,#efe4d8_100%)] px-4 py-10 text-zinc-900 sm:px-8">
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-amber-200/70 bg-white/90 p-6 shadow-[0_20px_60px_-30px_rgba(92,61,31,0.45)] sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Modulo de Arreglos
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Nueva orden de arreglo
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Selecciona un servicio activo y registra la informacion de la prenda.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">ID de cliente</span>
            <input
              required
              type="number"
              min={1}
              value={form.customerId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, customerId: event.target.value }))
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500"
              placeholder="Ejemplo: 1"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Servicio de arreglo</span>
            <select
              value={form.serviceId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, serviceId: event.target.value }))
              }
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none focus:border-amber-500"
              disabled={isLoadingServices}
            >
              <option value="">Sin servicio predefinido</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.nombre}
                </option>
              ))}
            </select>
            {selectedService?.precioBase ? (
              <span className="text-xs text-zinc-500">
                Precio base sugerido: S/ {selectedService.precioBase}
              </span>
            ) : null}
            {servicesError ? <span className="text-xs text-red-600">{servicesError}</span> : null}
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Descripcion de prenda</span>
            <input
              required
              value={form.garmentDescription}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, garmentDescription: event.target.value }))
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500"
              placeholder="Ejemplo: Terno azul de dos piezas"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Trabajo solicitado</span>
            <textarea
              required
              value={form.workDescription}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, workDescription: event.target.value }))
              }
              className="min-h-24 rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500"
              placeholder="Ejemplo: Ajustar cintura y bastas"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Condicion inicial</span>
            <input
              value={form.initialCondition}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, initialCondition: event.target.value }))
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500"
              placeholder="Opcional"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Fecha prometida</span>
            <input
              type="datetime-local"
              value={form.promisedAt}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, promisedAt: event.target.value }))
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Notas</span>
            <textarea
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              className="min-h-20 rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-amber-500"
              placeholder="Opcional"
            />
          </label>

          {submitError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}

          {submitSuccess ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {submitSuccess}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-amber-700 px-4 py-2 font-medium text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Guardando..." : "Crear orden de arreglo"}
          </button>
        </form>
      </section>
    </main>
  );
}
