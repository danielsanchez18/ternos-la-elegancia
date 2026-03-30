import Link from "next/link";
import {
  getAdminAppointmentsOverviewData,
  getAdminAppointmentsAgendaData,
  getAdminBusinessHoursData,
  getAdminSpecialSchedulesData,
} from "@/lib/admin-appointments";
import {
  AgendaSubrouteView,
  FechasEspecialesSubrouteView,
  HorariosSubrouteView,
} from "@/components/admin/appointments/AdminAppointmentsViews";
import { AdminStatCard } from "@/components/admin/customers/section-ui";

export function AdminAppointmentsSharedLayout({
  summary,
  activeTab,
  children,
}: {
  summary: any;
  activeTab: string;
  children: React.ReactNode;
}) {
  const heroCards = [
    {
      title: "Citas hoy",
      value: summary.todayAppointments,
      detail: `${summary.weekAppointments} en los próximos 7 días`,
    },
    {
      title: "Pendientes",
      value: summary.pendingConfirmation,
      detail: "Esperando confirmación",
    },
    {
      title: "Completadas (mes)",
      value: summary.completedThisMonth,
      detail: `${summary.cancelledThisMonth} canceladas`,
    },
    {
      title: "No show (mes)",
      value: summary.noShowThisMonth,
      detail: `De ${summary.totalAppointments} citas totales`,
    },
  ];

  const TABS = [
    { id: "agenda", label: "Agenda", href: "/admin/citas/agenda" },
    { id: "horarios", label: "Horarios", href: "/admin/citas/horarios" },
    { id: "fechas-especiales", label: "Fechas Especiales", href: "/admin/citas/fechas-especiales" },
  ];

  return (
    <section className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {heroCards.map((card) => (
          <div key={card.title}>
            <AdminStatCard {...card} />
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-8 border-b border-white/10 px-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`pb-4 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                  isActive
                    ? "border-emerald-400 text-emerald-300"
                    : "border-transparent text-stone-500 hover:text-stone-300"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="pt-8">{children}</div>
      </div>
    </section>
  );
}

export async function AdminAppointmentsSection() {
  return <AdminAppointmentsSubroute subroute="agenda" />;
}

export async function AdminAppointmentsSubroute({
  subroute,
}: {
  subroute: string;
}) {
  const overview = await getAdminAppointmentsOverviewData();

  switch (subroute) {
    case "agenda": {
      const appointments = await getAdminAppointmentsAgendaData();
      return (
        <AdminAppointmentsSharedLayout summary={overview.summary} activeTab="agenda">
          <AgendaSubrouteView appointments={appointments} />
        </AdminAppointmentsSharedLayout>
      );
    }
    case "horarios": {
      const hours = await getAdminBusinessHoursData();
      return (
        <AdminAppointmentsSharedLayout summary={overview.summary} activeTab="horarios">
          <HorariosSubrouteView hours={hours} />
        </AdminAppointmentsSharedLayout>
      );
    }
    case "fechas-especiales": {
      const schedules = await getAdminSpecialSchedulesData();
      return (
        <AdminAppointmentsSharedLayout
          summary={overview.summary}
          activeTab="fechas-especiales"
        >
          <FechasEspecialesSubrouteView schedules={schedules} />
        </AdminAppointmentsSharedLayout>
      );
    }
    default:
      return null;
  }
}

