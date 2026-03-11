import { NextResponse } from "next/server";

import { appointmentService } from "@/src/modules/appointments/application/appointment.service";
import {
  AppointmentScheduleValidationError,
  AppointmentSpecialScheduleNotFoundError,
} from "@/src/modules/appointments/domain/appointment.errors";
import {
  formatZodIssues,
  scheduleIdParamSchema,
  updateSpecialScheduleSchema,
} from "@/src/modules/appointments/presentation/appointment.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = scheduleIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodIssues(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateSpecialScheduleSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const schedule = await appointmentService.updateSpecialSchedule(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(schedule);
  } catch (error: unknown) {
    if (error instanceof AppointmentSpecialScheduleNotFoundError) {
      return NextResponse.json(
        { error: "Special schedule not found" },
        { status: 404 }
      );
    }

    if (error instanceof AppointmentScheduleValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not update special schedule" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = scheduleIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodIssues(parsedParams.error),
        },
        { status: 400 }
      );
    }

    await appointmentService.deleteSpecialSchedule(parsedParams.data.id);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof AppointmentSpecialScheduleNotFoundError) {
      return NextResponse.json(
        { error: "Special schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Could not delete special schedule" },
      { status: 500 }
    );
  }
}
