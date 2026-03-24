import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { appointmentService } from "@/src/modules/appointments/application/appointment.service";
import {
  formatZodIssues,
  listAvailableSlotsQuerySchema,
} from "@/src/modules/appointments/presentation/appointment.schemas";

export async function GET(request: Request) {
  const auth = await requireApiAuth(request, "admin");
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);

  const parsedQuery = listAvailableSlotsQuerySchema.safeParse({
    date: searchParams.get("date") ?? undefined,
    excludeAppointmentId: searchParams.get("excludeAppointmentId") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        error: "Invalid query params",
        issues: formatZodIssues(parsedQuery.error),
      },
      { status: 400 }
    );
  }

  const availability = await appointmentService.listAvailableSlots(parsedQuery.data);
  return NextResponse.json(availability);
}
