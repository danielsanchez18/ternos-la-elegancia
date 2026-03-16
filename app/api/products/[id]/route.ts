import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { productService } from "@/src/modules/products/application/product.service";
import {
  ProductConflictError,
  ProductNotFoundError,
  ProductRelatedEntityNotFoundError,
} from "@/src/modules/products/domain/product.errors";
import {
  formatZodIssues,
  productIdParamSchema,
  updateProductSchema,
} from "@/src/modules/products/presentation/product.schemas";

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

    const product = await productService.getProductById(parsedParams.data.id);
    return NextResponse.json(product);
  } catch (error: unknown) {
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not get product" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
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
    const parsedBody = updateProductSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const product = await productService.updateProduct(parsedParams.data.id, parsedBody.data);
    return NextResponse.json(product);
  } catch (error: unknown) {
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (error instanceof ProductConflictError) {
      return NextResponse.json(
        { error: "Product already exists", fields: error.fields },
        { status: 409 }
      );
    }

    if (error instanceof ProductRelatedEntityNotFoundError) {
      return NextResponse.json(
        { error: "Related entity not found", field: error.entity },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Could not update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
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

    const product = await productService.deactivateProduct(parsedParams.data.id);
    return NextResponse.json(product);
  } catch (error: unknown) {
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not deactivate product" }, { status: 500 });
  }
}
