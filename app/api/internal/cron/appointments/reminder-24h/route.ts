import { NextResponse } from "next/server";

import { notificationService } from "@/src/modules/notifications/application/notification.service";
import { NotificationValidationError } from "@/src/modules/notifications/domain/notification.errors";
import {
  dispatchAppointmentReminder24hSchema,
  formatZodIssues,
} from "@/src/modules/notifications/presentation/notification.schemas";

function getBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function isAuthorized(request: Request, expectedSecret: string): boolean {

  const bearer = getBearerToken(request.headers.get("authorization"));
  const fallbackHeader = request.headers.get("x-cron-secret");
  const receivedSecret = bearer ?? fallbackHeader;

  return receivedSecret === expectedSecret;
}

export async function POST(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (!isAuthorized(request, expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body: unknown = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

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

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof NotificationValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not run reminder cron" },
      { status: 500 }
    );
  }
}
