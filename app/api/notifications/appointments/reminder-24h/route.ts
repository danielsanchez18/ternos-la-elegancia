import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { notificationService } from "@/src/modules/notifications/application/notification.service";
import { NotificationValidationError } from "@/src/modules/notifications/domain/notification.errors";
import {
  dispatchAppointmentReminder24hSchema,
  formatZodIssues,
} from "@/src/modules/notifications/presentation/notification.schemas";

async function readJsonBody(request: Request): Promise<unknown> {
  const rawBody = await request.text();

  if (!rawBody.trim()) {
    return {};
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new Error("Invalid JSON body");
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await readJsonBody(request);
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
    if (error instanceof Error && error.message === "Invalid JSON body") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof NotificationValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not dispatch appointment reminders" },
      { status: 500 }
    );
  }
}
