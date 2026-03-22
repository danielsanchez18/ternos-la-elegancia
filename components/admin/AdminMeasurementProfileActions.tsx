"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Check, AlertTriangle, Power } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type MeasurementProfileActionData = {
  id: number;
  customerName: string;
  notes: string | null;
  isActive: boolean;
  validUntil: Date | string;
};

/* ------------------------------------------------------------------ */
/*  Shared UI                                                          */
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
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md mx-4">{children}</div>
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

function EditModal({
  profile,
  onClose,
}: {
  profile: MeasurementProfileActionData;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(profile.notes ?? "");
  const [validUntil, setValidUntil] = useState(() => {
    const d =
      profile.validUntil instanceof Date
        ? profile.validUntil
        : new Date(profile.validUntil);
    return d.toISOString().split("T")[0];
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const body: Record<string, unknown> = {
          notes: notes.trim() || null,
          validUntil: new Date(validUntil).toISOString(),
        };

        const response = await fetch(
          `/api/measurement-profiles/${profile.id}`,
          {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          setErrorMessage(
            payload?.error ?? "No se pudo actualizar el perfil."
          );
          return;
        }

        router.refresh();
        onClose();
      } catch {
        setErrorMessage("Ocurrió un problema al actualizar.");
      }
    });
  }

  return (
    <Overlay onClose={onClose}>
      <ModalCard
        onClose={onClose}
        eyebrow="Edición"
        title="Editar perfil de medidas"
      >
        <p className="text-sm text-stone-400">
          Perfil de{" "}
          <span className="font-medium text-white">
            {profile.customerName}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block space-y-1">
            <span className={labelClasses}>Notas</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones del perfil..."
              className={inputClasses}
            />
          </label>

          <label className="block space-y-1">
            <span className={labelClasses}>Válido hasta</span>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className={inputClasses}
              required
            />
          </label>

          {errorMessage ? (
            <p className="text-sm text-rose-300">{errorMessage}</p>
          ) : null}

          <div className="flex items-center gap-3">
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
              {isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </ModalCard>
    </Overlay>
  );
}

/* ------------------------------------------------------------------ */
/*  Deactivate Modal                                                   */
/* ------------------------------------------------------------------ */

function DeactivateModal({
  profile,
  onClose,
}: {
  profile: MeasurementProfileActionData;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleDeactivate() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/measurement-profiles/${profile.id}`,
          {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ isActive: false }),
          }
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          setErrorMessage(
            payload?.error ?? "No se pudo desactivar el perfil."
          );
          return;
        }

        router.refresh();
        onClose();
      } catch {
        setErrorMessage("Ocurrió un problema al desactivar.");
      }
    });
  }

  return (
    <Overlay onClose={onClose}>
      <ModalCard
        onClose={onClose}
        eyebrow="Desactivación"
        title="Desactivar perfil"
      >
        <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" />
            <p className="text-sm leading-6 text-amber-200">
              ¿Desactivar el perfil de medidas de{" "}
              <span className="font-semibold text-white">
                {profile.customerName}
              </span>
              ? El perfil dejará de estar disponible para producción.
            </p>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-4 text-sm text-rose-300">{errorMessage}</p>
        ) : null}

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-stone-300 transition hover:bg-white/[0.06] disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={handleDeactivate}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Power className="size-4" />
            {isPending ? "Desactivando..." : "Desactivar perfil"}
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

export default function AdminMeasurementProfileActions({
  profile,
}: {
  profile: MeasurementProfileActionData;
}) {
  const [modal, setModal] = useState<ModalState>("closed");

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setModal("edit")}
          title="Editar perfil"
          className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-white/[0.06] hover:text-emerald-300"
        >
          <Pencil className="size-3.5" />
        </button>

        {profile.isActive ? (
          <button
            onClick={() => setModal("deactivate")}
            title="Desactivar perfil"
            className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-amber-500/20 hover:text-amber-300"
          >
            <Power className="size-3.5" />
          </button>
        ) : null}
      </div>

      {modal === "edit" ? (
        <EditModal profile={profile} onClose={() => setModal("closed")} />
      ) : null}

      {modal === "deactivate" ? (
        <DeactivateModal
          profile={profile}
          onClose={() => setModal("closed")}
        />
      ) : null}
    </>
  );
}
