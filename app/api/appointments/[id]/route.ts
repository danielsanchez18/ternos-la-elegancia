import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireApiAuth } from "@/lib/api-auth";
import { appointmentService } from "@/src/modules/appointments/application/appointment.service";
import {
  AppointmentDeadlineExceededError,
  AppointmentNotFoundError,
  AppointmentOutsideBusinessHoursError,
  AppointmentSlotUnavailableError,
  AppointmentTransitionNotAllowedError,
} from "@/src/modules/appointments/domain/appointment.errors";
import {
  appointmentActionSchema,
  appointmentIdParamSchema,
  formatZodIssues,
} from "@/src/modules/appointments/presentation/appointment.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = appointmentIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodIssues(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const appointment = await appointmentService.getAppointmentById(parsedParams.data.id);

    return NextResponse.json(appointment);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" || error.code === "P2034") {
        return NextResponse.json(
          { error: "Appointment conflict" },
          { status: 409 }
        );
      }
    }

    if (error instanceof AppointmentNotFoundError) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Could not get appointment" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = appointmentIdParamSchema.safeParse(await params);

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
    const parsedBody = appointmentActionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const appointment = await appointmentService.actOnAppointment(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(appointment);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" || error.code === "P2034") {
        return NextResponse.json(
          { error: "Appointment conflict" },
          { status: 409 }
        );
      }
    }

    if (error instanceof AppointmentNotFoundError) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    if (error instanceof AppointmentTransitionNotAllowedError) {
      return NextResponse.json(
        { error: "Appointment transition not allowed" },
        { status: 409 }
      );
    }

    if (error instanceof AppointmentDeadlineExceededError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof AppointmentOutsideBusinessHoursError) {
      return NextResponse.json(
        { error: "Appointment outside business hours" },
        { status: 409 }
      );
    }

    if (error instanceof AppointmentSlotUnavailableError) {
      return NextResponse.json(
        { error: "Appointment slot unavailable" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Could not update appointment" },
      { status: 500 }
    );
  }
}
