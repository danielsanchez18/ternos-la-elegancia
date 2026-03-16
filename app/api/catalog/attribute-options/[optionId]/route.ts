import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { catalogService } from "@/src/modules/catalog/application/catalog.service";
import {
  CatalogAttributeOptionConflictError,
  CatalogAttributeOptionNotFoundError,
  CatalogValidationError,
} from "@/src/modules/catalog/domain/catalog.errors";
import {
  formatZodIssues,
  optionIdParamSchema,
  updateAttributeOptionSchema,
} from "@/src/modules/catalog/presentation/catalog.schemas";

type RouteContext = {
  params: Promise<{ optionId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = optionIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateAttributeOptionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const option = await catalogService.updateAttributeOption(parsedParams.data.optionId, parsedBody.data);
    return NextResponse.json(option);
  } catch (error: unknown) {
    if (error instanceof CatalogAttributeOptionNotFoundError) {
      return NextResponse.json({ error: "Attribute option not found" }, { status: 404 });
    }

    if (error instanceof CatalogAttributeOptionConflictError) {
      return NextResponse.json(
        { error: "Attribute option already exists", fields: error.fields },
        { status: 409 }
      );
    }

    if (error instanceof CatalogValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not update attribute option" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = optionIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const option = await catalogService.deactivateAttributeOption(parsedParams.data.optionId);
    return NextResponse.json(option);
  } catch (error: unknown) {
    if (error instanceof CatalogAttributeOptionNotFoundError) {
      return NextResponse.json({ error: "Attribute option not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not deactivate attribute option" }, { status: 500 });
  }
}
