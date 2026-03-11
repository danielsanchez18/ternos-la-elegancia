import { NextResponse } from "next/server";

import { productService } from "@/src/modules/products/application/product.service";
import {
  ProductNotFoundError,
  ProductVariantConflictError,
} from "@/src/modules/products/domain/product.errors";
import {
  createProductVariantSchema,
  formatZodIssues,
  productIdParamSchema,
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

    const variants = await productService.listProductVariants(parsedParams.data.id);
    return NextResponse.json(variants);
  } catch (error: unknown) {
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not list product variants" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = productIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = createProductVariantSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const variant = await productService.createProductVariant(parsedParams.data.id, parsedBody.data);
    return NextResponse.json(variant, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (error instanceof ProductVariantConflictError) {
      return NextResponse.json(
        { error: "Product variant already exists", fields: error.fields },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Could not create product variant" }, { status: 500 });
  }
}
