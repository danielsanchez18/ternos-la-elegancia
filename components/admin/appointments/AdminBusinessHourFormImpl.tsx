"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type BusinessHourRow = {
  dayOfWeek: number;
  dayLabel: string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  note: string | null;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-300/40";

export default function AdminBusinessHourForm({
  hours,
}: {
  hours: BusinessHourRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [isClosed, setIsClosed] = useState(false);
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successDay, setSuccessDay] = useState<number | null>(null);

  function startEdit(row: BusinessHourRow) {
    setEditingDay(row.dayOfWeek);
    setOpenTime(row.openTime ?? "09:00");
    setCloseTime(row.closeTime ?? "19:30");
    setIsClosed(row.isClosed);
    setNote(row.note ?? "");
    setErrorMessage(null);
    setSuccessDay(null);
  }

  function cancelEdit() {
    setEditingDay(null);
    setErrorMessage(null);
  }

  function handleSave(dayOfWeek: number) {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const body: Record<string, unknown> = {
          dayOfWeek,
          isClosed,
          note: note.trim() || undefined,
        };

        if (!isClosed) {
          body.openTime = openTime;
          body.closeTime = closeTime;
        }

        const response = await fetch("/api/appointments/business-hours", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          setErrorMessage(payload?.error ?? "No se pudo guardar el horario.");
          return;
        }

        setSuccessDay(dayOfWeek);
        setEditingDay(null);
        router.refresh();
      } catch {
        setErrorMessage("Ocurrió un problema al guardar.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {hours.map((row) => {
        const isEditing = editingDay === row.dayOfWeek;

        return (
          <div
            key={row.dayOfWeek}
            className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-xs font-semibold text-white">
                  {row.dayLabel.slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    {row.dayLabel}
                  </p>
                  {!isEditing ? (
                    <p className="mt-1 text-xs text-stone-400">
                      {row.isClosed
                        ? "Cerrado"
                        : `${row.openTime ?? "--"} a ${row.closeTime ?? "--"}`}
                      {row.note ? ` · ${row.note}` : ""}
                    </p>
                  ) : null}
                </div>
              </div>

              {!isEditing ? (
                <div className="flex items-center gap-2">
                  {successDay === row.dayOfWeek ? (
                    <span className="text-xs text-emerald-300">Guardado ✓</span>
                  ) : null}
                  <button
                    onClick={() => startEdit(row)}
                    className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-stone-400 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    Editar
                  </button>
                </div>
              ) : null}
            </div>

            {isEditing ? (
              <div className="mt-4 space-y-3">
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
                    placeholder="Ej: Horario regular"
                    className={inputClasses}
                  />
                </label>

                {errorMessage ? (
                  <p className="text-sm text-rose-300">{errorMessage}</p>
                ) : null}

                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEdit}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-stone-300 transition hover:bg-white/[0.06] disabled:opacity-60"
                  >
                    <X className="size-3" />
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSave(row.dayOfWeek)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check className="size-3" />
                    {isPending ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
