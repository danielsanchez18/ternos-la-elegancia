import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { catalogService } from "@/src/modules/catalog/application/catalog.service";
import {
  CatalogRelatedEntityNotFoundError,
  CatalogValidationError,
} from "@/src/modules/catalog/domain/catalog.errors";
import {
  formatZodIssues,
  productIdParamSchema,
  upsertProductAttributeValueSchema,
} from "@/src/modules/catalog/presentation/catalog.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = productIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const values = await catalogService.listProductAttributeValues(parsedParams.data.id);
    return NextResponse.json(values);
  } catch (error: unknown) {
    if (error instanceof CatalogRelatedEntityNotFoundError && error.entity === "product") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not list product attributes" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = productIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = upsertProductAttributeValueSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const value = await catalogService.upsertProductAttributeValue(parsedParams.data.id, parsedBody.data);
    return NextResponse.json(value);
  } catch (error: unknown) {
    if (error instanceof CatalogRelatedEntityNotFoundError) {
      if (error.entity === "product") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Related entity not found", field: error.entity },
        { status: 400 }
      );
    }

    if (error instanceof CatalogValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not upsert product attribute" }, { status: 500 });
  }
}
