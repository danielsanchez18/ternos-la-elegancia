import { NextResponse } from "next/server";

import { catalogService } from "@/src/modules/catalog/application/catalog.service";
import {
  CatalogProductComponentNotFoundError,
  CatalogValidationError,
} from "@/src/modules/catalog/domain/catalog.errors";
import {
  componentIdParamSchema,
  formatZodIssues,
  updateProductComponentSchema,
} from "@/src/modules/catalog/presentation/catalog.schemas";

type RouteContext = {
  params: Promise<{ componentId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = componentIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateProductComponentSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const component = await catalogService.updateProductComponent(
      parsedParams.data.componentId,
      parsedBody.data
    );

    return NextResponse.json(component);
  } catch (error: unknown) {
    if (error instanceof CatalogProductComponentNotFoundError) {
      return NextResponse.json({ error: "Product component not found" }, { status: 404 });
    }

    if (error instanceof CatalogValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not update product component" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = componentIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    await catalogService.deleteProductComponent(parsedParams.data.componentId);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof CatalogProductComponentNotFoundError) {
      return NextResponse.json({ error: "Product component not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not delete product component" }, { status: 500 });
  }
}
