import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CalendarClock, FileText, History, Link2, UserRound } from "lucide-react";

import AdminAppointmentActions from "@/components/admin/appointments/AdminAppointmentActionsImpl";
import type { AppointmentActionData } from "@/components/admin/appointments/AdminAppointmentActionsImpl";
import type { getAdminAppointmentDetail } from "@/lib/admin-appointments";

type AppointmentDetailData = NonNullable<Awaited<ReturnType<typeof getAdminAppointmentDetail>>>;

type LinkedOrderType = NonNullable<AppointmentDetailData["linkedOrder"]>["type"];

const dateTimeFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase();
}

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
      return "border-white/8 bg-white/[0.03] text-stone-400";
  }
}

function linkedOrderTypeLabel(type: LinkedOrderType) {
  switch (type) {
    case "venta":
      return "Venta";
    case "confeccion":
      return "Confeccion";
    case "alquiler":
      return "Alquiler";
    case "arreglo":
      return "Arreglo";
  }
}

function linkedOrderHref(order: AppointmentDetailData["linkedOrder"]) {
  if (!order) {
    return null;
  }

  switch (order.type) {
    case "confeccion":
      return `/admin/ordenes/personalizadas/${order.id}`;
    case "venta":
      return "/admin/ordenes/venta";
    case "alquiler":
      return "/admin/ordenes/rentas";
    case "arreglo":
      return "/admin/ordenes/alteraciones";
  }
}

function panel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
      <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function dataRow(label: string, value: ReactNode) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <div className="mt-1 text-sm text-stone-200">{value}</div>
    </div>
  );
}

function formatDateTime(date: Date | null) {
  if (!date) {
    return "-";
  }

  return dateTimeFormatter.format(new Date(date));
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

export default function AdminAppointmentDetailView({
  appointment,
}: {
  appointment: AppointmentDetailData;
}) {
  const linkedOrder = appointment.linkedOrder;
  const linkedOrderPath = linkedOrderHref(linkedOrder);

  return (
    <section className="mx-auto max-w-6xl space-y-6 pb-16">
      <article className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,rgba(14,22,33,0.85),rgba(8,8,8,0.95))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/admin/citas/agenda"
              className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-stone-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Volver a agenda
            </Link>

            <div className="space-y-3">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${statusBadgeClasses(appointment.status)}`}
              >
                {statusLabel(appointment.status)}
              </span>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {appointment.code}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
                Cita de {appointment.type.replaceAll("_", " ").toLowerCase()} para{" "}
                {appointment.customer.fullName}. Programada para {formatDateTime(appointment.scheduledAt)}.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/25 p-3">
            <AdminAppointmentActions
              appointment={toAppointmentActionData({
                id: appointment.id,
                code: appointment.code,
                status: appointment.status,
                customerName: appointment.customer.fullName,
                scheduledAt: appointment.scheduledAt,
              })}
            />
          </div>
        </div>
      </article>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {panel({
            eyebrow: "Datos",
            title: "Detalle de cita",
            children: (
              <div className="grid gap-3 sm:grid-cols-2">
                {dataRow("Tipo", appointment.type.replaceAll("_", " ").toLowerCase())}
                {dataRow("Programada", formatDateTime(appointment.scheduledAt))}
                {dataRow("Final estimado", formatDateTime(appointment.estimatedEndAt))}
                {dataRow("Limite reprogramacion", formatDateTime(appointment.rescheduleDeadlineAt))}
                {dataRow("Limite cancelacion", formatDateTime(appointment.cancelDeadlineAt))}
                {dataRow("Creada", formatDateTime(appointment.createdAt))}
                {dataRow("Actualizada", formatDateTime(appointment.updatedAt))}
                {dataRow("Recordatorio 24h", formatDateTime(appointment.reminder24hSentAt))}
              </div>
            ),
          })}

          {panel({
            eyebrow: "Notas",
            title: "Observaciones",
            children: (
              <div className="grid gap-3">
                {dataRow(
                  "Nota publica",
                  appointment.notes ? appointment.notes : <span className="text-stone-500">Sin nota</span>
                )}
                {dataRow(
                  "Nota interna",
                  appointment.internalNotes ? (
                    appointment.internalNotes
                  ) : (
                    <span className="text-stone-500">Sin nota interna</span>
                  )
                )}
              </div>
            ),
          })}

          {panel({
            eyebrow: "Historial",
            title: "Cambios de estado",
            children: appointment.history.length ? (
              <div className="space-y-3">
                {appointment.history.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] ${statusBadgeClasses(event.status)}`}
                      >
                        {statusLabel(event.status)}
                      </span>
                      <span className="text-xs text-stone-500">{formatDateTime(event.changedAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-stone-300">
                      {event.note ? event.note : "Sin nota de cambio"}
                    </p>
                    <p className="mt-2 text-xs text-stone-500">
                      {event.changedByName ? `Por ${event.changedByName}` : "Cambio sin usuario"}
                      {event.changedByEmail ? ` (${event.changedByEmail})` : ""}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
                Esta cita aun no tiene historial de cambios.
              </div>
            ),
          })}
        </div>

        <div className="space-y-6">
          {panel({
            eyebrow: "Cliente",
            title: "Ficha vinculada",
            children: (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <UserRound className="mt-0.5 size-4 text-emerald-300" />
                    <div className="min-w-0">
                      <Link
                        href={`/admin/clientes/perfil/${appointment.customer.id}`}
                        className="text-sm font-medium text-white underline-offset-4 transition hover:text-emerald-300 hover:underline"
                      >
                        {appointment.customer.fullName}
                      </Link>
                      <p className="mt-1 text-xs text-stone-500">DNI {appointment.customer.dni}</p>
                      <p className="mt-1 text-xs text-stone-500">{appointment.customer.email}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {appointment.customer.celular ?? "Sin celular"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ),
          })}

          {panel({
            eyebrow: "Relacion",
            title: "Orden vinculada",
            children: linkedOrder ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-start gap-3">
                  <Link2 className="mt-0.5 size-4 text-emerald-300" />
                  <div className="space-y-2">
                    <p className="text-sm text-stone-200">
                      {linkedOrderTypeLabel(linkedOrder.type)} #{linkedOrder.id}
                    </p>
                    <p className="text-xs text-stone-500">
                      Codigo: {linkedOrder.code ?? "no disponible"}
                    </p>
                    <p className="text-xs text-stone-500">
                      Estado: {linkedOrder.status ? statusLabel(linkedOrder.status) : "no disponible"}
                    </p>
                    {linkedOrderPath ? (
                      <Link
                        href={linkedOrderPath}
                        className="inline-flex items-center gap-2 text-xs text-emerald-300 transition hover:text-emerald-200"
                      >
                        Ir al modulo de la orden
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-stone-500">
                Esta cita no tiene una orden vinculada.
              </div>
            ),
          })}

          {panel({
            eyebrow: "Trazabilidad",
            title: "Linea de tiempo",
            children: (
              <div className="space-y-2">
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <CalendarClock className="mt-0.5 size-4 text-emerald-300" />
                    <div>
                      <p className="text-sm text-white">Programada</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {formatDateTime(appointment.scheduledAt)}
                      </p>
                    </div>
                  </div>
                </div>
                {appointment.confirmedAt ? (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                      <History className="mt-0.5 size-4 text-emerald-300" />
                      <div>
                        <p className="text-sm text-white">Confirmada</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatDateTime(appointment.confirmedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                {appointment.attendedAt ? (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 size-4 text-emerald-300" />
                      <div>
                        <p className="text-sm text-white">Atendida</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatDateTime(appointment.attendedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                {appointment.noShowAt ? (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                      <History className="mt-0.5 size-4 text-amber-300" />
                      <div>
                        <p className="text-sm text-white">No asistio</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatDateTime(appointment.noShowAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                {appointment.cancelledAt ? (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                      <History className="mt-0.5 size-4 text-rose-300" />
                      <div>
                        <p className="text-sm text-white">Cancelada</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {formatDateTime(appointment.cancelledAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ),
          })}
        </div>
      </div>
    </section>
  );
}
