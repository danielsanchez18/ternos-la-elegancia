import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { productService } from "@/src/modules/products/application/product.service";
import {
  ProductImageNotFoundError,
} from "@/src/modules/products/domain/product.errors";
import {
  formatZodIssues,
  productImageIdParamSchema,
  updateProductImageSchema,
} from "@/src/modules/products/presentation/product.schemas";

type RouteContext = {
  params: Promise<{ imageId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = productImageIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateProductImageSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const image = await productService.updateProductImage(parsedParams.data.imageId, parsedBody.data);
    return NextResponse.json(image);
  } catch (error: unknown) {
    if (error instanceof ProductImageNotFoundError) {
      return NextResponse.json({ error: "Product image not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not update product image" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = productImageIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    await productService.deleteProductImage(parsedParams.data.imageId);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof ProductImageNotFoundError) {
      return NextResponse.json({ error: "Product image not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not delete product image" }, { status: 500 });
  }
}
