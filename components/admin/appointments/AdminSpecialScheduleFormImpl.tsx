"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Trash2, X, Plus, AlertTriangle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SpecialScheduleRow = {
  id: number;
  date: Date | string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  note: string | null;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const dateFormatter = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" });

function formatDate(value: Date | string) {
  const d = value instanceof Date ? value : new Date(value);
  return dateFormatter.format(d);
}

function toInputDate(value: Date | string) {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().split("T")[0];
}

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-300/40";

/* ------------------------------------------------------------------ */
/*  Overlay + Modal                                                    */
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

/* ------------------------------------------------------------------ */
/*  Create / Edit Form                                                 */
/* ------------------------------------------------------------------ */

function ScheduleForm({
  initial,
  onClose,
}: {
  initial?: SpecialScheduleRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(initial ? toInputDate(initial.date) : "");
  const [openTime, setOpenTime] = useState(initial?.openTime ?? "09:00");
  const [closeTime, setCloseTime] = useState(initial?.closeTime ?? "14:00");
  const [isClosed, setIsClosed] = useState(initial?.isClosed ?? false);
  const [note, setNote] = useState(initial?.note ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEdit = Boolean(initial);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const body: Record<string, unknown> = {
          date,
          isClosed,
          note: note.trim() || undefined,
        };

        if (!isClosed) {
          body.openTime = openTime;
          body.closeTime = closeTime;
        }

        const url = isEdit
          ? `/api/appointments/special-schedules/${initial!.id}`
          : "/api/appointments/special-schedules";

        const response = await fetch(url, {
          method: isEdit ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          setErrorMessage(
            payload?.error ?? "No se pudo guardar la excepción."
          );
          return;
        }

        router.refresh();
        onClose();
      } catch {
        setErrorMessage("Ocurrió un problema al guardar.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
          Fecha
        </span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClasses}
          required
          disabled={isEdit}
        />
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isClosed}
          onChange={(e) => setIsClosed(e.target.checked)}
          className="size-4 rounded border-white/20 bg-white/5 accent-emerald-500"
        />
        <span className="text-sm text-stone-300">Día cerrado</span>
      </label>

      {!isClosed ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
              Apertura
            </span>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className={inputClasses}
              step={1800}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
              Cierre
            </span>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className={inputClasses}
              step={1800}
            />
          </label>
        </div>
      ) : null}

      <label className="block space-y-1">
        <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
          Nota (opcional)
        </span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej: Feriado nacional"
          className={inputClasses}
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
          {isPending ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete confirmation                                                */
/* ------------------------------------------------------------------ */

function DeleteConfirm({
  schedule,
  onClose,
}: {
  schedule: SpecialScheduleRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleDelete() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/appointments/special-schedules/${schedule.id}`,
          { method: "DELETE", credentials: "include" }
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          setErrorMessage(
            payload?.error ?? "No se pudo eliminar la excepción."
          );
          return;
        }

        router.refresh();
        onClose();
      } catch {
        setErrorMessage("Ocurrió un problema al eliminar.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-rose-400/15 bg-rose-400/5 px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-300" />
          <p className="text-sm leading-6 text-rose-200">
            ¿Eliminar la excepción del{" "}
            <span className="font-semibold text-white">
              {formatDate(schedule.date)}
            </span>
            ? La fecha volverá al horario regular.
          </p>
        </div>
      </div>

      {errorMessage ? (
        <p className="text-sm text-rose-300">{errorMessage}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          disabled={isPending}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-stone-300 transition hover:bg-white/[0.06] disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="size-4" />
          {isPending ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

type ModalState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; schedule: SpecialScheduleRow }
  | { type: "delete"; schedule: SpecialScheduleRow };

export default function AdminSpecialScheduleForm({
  schedules,
}: {
  schedules: SpecialScheduleRow[];
}) {
  const [modal, setModal] = useState<ModalState>({ type: "closed" });

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-stone-400">
          {schedules.length} excepciones registradas
        </p>
        <button
          onClick={() => setModal({ type: "create" })}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-medium text-black transition hover:bg-emerald-400"
        >
          <Plus className="size-3.5" />
          Nueva excepción
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  {formatDate(schedule.date)}
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  {schedule.isClosed
                    ? "Cerrado"
                    : `${schedule.openTime ?? "--"} a ${schedule.closeTime ?? "--"}`}
                  {schedule.note ? ` · ${schedule.note}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModal({ type: "edit", schedule })}
                  title="Editar"
                  className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-white/[0.06] hover:text-emerald-300"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => setModal({ type: "delete", schedule })}
                  title="Eliminar"
                  className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-rose-500/20 hover:text-rose-300"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {schedules.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
            No hay excepciones configuradas.
          </div>
        ) : null}
      </div>

      {modal.type !== "closed" ? (
        <Overlay onClose={() => setModal({ type: "closed" })}>
          <div className="rounded-[2rem] border border-white/8 bg-[#0e0e0e] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
                  {modal.type === "create"
                    ? "Nueva excepción"
                    : modal.type === "edit"
                      ? "Editar excepción"
                      : "Eliminar excepción"}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {modal.type === "create"
                    ? "Fecha especial"
                    : modal.type === "edit"
                      ? formatDate(modal.schedule.date)
                      : "Confirmar eliminación"}
                </h3>
              </div>
              <button
                onClick={() => setModal({ type: "closed" })}
                className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5">
              {modal.type === "create" ? (
                <ScheduleForm
                  onClose={() => setModal({ type: "closed" })}
                />
              ) : modal.type === "edit" ? (
                <ScheduleForm
                  initial={modal.schedule}
                  onClose={() => setModal({ type: "closed" })}
                />
              ) : (
                <DeleteConfirm
                  schedule={modal.schedule}
                  onClose={() => setModal({ type: "closed" })}
                />
              )}
            </div>
          </div>
        </Overlay>
      ) : null}
    </>
  );
}
