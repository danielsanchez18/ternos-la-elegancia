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
    const body = await readJsonBody(request).catch(() => {
      throw new Error("Invalid JSON body");
    });
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
    if (error instanceof Error && error.message === "Invalid JSON body") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof NotificationValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not run reminder cron" },
      { status: 500 }
    );
  }
}
