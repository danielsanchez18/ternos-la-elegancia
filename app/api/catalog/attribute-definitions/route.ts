import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { catalogService } from "@/src/modules/catalog/application/catalog.service";
import {
  CatalogAttributeDefinitionConflictError,
  CatalogRelatedEntityNotFoundError,
  CatalogValidationError,
} from "@/src/modules/catalog/domain/catalog.errors";
import {
  createAttributeDefinitionSchema,
  formatZodIssues,
  listAttributeDefinitionsQuerySchema,
} from "@/src/modules/catalog/presentation/catalog.schemas";

export async function GET(request: Request) {
  const auth = await requireApiAuth(request, "admin");
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);

  const parsedQuery = listAttributeDefinitionsQuerySchema.safeParse({
    scope: searchParams.get("scope") ?? undefined,
    appliesToKind: searchParams.get("appliesToKind") ?? undefined,
    active: searchParams.get("active") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid query params", issues: formatZodIssues(parsedQuery.error) },
      { status: 400 }
    );
  }

  const definitions = await catalogService.listAttributeDefinitions(parsedQuery.data);
  return NextResponse.json(definitions);
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();
    const parsedBody = createAttributeDefinitionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const definition = await catalogService.createAttributeDefinition(parsedBody.data);
    return NextResponse.json(definition, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof CatalogAttributeDefinitionConflictError) {
      return NextResponse.json(
        { error: "Attribute definition already exists", fields: error.fields },
        { status: 409 }
      );
    }

    if (error instanceof CatalogValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof CatalogRelatedEntityNotFoundError) {
      return NextResponse.json(
        { error: "Related entity not found", field: error.entity },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Could not create attribute definition" },
      { status: 500 }
    );
  }
}
