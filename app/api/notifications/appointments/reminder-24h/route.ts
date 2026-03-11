import { NextResponse } from "next/server";

import { notificationService } from "@/src/modules/notifications/application/notification.service";
import { NotificationValidationError } from "@/src/modules/notifications/domain/notification.errors";
import {
  dispatchAppointmentReminder24hSchema,
  formatZodIssues,
} from "@/src/modules/notifications/presentation/notification.schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = dispatchAppointmentReminder24hSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const result = await notificationService.dispatchAppointmentReminder24h(
      parsedBody.data
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof NotificationValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not dispatch appointment reminders" },
      { status: 500 }
    );
  }
}
