import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { notificationService } from "@/src/modules/notifications/application/notification.service";
import {
  formatZodIssues,
  listNotificationsQuerySchema,
} from "@/src/modules/notifications/presentation/notification.schemas";

export async function GET(request: Request) {
  const auth = await requireApiAuth(request, "admin");
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);

  const parsedQuery = listNotificationsQuerySchema.safeParse({
    customerId: searchParams.get("customerId") ?? undefined,
    channel: searchParams.get("channel") ?? undefined,
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

  const notifications = await notificationService.listNotifications(parsedQuery.data);
  return NextResponse.json(notifications);
}
