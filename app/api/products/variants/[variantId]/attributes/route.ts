import { NextResponse } from "next/server";

import { catalogService } from "@/src/modules/catalog/application/catalog.service";
import {
  CatalogRelatedEntityNotFoundError,
  CatalogValidationError,
} from "@/src/modules/catalog/domain/catalog.errors";
import {
  formatZodIssues,
  upsertVariantAttributeValueSchema,
  variantIdParamSchema,
} from "@/src/modules/catalog/presentation/catalog.schemas";

type RouteContext = {
  params: Promise<{ variantId: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = variantIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const values = await catalogService.listVariantAttributeValues(parsedParams.data.variantId);
    return NextResponse.json(values);
  } catch (error: unknown) {
    if (error instanceof CatalogRelatedEntityNotFoundError && error.entity === "variant") {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not list variant attributes" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = variantIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = upsertVariantAttributeValueSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const value = await catalogService.upsertVariantAttributeValue(
      parsedParams.data.variantId,
      parsedBody.data
    );

    return NextResponse.json(value);
  } catch (error: unknown) {
    if (error instanceof CatalogRelatedEntityNotFoundError) {
      if (error.entity === "variant") {
        return NextResponse.json({ error: "Variant not found" }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Related entity not found", field: error.entity },
        { status: 400 }
      );
    }

    if (error instanceof CatalogValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not upsert variant attribute" }, { status: 500 });
  }
}
