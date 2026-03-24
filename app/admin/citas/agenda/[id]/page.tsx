import { notFound } from "next/navigation";

import AdminAppointmentDetailView from "@/components/admin/appointments/AdminAppointmentDetailView";
import {
  getAdminAppointmentDetail,
  parseAdminAppointmentId,
} from "@/lib/admin-appointments";

export default async function AdminAppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = parseAdminAppointmentId(resolvedParams.id);

  if (id === null) {
    notFound();
  }

  const appointment = await getAdminAppointmentDetail(id);

  if (!appointment) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <AdminAppointmentDetailView appointment={appointment} />
    </div>
  );
}
