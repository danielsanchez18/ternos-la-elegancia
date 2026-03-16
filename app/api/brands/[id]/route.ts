import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { productService } from "@/src/modules/products/application/product.service";
import {
  BrandConflictError,
  BrandNotFoundError,
} from "@/src/modules/products/domain/product.errors";
import {
  brandIdParamSchema,
  formatZodIssues,
  updateBrandSchema,
} from "@/src/modules/products/presentation/product.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(_, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = brandIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const brand = await productService.getBrandById(parsedParams.data.id);
    return NextResponse.json(brand);
  } catch (error: unknown) {
    if (error instanceof BrandNotFoundError) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not get brand" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = brandIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateBrandSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const brand = await productService.updateBrand(parsedParams.data.id, parsedBody.data);
    return NextResponse.json(brand);
  } catch (error: unknown) {
    if (error instanceof BrandNotFoundError) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    if (error instanceof BrandConflictError) {
      return NextResponse.json(
        { error: "Brand already exists", fields: error.fields },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Could not update brand" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(_, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = brandIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const brand = await productService.deactivateBrand(parsedParams.data.id);
    return NextResponse.json(brand);
  } catch (error: unknown) {
    if (error instanceof BrandNotFoundError) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not deactivate brand" }, { status: 500 });
  }
}
