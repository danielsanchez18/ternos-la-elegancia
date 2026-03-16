import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { productService } from "@/src/modules/products/application/product.service";
import {
  ProductVariantConflictError,
  ProductVariantNotFoundError,
} from "@/src/modules/products/domain/product.errors";
import {
  formatZodIssues,
  productVariantIdParamSchema,
  updateProductVariantSchema,
} from "@/src/modules/products/presentation/product.schemas";

type RouteContext = {
  params: Promise<{ variantId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = productVariantIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateProductVariantSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const variant = await productService.updateProductVariant(parsedParams.data.variantId, parsedBody.data);
    return NextResponse.json(variant);
  } catch (error: unknown) {
    if (error instanceof ProductVariantNotFoundError) {
      return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
    }

    if (error instanceof ProductVariantConflictError) {
      return NextResponse.json(
        { error: "Product variant already exists", fields: error.fields },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Could not update product variant" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = productVariantIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const variant = await productService.deactivateProductVariant(parsedParams.data.variantId);
    return NextResponse.json(variant);
  } catch (error: unknown) {
    if (error instanceof ProductVariantNotFoundError) {
      return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not deactivate product variant" }, { status: 500 });
  }
}
