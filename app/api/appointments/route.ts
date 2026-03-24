import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireApiAuth } from "@/lib/api-auth";
import { appointmentService } from "@/src/modules/appointments/application/appointment.service";
import {
  AppointmentCustomerNotFoundError,
  AppointmentOutsideBusinessHoursError,
  AppointmentSlotUnavailableError,
} from "@/src/modules/appointments/domain/appointment.errors";
import {
  createAppointmentSchema,
  formatZodIssues,
  listAppointmentsQuerySchema,
} from "@/src/modules/appointments/presentation/appointment.schemas";

export async function GET(request: Request) {
  const auth = await requireApiAuth(request, "admin");
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);

  const parsedQuery = listAppointmentsQuerySchema.safeParse({
    customerId: searchParams.get("customerId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
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

  const appointments = await appointmentService.listAppointments(parsedQuery.data);
  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();
    const parsedBody = createAppointmentSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const appointment = await appointmentService.createAppointment(parsedBody.data);
    return NextResponse.json(appointment, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" || error.code === "P2034") {
        return NextResponse.json(
          { error: "Appointment conflict" },
          { status: 409 }
        );
      }
    }

    if (error instanceof AppointmentCustomerNotFoundError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
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

    if (process.env.NODE_ENV !== "production" && error instanceof Error) {
      return NextResponse.json(
        {
          error: "Could not create appointment",
          detail: error.message,
          name: error.name,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Could not create appointment" },
      { status: 500 }
    );
  }
}
