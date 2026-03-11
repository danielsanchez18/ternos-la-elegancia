import { NextResponse } from "next/server";

import { appointmentService } from "@/src/modules/appointments/application/appointment.service";
import { AppointmentScheduleValidationError } from "@/src/modules/appointments/domain/appointment.errors";
import {
  formatZodIssues,
  upsertBusinessHourSchema,
} from "@/src/modules/appointments/presentation/appointment.schemas";

export async function GET() {
  const businessHours = await appointmentService.listBusinessHours();
  return NextResponse.json(businessHours);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = upsertBusinessHourSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const businessHour = await appointmentService.upsertBusinessHour(parsedBody.data);
    return NextResponse.json(businessHour);
  } catch (error: unknown) {
    if (error instanceof AppointmentScheduleValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not update business hour" },
      { status: 500 }
    );
  }
}
