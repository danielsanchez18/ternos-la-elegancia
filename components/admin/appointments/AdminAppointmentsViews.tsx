"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutList, Calendar as CalendarIcon, Search, Filter } from "lucide-react";

import AdminAppointmentCalendar from "@/components/admin/appointments/AdminAppointmentCalendar";
import AdminAppointmentActions from "@/components/admin/appointments/AdminAppointmentActionsImpl";
import type { AppointmentActionData } from "@/components/admin/appointments/AdminAppointmentActionsImpl";
import AdminBusinessHourForm from "@/components/admin/appointments/AdminBusinessHourFormImpl";
import type { BusinessHourRow } from "@/components/admin/appointments/AdminBusinessHourFormImpl";
import AdminSpecialScheduleForm from "@/components/admin/appointments/AdminSpecialScheduleFormImpl";
import type { SpecialScheduleRow } from "@/components/admin/appointments/AdminSpecialScheduleFormImpl";

import { AdminSectionPanel as Panel } from "@/components/admin/customers/section-ui";

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function statusBadgeClasses(status: string) {
  switch (status) {
    case "PENDIENTE":
      return "border-amber-400/20 bg-amber-400/10 text-amber-200";
    case "CONFIRMADA":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "REALIZADA":
      return "border-sky-400/20 bg-sky-400/10 text-sky-200";
    case "CANCELADA":
      return "border-rose-400/20 bg-rose-400/10 text-rose-200";
    case "NO_ASISTIO":
      return "border-orange-400/20 bg-orange-400/10 text-orange-200";
    case "REPROGRAMADA":
      return "border-violet-400/20 bg-violet-400/10 text-violet-200";
    default:
      return "border-white/10 bg-white/5 text-stone-400";
  }
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function toAppointmentActionData(input: {
  id: string;
  code: string;
  status: string;
  customerName: string;
  scheduledAt: Date | string;
}): AppointmentActionData {
  return input as unknown as AppointmentActionData;
}

export function AgendaSubrouteView({
  appointments,
}: {
  appointments: any[];
}) {
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesSearch =
        a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesType = typeFilter === "all" || a.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [appointments, searchQuery, statusFilter, typeFilter]);

  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-[2rem] border border-white/8 bg-[#0e0e0e] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Agenda</h1>
          </div>

          <div className="flex items-center gap-1 rounded-2xl border border-white/8 bg-black/40 p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${viewMode === "table"
                ? "bg-white/10 text-white shadow-lg"
                : "text-stone-400 hover:text-white"
                }`}
            >
              <LayoutList className="size-4" />
              <span>Listado</span>
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${viewMode === "calendar"
                ? "bg-white/10 text-white shadow-lg"
                : "text-stone-400 hover:text-white"
                }`}
            >
              <CalendarIcon className="size-4" />
              <span>Calendario</span>
            </button>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="mt-8 flex flex-col gap-4 border-t border-white/5 pt-6 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Buscar por cliente o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-9 pr-4 text-sm text-stone-200 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-xl border border-white/10 bg-black/40 py-2.5 pl-4 pr-10 text-sm text-stone-300 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
              >
                <option value="all">Todos los estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="CONFIRMADA">Confirmadas</option>
                <option value="REALIZADA">Realizadas</option>
                <option value="CANCELADA">Canceladas</option>
                <option value="NO_ASISTIO">No asistió</option>
                <option value="REPROGRAMADA">Reprogramadas</option>
              </select>
              <Filter className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-500" />
            </div>

            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none rounded-xl border border-white/10 bg-black/40 py-2.5 pl-4 pr-10 text-sm text-stone-300 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
              >
                <option value="all">Todos los tipos</option>
                <option value="VENTA">Venta</option>
                <option value="CONFECCION">Confección</option>
                <option value="ALQUILER">Alquiler</option>
                <option value="ARREGLO">Arreglo</option>
              </select>
              <Filter className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-500" />
            </div>
          </div>
        </div>
      </article>

      {viewMode === "calendar" ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AdminAppointmentCalendar appointments={filteredAppointments} />
        </div>
      ) : (
        <Panel
          eyebrow="Maestro"
          title={`Listado operativo de citas (${filteredAppointments.length})`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs uppercase tracking-[0.15em] text-stone-500">
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-4 font-medium text-right text-transparent">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-white/5 transition hover:bg-white/2"
                  >
                    <td className="px-4 py-4 font-mono text-xs text-stone-300">
                      <Link
                        href={`/admin/citas/agenda/${a.id}`}
                        className="underline-offset-4 transition hover:text-emerald-300 hover:underline"
                      >
                        {a.code}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-base font-semibold text-white">{a.customerName}</p>
                      {a.customerCelular ? (
                        <p className="mt-1 text-xs text-stone-500">{a.customerCelular}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-stone-400 border border-white/10 px-2 py-0.5 rounded-md bg-white/5">
                        {a.type.replaceAll("_", " ").toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-stone-300 font-medium">
                      {dateFormatter.format(new Date(a.scheduledAt))}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] font-semibold ${statusBadgeClasses(
                          a.status
                        )}`}
                      >
                        {statusLabel(a.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <AdminAppointmentActions
                        appointment={toAppointmentActionData({
                          id: a.id,
                          code: a.code,
                          status: a.status,
                          customerName: a.customerName,
                          scheduledAt: a.scheduledAt,
                        })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAppointments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 px-4 py-20 text-center text-sm text-stone-500">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "No se encontraron citas con los filtros aplicados."
                  : "No hay citas registradas aún."}
              </div>
            ) : null}
          </div>
        </Panel>
      )}
    </section>
  );
}

export function HorariosSubrouteView({
  hours,
}: {
  hours: any[];
}) {
  return (
    <section className="space-y-6">
      <Panel eyebrow="Semana" title="Horario por día">
        <AdminBusinessHourForm hours={hours as BusinessHourRow[]} />
      </Panel>
    </section>
  );
}

export function FechasEspecialesSubrouteView({
  schedules,
}: {
  schedules: any[];
}) {
  return (
    <section className="space-y-6">
      <Panel eyebrow="Excepciones" title="Calendario especial">
        <AdminSpecialScheduleForm
          schedules={schedules as unknown as SpecialScheduleRow[]}
        />
      </Panel>
    </section>
  );
}
