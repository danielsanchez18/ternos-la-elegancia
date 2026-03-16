import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { catalogService } from "@/src/modules/catalog/application/catalog.service";
import {
  CatalogRelatedEntityNotFoundError,
  CatalogVariantAttributeValueNotFoundError,
} from "@/src/modules/catalog/domain/catalog.errors";
import {
  attributeValueDefinitionIdParamSchema,
  formatZodIssues,
  variantIdParamSchema,
} from "@/src/modules/catalog/presentation/catalog.schemas";

type RouteContext = {
  params: Promise<{ variantId: string; definitionId: string }>;
};

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const routeParams = await params;

    const parsedVariantId = variantIdParamSchema.safeParse({ variantId: routeParams.variantId });
    if (!parsedVariantId.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedVariantId.error) },
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

    await catalogService.deleteVariantAttributeValue(
      parsedVariantId.data.variantId,
      parsedDefinitionId.data.definitionId
    );

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof CatalogRelatedEntityNotFoundError && error.entity === "variant") {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    if (error instanceof CatalogVariantAttributeValueNotFoundError) {
      return NextResponse.json({ error: "Variant attribute value not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not delete variant attribute" }, { status: 500 });
  }
}
