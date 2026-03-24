import Link from "next/link";

import type { DashboardRecentAppointment } from "@/components/admin/dashboard/types";

type AdminDashboardAppointmentsSectionProps = {
  recentAppointments: DashboardRecentAppointment[];
};

export default function AdminDashboardAppointmentsSection({
  recentAppointments,
}: AdminDashboardAppointmentsSectionProps) {
  return (
    <section className="rounded-[2rem] border border-white/8 bg-black/30 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-500">
            Agenda inmediata
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Proximas citas</h2>
        </div>
        <Link
          href="/admin/citas/agenda"
          className="text-sm text-emerald-200 transition hover:text-emerald-100"
        >
          Ver agenda
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {recentAppointments.length ? (
          recentAppointments.map((appointment) => (
            <article
              key={appointment.id}
              className="rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{appointment.customerName}</p>
                  <p className="mt-1 text-sm text-stone-400">
                    {appointment.typeLabel} · {appointment.code}
                  </p>
                </div>
                <div className="text-sm text-stone-300">{appointment.scheduledAtLabel}</div>
              </div>
              <div className="mt-3 inline-flex rounded-full border border-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-400">
                {appointment.statusLabel}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-stone-500">
            No hay citas proximas registradas.
          </div>
        )}
      </div>
    </section>
  );
}
