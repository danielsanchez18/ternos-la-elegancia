import { NextResponse } from "next/server";

import { alterationServiceService } from "@/src/modules/alteration-services/application/alteration-service.service";
import { AlterationServiceValidationError } from "@/src/modules/alteration-services/domain/alteration-service.errors";
import {
  createAlterationServiceSchema,
  formatZodIssues,
  listAlterationServicesQuerySchema,
} from "@/src/modules/alteration-services/presentation/alteration-service.schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsedQuery = listAlterationServicesQuerySchema.safeParse({
    active: searchParams.get("active") ?? undefined,
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

  const services = await alterationServiceService.listAlterationServices(parsedQuery.data);
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = createAlterationServiceSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const service = await alterationServiceService.createAlterationService(parsedBody.data);
    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof AlterationServiceValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not create alteration service" },
      { status: 500 }
    );
  }
}
