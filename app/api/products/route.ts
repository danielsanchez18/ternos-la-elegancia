import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { productService } from "@/src/modules/products/application/product.service";
import {
  ProductConflictError,
  ProductRelatedEntityNotFoundError,
} from "@/src/modules/products/domain/product.errors";
import {
  createProductSchema,
  formatZodIssues,
  listProductsQuerySchema,
} from "@/src/modules/products/presentation/product.schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsedQuery = listProductsQuerySchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    kind: searchParams.get("kind") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    gender: searchParams.get("gender") ?? undefined,
    active: searchParams.get("active") ?? undefined,
    allowsSale: searchParams.get("allowsSale") ?? undefined,
    allowsRental: searchParams.get("allowsRental") ?? undefined,
    allowsCustomization: searchParams.get("allowsCustomization") ?? undefined,
    brandId: searchParams.get("brandId") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid query params", issues: formatZodIssues(parsedQuery.error) },
      { status: 400 }
    );
  }

  const products = await productService.listProducts(parsedQuery.data);
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();
    const parsedBody = createProductSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const product = await productService.createProduct(parsedBody.data);
    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
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

    return NextResponse.json({ error: "Could not create product" }, { status: 500 });
  }
}
