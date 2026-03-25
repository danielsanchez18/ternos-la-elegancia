import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { productService } from "@/src/modules/products/application/product.service";
import { ProductVariantImageNotFoundError } from "@/src/modules/products/domain/product.errors";
import {
  removePersistedVariantImageFile,
  resolveStoredVariantImageAbsolutePathFromUrl,
} from "@/src/modules/products/infrastructure/variant-image-storage";
import {
  formatZodIssues,
  productVariantImageIdParamSchema,
  updateProductVariantImageSchema,
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

    const parsedParams = productVariantImageIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateProductVariantImageSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const image = await productService.updateProductVariantImage(
      parsedParams.data.imageId,
      parsedBody.data
    );
    return NextResponse.json(image);
  } catch (error: unknown) {
    if (error instanceof ProductVariantImageNotFoundError) {
      return NextResponse.json(
        { error: "Product variant image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Could not update product variant image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = productVariantImageIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const currentImage = await productService.getProductVariantImageById(
      parsedParams.data.imageId
    );
    const absolutePath = resolveStoredVariantImageAbsolutePathFromUrl(currentImage.url);

    await productService.deleteProductVariantImage(parsedParams.data.imageId);
    if (absolutePath) {
      await removePersistedVariantImageFile(absolutePath);
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof ProductVariantImageNotFoundError) {
      return NextResponse.json(
        { error: "Product variant image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Could not delete product variant image" },
      { status: 500 }
    );
  }
}
