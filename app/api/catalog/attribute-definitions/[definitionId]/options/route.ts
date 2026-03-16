import { NextResponse } from "next/server";

import { catalogService } from "@/src/modules/catalog/application/catalog.service";
import {
  CatalogAttributeDefinitionNotFoundError,
  CatalogAttributeOptionConflictError,
  CatalogValidationError,
} from "@/src/modules/catalog/domain/catalog.errors";
import {
  createAttributeOptionSchema,
  definitionIdParamSchema,
  formatZodIssues,
} from "@/src/modules/catalog/presentation/catalog.schemas";

type RouteContext = {
  params: Promise<{ definitionId: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = definitionIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const options = await catalogService.listAttributeOptions(parsedParams.data.definitionId);
    return NextResponse.json(options);
  } catch (error: unknown) {
    if (error instanceof CatalogAttributeDefinitionNotFoundError) {
      return NextResponse.json({ error: "Attribute definition not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not list attribute options" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = definitionIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = createAttributeOptionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const option = await catalogService.createAttributeOption(
      parsedParams.data.definitionId,
      parsedBody.data
    );

    return NextResponse.json(option, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof CatalogAttributeDefinitionNotFoundError) {
      return NextResponse.json({ error: "Attribute definition not found" }, { status: 404 });
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

    return NextResponse.json({ error: "Could not create attribute option" }, { status: 500 });
  }
}
