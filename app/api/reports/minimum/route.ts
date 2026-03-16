import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { reportService } from "@/src/modules/reports/application/report.service";
import { ReportValidationError } from "@/src/modules/reports/domain/report.errors";
import {
  formatZodIssues,
  minimumReportsQuerySchema,
} from "@/src/modules/reports/presentation/report.schemas";

export async function GET(request: Request) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);

    const parsedQuery = minimumReportsQuerySchema.safeParse({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      topRentedLimit: searchParams.get("topRentedLimit") ?? undefined,
      recurrentMinOrders: searchParams.get("recurrentMinOrders") ?? undefined,
      stockLimit: searchParams.get("stockLimit") ?? undefined,
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

    const reports = await reportService.getMinimumReports(parsedQuery.data);
    return NextResponse.json(reports);
  } catch (error: unknown) {
    if (error instanceof ReportValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Could not generate minimum reports" },
      { status: 500 }
    );
  }
}
