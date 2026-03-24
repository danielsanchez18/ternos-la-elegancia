import {
  getAdminAppointmentsOverviewData,
  getAdminAppointmentsAgendaData,
  getAdminBusinessHoursData,
  getAdminSpecialSchedulesData,
} from "@/lib/admin-appointments";
import {
  AgendaSubrouteView,
  AppointmentsSectionView,
  FechasEspecialesSubrouteView,
  HorariosSubrouteView,
} from "@/components/admin/appointments/AdminAppointmentsViews";

export async function AdminAppointmentsSection() {
  const data = await getAdminAppointmentsOverviewData();
  return <AppointmentsSectionView data={data} />;
}

export async function AdminAppointmentsSubroute({
  subroute,
}: {
  subroute: string;
}) {
  switch (subroute) {
    case "agenda": {
      const appointments = await getAdminAppointmentsAgendaData();
      return <AgendaSubrouteView appointments={appointments} />;
    }
    case "horarios": {
      const hours = await getAdminBusinessHoursData();
      return <HorariosSubrouteView hours={hours} />;
    }
    case "fechas-especiales": {
      const schedules = await getAdminSpecialSchedulesData();
      return <FechasEspecialesSubrouteView schedules={schedules} />;
    }
    default:
      return null;
  }
}
