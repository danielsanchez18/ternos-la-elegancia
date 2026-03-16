import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { measurementService } from "@/src/modules/measurements/application/measurement.service";
import {
  formatZodIssues,
  measurementFieldsQuerySchema,
} from "@/src/modules/measurements/presentation/measurement.schemas";

export async function GET(request: Request) {
  const auth = await requireApiAuth(request, "admin");
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const parsedQuery = measurementFieldsQuerySchema.safeParse({
    garmentType: searchParams.get("garmentType"),
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

  const fields = await measurementService.listFieldsByGarmentType(
    parsedQuery.data.garmentType
  );

  return NextResponse.json(fields);
}
