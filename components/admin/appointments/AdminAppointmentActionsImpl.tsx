"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type AppointmentStatusLike =
  | "PENDIENTE"
  | "CONFIRMADA"
  | "REPROGRAMADA"
  | "CANCELADA"
  | "NO_ASISTIO"
  | "REALIZADA";

type ApiErrorResponse = {
  error?: string;
  issues?: Array<{
    path: string;
    message: string;
  }>;
};

type AvailableSlotApiRow = {
  time: string;
  scheduledAt: string;
  occupied: number;
  capacity: number;
  available: boolean;
};

type AvailableSlotsApiResponse = {
  date: string;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  note: string | null;
  source: "special" | "regular";
  slotMinutes: number;
  capacity: number;
  slots: AvailableSlotApiRow[];
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
    eyebrow: "Confirmacion",
    description: "Confirmar esta cita?",
    buttonLabel: "Confirmar cita",
    pendingLabel: "Confirmando...",
    variant: "emerald",
    needsSchedule: false,
  },
  COMPLETE: {
    label: "Completar",
    eyebrow: "Finalizacion",
    description: "Marcar esta cita como realizada?",
    buttonLabel: "Marcar realizada",
    pendingLabel: "Completando...",
    variant: "emerald",
    needsSchedule: false,
  },
  NO_SHOW: {
    label: "No asistio",
    eyebrow: "Inasistencia",
    description: "Registrar que el cliente no asistio?",
    buttonLabel: "Registrar no show",
    pendingLabel: "Registrando...",
    variant: "amber",
    needsSchedule: false,
  },
  CANCEL: {
    label: "Cancelar",
    eyebrow: "Cancelacion",
    description: "Cancelar esta cita? Esta accion no se puede deshacer.",
    buttonLabel: "Cancelar cita",
    pendingLabel: "Cancelando...",
    variant: "rose",
    needsSchedule: false,
  },
  RESCHEDULE: {
    label: "Reprogramar",
    eyebrow: "Reprogramacion",
    description: "Selecciona la nueva fecha y hora para la cita.",
    buttonLabel: "Reprogramar",
    pendingLabel: "Reprogramando...",
    variant: "blue",
    needsSchedule: true,
  },
};

const AVAILABLE_ACTIONS_BY_STATUS: Partial<Record<AppointmentStatusLike, ActionType[]>> = {
  PENDIENTE: ["CONFIRM", "CANCEL", "RESCHEDULE"],
  CONFIRMADA: ["COMPLETE", "NO_SHOW", "CANCEL", "RESCHEDULE"],
  REPROGRAMADA: ["CONFIRM", "COMPLETE", "NO_SHOW", "CANCEL", "RESCHEDULE"],
  NO_ASISTIO: ["RESCHEDULE"],
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

function getApiErrorMessage(payload: ApiErrorResponse | null, fallback: string): string {
  if (!payload) {
    return fallback;
  }

  if (Array.isArray(payload.issues) && payload.issues.length > 0) {
    return payload.issues
      .map((issue) => (issue.path ? `${issue.path}: ${issue.message}` : issue.message))
      .join(" - ");
  }

  return payload.error ?? fallback;
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function toDateParts(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function toIsoDateFromParts(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
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
  const [rescheduleYear, setRescheduleYear] = useState<number>(() =>
    new Date(appointment.scheduledAt).getFullYear()
  );
  const [rescheduleMonth, setRescheduleMonth] = useState<number>(() =>
    new Date(appointment.scheduledAt).getMonth() + 1
  );
  const [rescheduleDay, setRescheduleDay] = useState<number>(() =>
    new Date(appointment.scheduledAt).getDate()
  );
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availability, setAvailability] = useState<AvailableSlotsApiResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const meta = ACTION_META[action];
  const isRescheduleAction = action === "RESCHEDULE";
  const nowYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, idx) => nowYear - 1 + idx);
  const maxDayInSelectedMonth = daysInMonth(rescheduleYear, rescheduleMonth);
  const rescheduleDate = useMemo(
    () =>
      toIsoDateFromParts(
        rescheduleYear,
        rescheduleMonth,
        Math.min(rescheduleDay, maxDayInSelectedMonth)
      ),
    [rescheduleYear, rescheduleMonth, rescheduleDay, maxDayInSelectedMonth]
  );

  useEffect(() => {
    if (!isRescheduleAction) {
      return;
    }

    const appointmentDate = new Date(appointment.scheduledAt);
    const parts = toDateParts(appointmentDate);
    setRescheduleYear(parts.year);
    setRescheduleMonth(parts.month);
    setRescheduleDay(parts.day);
    setRescheduleTime("");
  }, [isRescheduleAction, appointment.scheduledAt]);

  useEffect(() => {
    if (rescheduleDay <= maxDayInSelectedMonth) {
      return;
    }

    setRescheduleDay(maxDayInSelectedMonth);
  }, [rescheduleDay, maxDayInSelectedMonth]);

  useEffect(() => {
    if (!isRescheduleAction) {
      return;
    }

    let isMounted = true;

    async function loadAvailability() {
      setIsLoadingAvailability(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `/api/appointments/available-slots?date=${rescheduleDate}&excludeAppointmentId=${appointment.id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as ApiErrorResponse | null;
          if (isMounted) {
            setErrorMessage(
            getApiErrorMessage(payload, "No se pudo ejecutar la accion.")
            );
          }
          return;
        }

        const availabilityJson = (await response.json()) as AvailableSlotsApiResponse;
        if (isMounted) {
          setAvailability(availabilityJson);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("No se pudo cargar disponibilidad de horarios.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingAvailability(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      isMounted = false;
    };
  }, [isRescheduleAction, rescheduleDate, appointment.id]);

  const availableTimeSlots = useMemo(
    () => availability?.slots.filter((slot) => slot.available).map((slot) => slot.time) ?? [],
    [availability]
  );

  useEffect(() => {
    if (rescheduleTime && !availableTimeSlots.includes(rescheduleTime)) {
      setRescheduleTime("");
    }
  }, [rescheduleTime, availableTimeSlots]);

  function handleSubmit() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const body: Record<string, unknown> = { action, note: note.trim() || undefined };

        if (meta.needsSchedule) {
          if (isLoadingAvailability) {
            setErrorMessage("Espera a que se cargue la disponibilidad.");
            return;
          }

          if (!rescheduleTime) {
            setErrorMessage("Selecciona una hora disponible.");
            return;
          }

          if (!availableTimeSlots.includes(rescheduleTime)) {
            setErrorMessage(
              "La hora seleccionada no esta disponible para crear o reprogramar."
            );
            return;
          }

          if (!availability || availability.isClosed) {
            setErrorMessage("La fecha seleccionada esta cerrada.");
            return;
          }

          const scheduledAtDate = new Date(`${rescheduleDate}T${rescheduleTime}`);

          if (Number.isNaN(scheduledAtDate.getTime())) {
            setErrorMessage("Fecha u hora invalida.");
            return;
          }

          body.scheduledAt = scheduledAtDate.toISOString();
        }

        const response = await fetch(`/api/appointments/${appointment.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as ApiErrorResponse | null;
          setErrorMessage(
            getApiErrorMessage(payload, "No se pudo ejecutar la accion.")
          );
          return;
        }

        router.refresh();
        onClose();
      } catch {
        setErrorMessage("Ocurrio un problema al ejecutar la accion.");
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
                {appointment.customerName} - {appointment.code}
              </p>
            </div>
          </div>
        </div>

        {meta.needsSchedule ? (
          <div className="mt-4 space-y-3">
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                Nueva fecha
              </span>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={String(rescheduleDay)}
                  onValueChange={(value) => {
                    setRescheduleDay(Number(value));
                    setRescheduleTime("");
                    setErrorMessage(null);
                  }}
                >
                  <SelectTrigger className={inputClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxDayInSelectedMonth }, (_, index) => index + 1).map(
                      (day) => (
                        <SelectItem key={day} value={String(day)}>
                          {pad2(day)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <Select
                  value={String(rescheduleMonth)}
                  onValueChange={(value) => {
                    setRescheduleMonth(Number(value));
                    setRescheduleTime("");
                    setErrorMessage(null);
                  }}
                >
                  <SelectTrigger className={inputClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_LABELS.map((monthLabel, index) => (
                      <SelectItem key={monthLabel} value={String(index + 1)}>
                        {monthLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={String(rescheduleYear)}
                  onValueChange={(value) => {
                    setRescheduleYear(Number(value));
                    setRescheduleTime("");
                    setErrorMessage(null);
                  }}
                >
                  <SelectTrigger className={inputClasses}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </label>

            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                Hora disponible
              </span>
              <Select
                value={rescheduleTime || undefined}
                onValueChange={(value) => {
                  setRescheduleTime(value);
                  setErrorMessage(null);
                }}
                disabled={
                  isLoadingAvailability ||
                  !availability ||
                  availableTimeSlots.length === 0
                }
              >
                <SelectTrigger className={inputClasses}>
                  <SelectValue
                    placeholder={
                      isLoadingAvailability
                        ? "Cargando disponibilidad..."
                        : availableTimeSlots.length
                          ? "Selecciona una hora"
                          : "No hay horas disponibles"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            {isLoadingAvailability ? (
              <p className="text-xs text-stone-500">
                Cargando horario permitido y cupos por franja...
              </p>
            ) : null}

            {!isLoadingAvailability && !availability ? (
              <p className="text-xs text-rose-300">
                No se pudo resolver la disponibilidad para esa fecha.
              </p>
            ) : null}

            {!isLoadingAvailability && availability?.isClosed ? (
              <p className="text-xs text-rose-300">
                La fecha seleccionada esta cerrada por{" "}
                {availability.source === "special"
                  ? "excepcion especial"
                  : "horario regular"}
                .
              </p>
            ) : null}

            {!isLoadingAvailability &&
            availability &&
            !availability.isClosed &&
            availability.openTime &&
            availability.closeTime ? (
              <p className="text-xs text-emerald-200">
                Horario habilitado: {availability.openTime} -{" "}
                {availability.closeTime} (
                {availability.source === "special"
                  ? "excepcion especial"
                  : "horario regular"}
                )
                {availability.note
                  ? ` - ${availability.note}`
                  : ""}
              </p>
            ) : null}
          </div>
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
            disabled={
              isPending ||
              (meta.needsSchedule &&
                (isLoadingAvailability || !rescheduleDate || !rescheduleTime))
            }
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
  return AVAILABLE_ACTIONS_BY_STATUS[status as AppointmentStatusLike] ?? [];
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

