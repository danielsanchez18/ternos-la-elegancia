"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  X,
  XCircle,
  CalendarClock,
  UserX,
  AlertTriangle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AppointmentActionData = {
  id: number;
  code: string;
  status: string;
  customerName: string;
  scheduledAt: Date | string;
};

type ActionType = "CONFIRM" | "COMPLETE" | "NO_SHOW" | "CANCEL" | "RESCHEDULE";

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

const ACTION_META: Record<
  ActionType,
  {
    label: string;
    eyebrow: string;
    description: string;
    buttonLabel: string;
    pendingLabel: string;
    variant: "emerald" | "rose" | "amber" | "blue";
    needsSchedule: boolean;
  }
> = {
  CONFIRM: {
    label: "Confirmar",
    eyebrow: "Confirmación",
    description: "¿Confirmar esta cita?",
    buttonLabel: "Confirmar cita",
    pendingLabel: "Confirmando...",
    variant: "emerald",
    needsSchedule: false,
  },
  COMPLETE: {
    label: "Completar",
    eyebrow: "Finalización",
    description: "¿Marcar esta cita como realizada?",
    buttonLabel: "Marcar realizada",
    pendingLabel: "Completando...",
    variant: "emerald",
    needsSchedule: false,
  },
  NO_SHOW: {
    label: "No asistió",
    eyebrow: "Inasistencia",
    description: "¿Registrar que el cliente no asistió?",
    buttonLabel: "Registrar no show",
    pendingLabel: "Registrando...",
    variant: "amber",
    needsSchedule: false,
  },
  CANCEL: {
    label: "Cancelar",
    eyebrow: "Cancelación",
    description: "¿Cancelar esta cita? Esta acción no se puede deshacer.",
    buttonLabel: "Cancelar cita",
    pendingLabel: "Cancelando...",
    variant: "rose",
    needsSchedule: false,
  },
  RESCHEDULE: {
    label: "Reprogramar",
    eyebrow: "Reprogramación",
    description: "Selecciona la nueva fecha y hora para la cita.",
    buttonLabel: "Reprogramar",
    pendingLabel: "Reprogramando...",
    variant: "blue",
    needsSchedule: true,
  },
};

function variantButtonClasses(variant: string) {
  switch (variant) {
    case "emerald":
      return "bg-emerald-500 text-black hover:bg-emerald-400";
    case "rose":
      return "bg-rose-500 text-white hover:bg-rose-400";
    case "amber":
      return "bg-amber-500 text-black hover:bg-amber-400";
    case "blue":
      return "bg-sky-500 text-black hover:bg-sky-400";
    default:
      return "bg-emerald-500 text-black hover:bg-emerald-400";
  }
}

function variantBorderClasses(variant: string) {
  switch (variant) {
    case "rose":
      return "border-rose-400/15 bg-rose-400/5 text-rose-200";
    case "amber":
      return "border-amber-400/15 bg-amber-400/5 text-amber-200";
    default:
      return "border-white/8 bg-white/[0.03] text-stone-300";
  }
}

/* ------------------------------------------------------------------ */
/*  Action Modal                                                       */
/* ------------------------------------------------------------------ */

function ActionModal({
  appointment,
  action,
  onClose,
}: {
  appointment: AppointmentActionData;
  action: ActionType;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const meta = ACTION_META[action];

  function handleSubmit() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const body: Record<string, unknown> = { action, note: note.trim() || undefined };

        if (meta.needsSchedule) {
          if (!scheduledAt) {
            setErrorMessage("Selecciona una fecha y hora.");
            return;
          }
          body.scheduledAt = new Date(scheduledAt).toISOString();
        }

        const response = await fetch(`/api/appointments/${appointment.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          setErrorMessage(payload?.error ?? "No se pudo ejecutar la acción.");
          return;
        }

        router.refresh();
        onClose();
      } catch {
        setErrorMessage("Ocurrió un problema al ejecutar la acción.");
      }
    });
  }

  return (
    <Overlay onClose={onClose}>
      <ModalCard onClose={onClose} eyebrow={meta.eyebrow} title={meta.label}>
        <div className={`rounded-xl border px-4 py-3 ${variantBorderClasses(meta.variant)}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-sm leading-6">{meta.description}</p>
              <p className="mt-2 text-xs text-stone-400">
                {appointment.customerName} · {appointment.code}
              </p>
            </div>
          </div>
        </div>

        {meta.needsSchedule ? (
          <label className="mt-4 block space-y-1">
            <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
              Nueva fecha y hora
            </span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className={inputClasses}
              step={1800}
            />
          </label>
        ) : null}

        <label className="mt-4 block space-y-1">
          <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
            Nota (opcional)
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Motivo o detalle..."
            className={inputClasses}
          />
        </label>

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
            onClick={handleSubmit}
            disabled={isPending}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variantButtonClasses(meta.variant)}`}
          >
            <Check className="size-4" />
            {isPending ? meta.pendingLabel : meta.buttonLabel}
          </button>
        </div>
      </ModalCard>
    </Overlay>
  );
}

/* ------------------------------------------------------------------ */
/*  Available actions per status                                       */
/* ------------------------------------------------------------------ */

function getAvailableActions(status: string): ActionType[] {
  switch (status) {
    case "PENDIENTE":
      return ["CONFIRM", "CANCEL", "RESCHEDULE"];
    case "CONFIRMADA":
      return ["COMPLETE", "NO_SHOW", "CANCEL", "RESCHEDULE"];
    case "REPROGRAMADA":
      return ["CONFIRM", "COMPLETE", "NO_SHOW", "CANCEL"];
    default:
      return [];
  }
}

function actionIcon(action: ActionType) {
  switch (action) {
    case "CONFIRM":
      return <CheckCircle2 className="size-3.5" />;
    case "COMPLETE":
      return <Check className="size-3.5" />;
    case "NO_SHOW":
      return <UserX className="size-3.5" />;
    case "CANCEL":
      return <XCircle className="size-3.5" />;
    case "RESCHEDULE":
      return <CalendarClock className="size-3.5" />;
  }
}

function actionHoverClasses(action: ActionType) {
  switch (action) {
    case "CONFIRM":
    case "COMPLETE":
      return "hover:bg-emerald-500/15 hover:text-emerald-300";
    case "NO_SHOW":
      return "hover:bg-amber-500/15 hover:text-amber-300";
    case "CANCEL":
      return "hover:bg-rose-500/15 hover:text-rose-300";
    case "RESCHEDULE":
      return "hover:bg-sky-500/15 hover:text-sky-300";
  }
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function AdminAppointmentActions({
  appointment,
}: {
  appointment: AppointmentActionData;
}) {
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const actions = getAvailableActions(appointment.status);

  if (actions.length === 0) {
    return (
      <span className="text-xs text-stone-500">Sin acciones</span>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => setActiveAction(action)}
            title={ACTION_META[action].label}
            className={`rounded-xl border border-white/8 bg-white/[0.03] p-2 text-stone-400 transition ${actionHoverClasses(action)}`}
          >
            {actionIcon(action)}
          </button>
        ))}
      </div>

      {activeAction ? (
        <ActionModal
          appointment={appointment}
          action={activeAction}
          onClose={() => setActiveAction(null)}
        />
      ) : null}
    </>
  );
}
