"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  dni: string;
  password: string;
};

const initialFormState: FormState = {
  nombres: "",
  apellidos: "",
  email: "",
  celular: "",
  dni: "",
  password: "",
};

export default function AdminCreateCustomerForm({
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
        const response = await fetch("/api/customers", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            nombres: form.nombres.trim(),
            apellidos: form.apellidos.trim(),
            email: form.email.trim().toLowerCase(),
            celular: form.celular.trim() || undefined,
            dni: form.dni.trim(),
            password: form.password,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | {
                error?: string;
                fields?: string[];
              }
            | null;

          if (response.status === 409 && payload?.fields?.length) {
            setErrorMessage(
              `Conflicto en campos: ${payload.fields.join(", ")}. Verifica email o DNI.`
            );
            return;
          }

          setErrorMessage(payload?.error ?? "No se pudo registrar el cliente.");
          return;
        }

        setSuccessMessage("Cliente registrado correctamente.");
        setForm(initialFormState);
        router.refresh();
      } catch {
        setErrorMessage("Ocurrio un problema al registrar el cliente.");
      }
    });
  }

  return (
    <article className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
              Registro rápido
            </p>
            <h2 className="text-2xl font-semibold text-white">Nuevo cliente</h2>
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
          Crea clientes desde el panel admin y actualiza el listado en tiempo real.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Nombres</span>
          <input
            value={form.nombres}
            onChange={(event) => updateField("nombres", event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-300/40"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Apellidos</span>
          <input
            value={form.apellidos}
            onChange={(event) => updateField("apellidos", event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-300/40"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Correo</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-300/40"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Celular</span>
          <input
            type="tel"
            value={form.celular}
            onChange={(event) => updateField("celular", event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-300/40"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.18em] text-stone-500">DNI</span>
          <input
            value={form.dni}
            onChange={(event) => updateField("dni", event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-300/40"
            minLength={8}
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Contrasena</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-300/40"
            minLength={8}
            required
          />
        </label>

        <div className="lg:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Registrando..." : "Registrar cliente"}
          </button>

          {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}
        </div>
      </form>
    </article>
  );
}
