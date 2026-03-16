import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { catalogService } from "@/src/modules/catalog/application/catalog.service";
import {
  CatalogProductAttributeValueNotFoundError,
  CatalogRelatedEntityNotFoundError,
} from "@/src/modules/catalog/domain/catalog.errors";
import {
  attributeValueDefinitionIdParamSchema,
  formatZodIssues,
  productIdParamSchema,
} from "@/src/modules/catalog/presentation/catalog.schemas";

type RouteContext = {
  params: Promise<{ id: string; definitionId: string }>;
};

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const routeParams = await params;

    const parsedProductId = productIdParamSchema.safeParse({ id: routeParams.id });
    if (!parsedProductId.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedProductId.error) },
        { status: 400 }
      );
    }

    const parsedDefinitionId = attributeValueDefinitionIdParamSchema.safeParse({
      definitionId: routeParams.definitionId,
    });
    if (!parsedDefinitionId.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedDefinitionId.error) },
        { status: 400 }
      );
    }

    await catalogService.deleteProductAttributeValue(
      parsedProductId.data.id,
      parsedDefinitionId.data.definitionId
    );

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof CatalogRelatedEntityNotFoundError && error.entity === "product") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (error instanceof CatalogProductAttributeValueNotFoundError) {
      return NextResponse.json({ error: "Product attribute value not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not delete product attribute" }, { status: 500 });
  }
}
