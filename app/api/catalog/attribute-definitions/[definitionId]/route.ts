import { NextResponse } from "next/server";

import { catalogService } from "@/src/modules/catalog/application/catalog.service";
import {
  CatalogAttributeDefinitionConflictError,
  CatalogAttributeDefinitionNotFoundError,
  CatalogValidationError,
} from "@/src/modules/catalog/domain/catalog.errors";
import {
  definitionIdParamSchema,
  formatZodIssues,
  updateAttributeDefinitionSchema,
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

    const definition = await catalogService.getAttributeDefinitionById(parsedParams.data.definitionId);
    return NextResponse.json(definition);
  } catch (error: unknown) {
    if (error instanceof CatalogAttributeDefinitionNotFoundError) {
      return NextResponse.json({ error: "Attribute definition not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not get attribute definition" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = definitionIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateAttributeDefinitionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const definition = await catalogService.updateAttributeDefinition(
      parsedParams.data.definitionId,
      parsedBody.data
    );

    return NextResponse.json(definition);
  } catch (error: unknown) {
    if (error instanceof CatalogAttributeDefinitionNotFoundError) {
      return NextResponse.json({ error: "Attribute definition not found" }, { status: 404 });
    }

    if (error instanceof CatalogAttributeDefinitionConflictError) {
      return NextResponse.json(
        { error: "Attribute definition already exists", fields: error.fields },
        { status: 409 }
      );
    }

    if (error instanceof CatalogValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Could not update attribute definition" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = definitionIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const definition = await catalogService.deactivateAttributeDefinition(parsedParams.data.definitionId);
    return NextResponse.json(definition);
  } catch (error: unknown) {
    if (error instanceof CatalogAttributeDefinitionNotFoundError) {
      return NextResponse.json({ error: "Attribute definition not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not deactivate attribute definition" },
      { status: 500 }
    );
  }
}
