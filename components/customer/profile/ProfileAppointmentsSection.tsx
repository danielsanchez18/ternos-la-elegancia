"use client";

import { useEffect, useState } from "react";

import {
  getMyAppointments,
  type CustomerAppointment,
} from "@/lib/storefront-customer-api";

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("es-PE", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatTime(time: string | null | undefined): string {
  if (!time) return "—";
  return time.slice(0, 5);
}

function statusColor(status: string): string {
  const s = status.toUpperCase();
  if (["CONFIRMADA", "COMPLETADA"].includes(s))
    return "border-emerald-300/30 bg-emerald-50 text-emerald-700";
  if (["CANCELADA", "NO_ASISTIO"].includes(s))
    return "border-neutral-300 bg-neutral-100 text-neutral-500";
  return "border-amber-300/30 bg-amber-50 text-amber-700";
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfileAppointmentsSection({
  customerId,
}: {
  customerId: string;
}) {
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [expandedAppointments, setExpandedAppointments] = useState<Set<string>>(new Set());

  const toggleAppointment = (id: string) => {
    setExpandedAppointments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const result = await getMyAppointments(customerId);
        if (!isMounted) return;
        setAppointments(result);
      } catch {
        if (isMounted) setError("No se pudieron cargar tus citas.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [customerId]);

  const now = new Date();
  const upcoming = appointments.filter(
    (a) => new Date(a.date) >= now && !["CANCELADA", "NO_ASISTIO", "COMPLETADA"].includes(a.status.toUpperCase())
  );
  const past = appointments.filter(
    (a) => new Date(a.date) < now || ["CANCELADA", "NO_ASISTIO", "COMPLETADA"].includes(a.status.toUpperCase())
  );

  return (
    <article className="border border-black/10 bg-white p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
        Mis citas
      </p>
      <h2 className="mt-2 text-2xl font-oswald uppercase text-neutral-950">
        Agenda
      </h2>

      {isLoading ? (
        <p className="mt-6 text-sm text-neutral-500">Cargando citas...</p>
      ) : error ? (
        <p className="mt-6 text-sm text-amber-700">{error}</p>
      ) : appointments.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-600">
          Aun no tienes citas registradas.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {upcoming.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-3 border-b border-black/10 pb-2">
                Próximas citas
              </p>
              <div className="space-y-3">
                {upcoming.map((appointment) => {
                  const isExpanded = expandedAppointments.has(appointment.id);
                  return (
                    <div key={appointment.id} className="border border-neutral-200">
                      <button
                        type="button"
                        onClick={() => toggleAppointment(appointment.id)}
                        className="flex w-full items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {formatDate(appointment.date)}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`inline-flex border px-2 py-0.5 text-[10px] uppercase tracking-wide ${statusColor(appointment.status)}`}
                          >
                            {formatStatus(appointment.status)}
                          </span>
                          <span className="text-neutral-400 text-xs">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 py-4 border-t border-neutral-200 bg-white space-y-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Motivo</p>
                            <p className="text-sm text-neutral-900">{appointment.reason}</p>
                          </div>
                          {appointment.notes && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Notas</p>
                              <p className="text-sm text-neutral-700 bg-neutral-50 p-3 border border-neutral-100 whitespace-pre-wrap">
                                {appointment.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-3 border-b border-black/10 pb-2">
                Citas anteriores
              </p>
              <div className="space-y-3">
                {past.map((appointment) => {
                  const isExpanded = expandedAppointments.has(appointment.id);
                  return (
                    <div key={appointment.id} className="border border-neutral-200 opacity-80">
                      <button
                        type="button"
                        onClick={() => toggleAppointment(appointment.id)}
                        className="flex w-full items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-neutral-700">
                            {formatDate(appointment.date)}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`inline-flex border px-2 py-0.5 text-[10px] uppercase tracking-wide ${statusColor(appointment.status)}`}
                          >
                            {formatStatus(appointment.status)}
                          </span>
                          <span className="text-neutral-400 text-xs">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 py-4 border-t border-neutral-200 bg-white space-y-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Motivo</p>
                            <p className="text-sm text-neutral-800">{appointment.reason}</p>
                          </div>
                          {appointment.notes && (
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Notas</p>
                              <p className="text-sm text-neutral-600 bg-neutral-50 p-3 border border-neutral-100 whitespace-pre-wrap">
                                {appointment.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
