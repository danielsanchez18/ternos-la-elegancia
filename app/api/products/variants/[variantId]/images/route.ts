import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { productService } from "@/src/modules/products/application/product.service";
import { ProductVariantNotFoundError } from "@/src/modules/products/domain/product.errors";
import {
  createProductVariantImageSchema,
  formatZodIssues,
  productVariantIdParamSchema,
} from "@/src/modules/products/presentation/product.schemas";

type RouteContext = {
  params: Promise<{ variantId: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = productVariantIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const images = await productService.listProductVariantImages(
      parsedParams.data.variantId
    );
    return NextResponse.json(images);
  } catch (error: unknown) {
    if (error instanceof ProductVariantNotFoundError) {
      return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not list product variant images" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
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
    const parsedBody = createProductVariantImageSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const image = await productService.createProductVariantImage(
      parsedParams.data.variantId,
      parsedBody.data
    );
    return NextResponse.json(image, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ProductVariantNotFoundError) {
      return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not create product variant image" },
      { status: 500 }
    );
  }
}
