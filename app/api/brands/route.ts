import { NextResponse } from "next/server";

import { productService } from "@/src/modules/products/application/product.service";
import { BrandConflictError } from "@/src/modules/products/domain/product.errors";
import {
  createBrandSchema,
  formatZodIssues,
} from "@/src/modules/products/presentation/product.schemas";

export async function GET() {
  const brands = await productService.listBrands();
  return NextResponse.json(brands);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = createBrandSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const brand = await productService.createBrand(parsedBody.data);
    return NextResponse.json(brand, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof BrandConflictError) {
      return NextResponse.json(
        { error: "Brand already exists", fields: error.fields },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Could not create brand" }, { status: 500 });
  }
}
