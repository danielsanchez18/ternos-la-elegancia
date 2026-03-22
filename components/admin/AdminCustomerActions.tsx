"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, UserX, X, Check, AlertTriangle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CustomerActionData = {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string | null;
  dni: string;
  isActive: boolean;
};

type EditFormState = {
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  dni: string;
};

type ChangeSummaryEntry = {
  field: string;
  from: string;
  to: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fullName(customer: CustomerActionData) {
  return `${customer.nombres} ${customer.apellidos}`.trim();
}

function detectChanges(
  original: CustomerActionData,
  edited: EditFormState
): ChangeSummaryEntry[] {
  const changes: ChangeSummaryEntry[] = [];

  if (edited.nombres.trim() !== original.nombres) {
    changes.push({
      field: "Nombres",
      from: original.nombres,
      to: edited.nombres.trim(),
    });
  }

  if (edited.apellidos.trim() !== original.apellidos) {
    changes.push({
      field: "Apellidos",
      from: original.apellidos,
      to: edited.apellidos.trim(),
    });
  }

  if (edited.email.trim().toLowerCase() !== original.email) {
    changes.push({
      field: "Correo",
      from: original.email,
      to: edited.email.trim().toLowerCase(),
    });
  }

  const originalCelular = original.celular ?? "";
  if (edited.celular.trim() !== originalCelular) {
    changes.push({
      field: "Celular",
      from: originalCelular || "(vacío)",
      to: edited.celular.trim() || "(vacío)",
    });
  }

  if (edited.dni.trim() !== original.dni) {
    changes.push({
      field: "DNI",
      from: original.dni,
      to: edited.dni.trim(),
    });
  }

  return changes;
}

/* ------------------------------------------------------------------ */
/*  Shared UI primitives                                               */
/* ------------------------------------------------------------------ */

function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg mx-4">
        {children}
      </div>
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

const labelClasses = "text-xs uppercase tracking-[0.18em] text-stone-500";

/* ------------------------------------------------------------------ */
/*  Edit Modal                                                         */
/* ------------------------------------------------------------------ */

type EditStep = "form" | "confirm";

function EditModal({
  customer,
  onClose,
}: {
  customer: CustomerActionData;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<EditStep>("form");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState<EditFormState>({
    nombres: customer.nombres,
    apellidos: customer.apellidos,
    email: customer.email,
    celular: customer.celular ?? "",
    dni: customer.dni,
  });

  const [changes, setChanges] = useState<ChangeSummaryEntry[]>([]);

  function updateField<K extends keyof EditFormState>(
    key: K,
    value: EditFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const detected = detectChanges(customer, form);

    if (detected.length === 0) {
      setErrorMessage("No se detectaron cambios.");
      return;
    }

    setChanges(detected);
    setStep("confirm");
  }

  function handleConfirm() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const body: Record<string, unknown> = {};

        for (const change of changes) {
          if (change.field === "Nombres") {
            body.nombres = form.nombres.trim();
          }
          if (change.field === "Apellidos") {
            body.apellidos = form.apellidos.trim();
          }
          if (change.field === "Correo") {
            body.email = form.email.trim().toLowerCase();
          }
          if (change.field === "Celular") {
            body.celular = form.celular.trim() || null;
          }
          if (change.field === "DNI") {
            body.dni = form.dni.trim();
          }
        }

        const response = await fetch(`/api/customers/${customer.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
            fields?: string[];
          } | null;

          if (response.status === 409 && payload?.fields?.length) {
            setErrorMessage(
              `Conflicto en campos: ${payload.fields.join(", ")}. Verifica email o DNI.`
            );
            setStep("form");
            return;
          }

          setErrorMessage(
            payload?.error ?? "No se pudo actualizar el cliente."
          );
          setStep("form");
          return;
        }

        router.refresh();
        onClose();
      } catch {
        setErrorMessage("Ocurrió un problema al actualizar el cliente.");
        setStep("form");
      }
    });
  }

  if (step === "confirm") {
    return (
      <Overlay onClose={onClose}>
        <ModalCard
          onClose={onClose}
          eyebrow="Confirmación"
          title="Revisar cambios"
        >
          <p className="text-sm text-stone-400">
            Se aplicarán los siguientes cambios a{" "}
            <span className="font-medium text-white">{fullName(customer)}</span>:
          </p>

          <div className="mt-4 space-y-2">
            {changes.map((change) => (
              <div
                key={change.field}
                className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  {change.field}
                </p>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className="text-rose-300 line-through">
                    {change.from}
                  </span>
                  <span className="text-stone-500">→</span>
                  <span className="text-emerald-300">{change.to}</span>
                </div>
              </div>
            ))}
          </div>

          {errorMessage ? (
            <p className="mt-4 text-sm text-rose-300">{errorMessage}</p>
          ) : null}

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => setStep("form")}
              disabled={isPending}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-stone-300 transition hover:bg-white/[0.06] disabled:opacity-60"
            >
              Volver
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="size-4" />
              {isPending ? "Guardando..." : "Confirmar cambios"}
            </button>
          </div>
        </ModalCard>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <ModalCard
        onClose={onClose}
        eyebrow="Edición"
        title={`Editar a ${fullName(customer)}`}
      >
        <form onSubmit={handleReview} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className={labelClasses}>Nombres</span>
            <input
              value={form.nombres}
              onChange={(e) => updateField("nombres", e.target.value)}
              className={inputClasses}
              required
            />
          </label>

          <label className="space-y-1">
            <span className={labelClasses}>Apellidos</span>
            <input
              value={form.apellidos}
              onChange={(e) => updateField("apellidos", e.target.value)}
              className={inputClasses}
              required
            />
          </label>

          <label className="space-y-1">
            <span className={labelClasses}>Correo</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClasses}
              required
            />
          </label>

          <label className="space-y-1">
            <span className={labelClasses}>Celular</span>
            <input
              type="tel"
              value={form.celular}
              onChange={(e) => updateField("celular", e.target.value)}
              className={inputClasses}
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className={labelClasses}>DNI</span>
            <input
              value={form.dni}
              onChange={(e) => updateField("dni", e.target.value)}
              className={inputClasses}
              minLength={8}
              required
            />
          </label>

          {errorMessage ? (
            <p className="sm:col-span-2 text-sm text-rose-300">
              {errorMessage}
            </p>
          ) : null}

          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-stone-300 transition hover:bg-white/[0.06]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
            >
              <Pencil className="size-4" />
              Revisar cambios
            </button>
          </div>
        </form>
      </ModalCard>
    </Overlay>
  );
}

/* ------------------------------------------------------------------ */
/*  Deactivate Modal (double confirmation)                             */
/* ------------------------------------------------------------------ */

type DeactivateStep = "ask" | "type-confirm";

function DeactivateModal({
  customer,
  onClose,
}: {
  customer: CustomerActionData;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<DeactivateStep>("ask");
  const [confirmText, setConfirmText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const CONFIRM_WORD = "DESACTIVAR";
  const isConfirmValid = confirmText.trim() === CONFIRM_WORD;

  function handleDeactivate() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/customers/${customer.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;

          setErrorMessage(
            payload?.error ?? "No se pudo desactivar el cliente."
          );
          return;
        }

        router.refresh();
        onClose();
      } catch {
        setErrorMessage("Ocurrió un problema al desactivar el cliente.");
      }
    });
  }

  if (step === "type-confirm") {
    return (
      <Overlay onClose={onClose}>
        <ModalCard
          onClose={onClose}
          eyebrow="Confirmación final"
          title="Escribe para confirmar"
        >
          <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" />
              <p className="text-sm leading-6 text-amber-200">
                Para desactivar a{" "}
                <span className="font-semibold text-white">
                  {fullName(customer)}
                </span>
                , escribe{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-amber-100">
                  {CONFIRM_WORD}
                </code>{" "}
                en el campo de abajo.
              </p>
            </div>
          </div>

          <label className="mt-4 block space-y-1">
            <span className={labelClasses}>Confirmación</span>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              className={inputClasses}
              autoFocus
            />
          </label>

          {errorMessage ? (
            <p className="mt-4 text-sm text-rose-300">{errorMessage}</p>
          ) : null}

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => {
                setStep("ask");
                setConfirmText("");
              }}
              disabled={isPending}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-stone-300 transition hover:bg-white/[0.06] disabled:opacity-60"
            >
              Volver
            </button>
            <button
              onClick={handleDeactivate}
              disabled={!isConfirmValid || isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <UserX className="size-4" />
              {isPending ? "Desactivando..." : "Desactivar cliente"}
            </button>
          </div>
        </ModalCard>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <ModalCard
        onClose={onClose}
        eyebrow="Acción destructiva"
        title="Desactivar cliente"
      >
        <div className="rounded-xl border border-rose-400/15 bg-rose-400/5 px-4 py-3">
          <p className="text-sm leading-6 text-rose-200">
            ¿Estás seguro de que deseas desactivar a{" "}
            <span className="font-semibold text-white">
              {fullName(customer)}
            </span>
            ? El cliente quedará marcado como inactivo y no podrá operar hasta
            ser reactivado.
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
            Resumen del cliente
          </p>
          <p className="mt-2 text-sm text-stone-300">
            {customer.email} · DNI {customer.dni}
            {customer.celular ? ` · ${customer.celular}` : ""}
          </p>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-stone-300 transition hover:bg-white/[0.06]"
          >
            Cancelar
          </button>
          <button
            onClick={() => setStep("type-confirm")}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-500/80 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
          >
            Sí, desactivar
          </button>
        </div>
      </ModalCard>
    </Overlay>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

type ModalState = "closed" | "edit" | "deactivate";

export default function AdminCustomerActions({
  customer,
}: {
  customer: CustomerActionData;
}) {
  const [modal, setModal] = useState<ModalState>("closed");

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setModal("edit")}
          title="Editar cliente"
          className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-white/[0.06] hover:text-emerald-300"
        >
          <Pencil className="size-3.5" />
        </button>

        {customer.isActive ? (
          <button
            onClick={() => setModal("deactivate")}
            title="Desactivar cliente"
            className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-rose-500/20 hover:text-rose-300"
          >
            <UserX className="size-3.5" />
          </button>
        ) : null}
      </div>

      {modal === "edit" ? (
        <EditModal customer={customer} onClose={() => setModal("closed")} />
      ) : null}

      {modal === "deactivate" ? (
        <DeactivateModal
          customer={customer}
          onClose={() => setModal("closed")}
        />
      ) : null}
    </>
  );
}
