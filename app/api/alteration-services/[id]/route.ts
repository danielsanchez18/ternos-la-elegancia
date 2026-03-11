import { NextResponse } from "next/server";

import { alterationServiceService } from "@/src/modules/alteration-services/application/alteration-service.service";
import {
  AlterationServiceNotFoundError,
  AlterationServiceValidationError,
} from "@/src/modules/alteration-services/domain/alteration-service.errors";
import {
  alterationServiceIdParamSchema,
  formatZodIssues,
  updateAlterationServiceSchema,
} from "@/src/modules/alteration-services/presentation/alteration-service.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = alterationServiceIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const service = await alterationServiceService.getAlterationServiceById(
      parsedParams.data.id
    );
    return NextResponse.json(service);
  } catch (error: unknown) {
    if (error instanceof AlterationServiceNotFoundError) {
      return NextResponse.json({ error: "Alteration service not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not get alteration service" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = alterationServiceIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateAlterationServiceSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const service = await alterationServiceService.updateAlterationService(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(service);
  } catch (error: unknown) {
    if (error instanceof AlterationServiceNotFoundError) {
      return NextResponse.json({ error: "Alteration service not found" }, { status: 404 });
    }

    if (error instanceof AlterationServiceValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not update alteration service" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = alterationServiceIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const service = await alterationServiceService.deactivateAlterationService(
      parsedParams.data.id
    );

    return NextResponse.json(service);
  } catch (error: unknown) {
    if (error instanceof AlterationServiceNotFoundError) {
      return NextResponse.json({ error: "Alteration service not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not deactivate alteration service" },
      { status: 500 }
    );
  }
}
