import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { catalogService } from "@/src/modules/catalog/application/catalog.service";
import {
  CatalogRelatedEntityNotFoundError,
  CatalogValidationError,
} from "@/src/modules/catalog/domain/catalog.errors";
import {
  createProductComponentSchema,
  formatZodIssues,
  productIdParamSchema,
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

    const components = await catalogService.listProductComponents(parsedParams.data.id);
    return NextResponse.json(components);
  } catch (error: unknown) {
    if (error instanceof CatalogRelatedEntityNotFoundError && error.entity === "product") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not list product components" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
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
    const parsedBody = createProductComponentSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const component = await catalogService.createProductComponent(parsedParams.data.id, parsedBody.data);
    return NextResponse.json(component, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof CatalogRelatedEntityNotFoundError && error.entity === "product") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (error instanceof CatalogValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not create product component" }, { status: 500 });
  }
}
