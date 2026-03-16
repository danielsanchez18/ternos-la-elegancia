import { NextResponse } from "next/server";

import { productService } from "@/src/modules/products/application/product.service";
import { ProductNotFoundError } from "@/src/modules/products/domain/product.errors";
import {
  formatZodIssues,
  productSlugParamSchema,
} from "@/src/modules/products/presentation/product.schemas";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = productSlugParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const product = await productService.getProductBySlug(parsedParams.data.slug);
    return NextResponse.json(product);
  } catch (error: unknown) {
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not get product by slug" },
      { status: 500 }
    );
  }
}
