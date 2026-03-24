import Link from "next/link";
import { CalendarClock, Clock, CalendarDays } from "lucide-react";

import AdminAppointmentActions from "@/components/admin/appointments/AdminAppointmentActionsImpl";
import type { AppointmentActionData } from "@/components/admin/appointments/AdminAppointmentActionsImpl";
import AdminBusinessHourForm from "@/components/admin/appointments/AdminBusinessHourFormImpl";
import type { BusinessHourRow } from "@/components/admin/appointments/AdminBusinessHourFormImpl";
import AdminSpecialScheduleForm from "@/components/admin/appointments/AdminSpecialScheduleFormImpl";
import type { SpecialScheduleRow } from "@/components/admin/appointments/AdminSpecialScheduleFormImpl";
import { getAdminSection } from "@/lib/admin-dashboard";
import type {
  getAdminAppointmentsAgendaData,
  getAdminAppointmentsOverviewData,
  getAdminBusinessHoursData,
  getAdminSpecialSchedulesData,
} from "@/lib/admin-appointments";

type AppointmentsOverviewData = Awaited<
  ReturnType<typeof getAdminAppointmentsOverviewData>
>;
type AppointmentsAgendaData = Awaited<
  ReturnType<typeof getAdminAppointmentsAgendaData>
>;
type AppointmentsBusinessHoursData = Awaited<
  ReturnType<typeof getAdminBusinessHoursData>
>;
type AppointmentsSpecialSchedulesData = Awaited<
  ReturnType<typeof getAdminSpecialSchedulesData>
>;

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "short",
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

function statCard({
  title,
  value,
  detail,
  href,
}: {
  title: string;
  value: string | number;
  detail?: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-sm font-medium text-stone-200">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {detail ? (
        <p className="mt-2 text-sm leading-6 text-stone-400">{detail}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        key={title}
        href={href}
        className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 transition hover:border-white/15 hover:bg-white/[0.05]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      key={title}
      className="rounded-3xl border border-white/8 bg-white/[0.03] p-5"
    >
      {content}
    </div>
  );
}

function panel({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        </div>
        {action ? (
          <Link
            href={action.href}
            className="text-sm text-emerald-200 transition hover:text-emerald-100"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </article>
  );
}

function sectionLinks() {
  const citasSection = getAdminSection("citas");
  if (!citasSection) return null;

  const icons: Record<string, React.ReactNode> = {
    agenda: <CalendarClock className="size-4 text-emerald-200" />,
    horarios: <Clock className="size-4 text-emerald-200" />,
    "fechas-especiales": <CalendarDays className="size-4 text-emerald-200" />,
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {citasSection.subroutes.map((sub) => (
        <Link
          key={sub.slug}
          href={sub.href}
          className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 transition hover:border-white/15 hover:bg-white/[0.05]"
        >
          <div className="flex items-center gap-3">
            {icons[sub.slug] ?? null}
            <h3 className="text-base font-semibold text-white">{sub.label}</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            {sub.description}
          </p>
        </Link>
      ))}
    </div>
  );
}

export function AppointmentsSectionView({
  data,
}: {
  data: AppointmentsOverviewData;
}) {
  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,rgba(14,22,33,0.85),rgba(8,8,8,0.95))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="space-y-5">
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
            Agenda operativa
          </span>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Centro de citas y disponibilidad
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
              Controla reservas, reprogramaciones, horarios regulares y excepciones desde un solo
              lugar. La regla de 24h y la validaciÃ³n de slots se aplican automÃ¡ticamente.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCard({
              title: "Citas hoy",
              value: data.summary.todayAppointments,
              detail: `${data.summary.weekAppointments} en los prÃ³ximos 7 dÃ­as`,
              href: "/admin/citas/agenda",
            })}
            {statCard({
              title: "Pendientes",
              value: data.summary.pendingConfirmation,
              detail: "Esperando confirmaciÃ³n",
            })}
            {statCard({
              title: "Completadas (mes)",
              value: data.summary.completedThisMonth,
              detail: `${data.summary.cancelledThisMonth} canceladas`,
            })}
            {statCard({
              title: "No show (mes)",
              value: data.summary.noShowThisMonth,
              detail: `De ${data.summary.totalAppointments} citas totales`,
            })}
          </div>
        </div>
      </article>

      {panel({
        eyebrow: "Agenda inmediata",
        title: "PrÃ³ximas citas",
        action: { label: "Ver agenda completa", href: "/admin/citas/agenda" },
        children: (
          <div className="space-y-3">
            {data.recentAppointments.length ? (
              data.recentAppointments.map((a) => (
                <article
                  key={a.id}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{a.customerName}</p>
                      <p className="mt-1 text-sm text-stone-400">
                        {a.type.replaceAll("_", " ").toLowerCase()} Â· {a.code}
                      </p>
                    </div>
                    <div className="text-sm text-stone-300">
                      {dateFormatter.format(new Date(a.scheduledAt))}
                    </div>
                  </div>
                  <div className="mt-3 inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em]">
                    <span className={statusBadgeClasses(a.status)}>
                      {statusLabel(a.status)}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
                No hay citas prÃ³ximas registradas.
              </div>
            )}
          </div>
        ),
      })}

      {panel({
        eyebrow: "SubmÃ³dulos",
        title: "GestiÃ³n de agenda",
        children: sectionLinks(),
      })}
    </section>
  );
}

export function AgendaSubrouteView({
  appointments,
}: {
  appointments: AppointmentsAgendaData;
}) {
  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 sm:p-8">
        <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
          Citas
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">Agenda</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-400 sm:text-base">
          Todas las citas del sistema ordenadas por fecha. Usa las acciones de cada fila
          para confirmar, completar, registrar inasistencia, cancelar o reprogramar.
        </p>
      </article>

      {panel({
        eyebrow: "Listado",
        title: `${appointments.length} citas registradas`,
        children: (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs uppercase tracking-[0.15em] text-stone-500">
                  <th className="px-4 py-3 font-medium">CÃ³digo</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Orden</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-white/5 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-4 font-mono text-xs text-stone-300">{a.code}</td>
                    <td className="px-4 py-4">
                      <p className="text-white">{a.customerName}</p>
                      {a.customerCelular ? (
                        <p className="mt-1 text-xs text-stone-500">{a.customerCelular}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-stone-300">
                      {a.type.replaceAll("_", " ").toLowerCase()}
                    </td>
                    <td className="px-4 py-4 text-stone-300">
                      {dateFormatter.format(new Date(a.scheduledAt))}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] ${statusBadgeClasses(a.status)}`}
                      >
                        {statusLabel(a.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-stone-300">
                      {a.linkedOrderType ? (
                        <span className="text-xs text-stone-400">
                          {a.linkedOrderType} #{a.linkedOrderId}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-500">â€”</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <AdminAppointmentActions
                        appointment={
                          {
                            id: a.id,
                            code: a.code,
                            status: a.status,
                            customerName: a.customerName,
                            scheduledAt: a.scheduledAt,
                          } satisfies AppointmentActionData
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
                No hay citas registradas aÃºn.
              </div>
            ) : null}
          </div>
        ),
      })}
    </section>
  );
}

export function HorariosSubrouteView({
  hours,
}: {
  hours: AppointmentsBusinessHoursData;
}) {
  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 sm:p-8">
        <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
          ConfiguraciÃ³n
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">
          Horarios regulares
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-400 sm:text-base">
          Define el horario de atenciÃ³n para cada dÃ­a de la semana. Las citas solo pueden
          reservarse dentro de estos rangos, excepto en fechas especiales.
        </p>
      </article>

      {panel({
        eyebrow: "Semana",
        title: "Horario por dÃ­a",
        children: <AdminBusinessHourForm hours={hours as BusinessHourRow[]} />,
      })}
    </section>
  );
}

export function FechasEspecialesSubrouteView({
  schedules,
}: {
  schedules: AppointmentsSpecialSchedulesData;
}) {
  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 sm:p-8">
        <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
          Excepciones
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">
          Fechas especiales
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-400 sm:text-base">
          Agrega cierres temporales, feriados u horarios extendidos que anulen el horario
          regular para una fecha especÃ­fica.
        </p>
      </article>

      {panel({
        eyebrow: "Excepciones",
        title: "Calendario especial",
        children: (
          <AdminSpecialScheduleForm schedules={schedules as SpecialScheduleRow[]} />
        ),
      })}
    </section>
  );
}
