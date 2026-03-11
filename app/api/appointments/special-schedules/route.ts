import { NextResponse } from "next/server";

import { appointmentService } from "@/src/modules/appointments/application/appointment.service";
import { AppointmentScheduleValidationError } from "@/src/modules/appointments/domain/appointment.errors";
import {
  createSpecialScheduleSchema,
  formatZodIssues,
  listSpecialSchedulesQuerySchema,
} from "@/src/modules/appointments/presentation/appointment.schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsedQuery = listSpecialSchedulesQuerySchema.safeParse({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
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

  const schedules = await appointmentService.listSpecialSchedules(parsedQuery.data);
  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = createSpecialScheduleSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const schedule = await appointmentService.createSpecialSchedule(parsedBody.data);
    return NextResponse.json(schedule, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof AppointmentScheduleValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not create special schedule" },
      { status: 500 }
    );
  }
}
