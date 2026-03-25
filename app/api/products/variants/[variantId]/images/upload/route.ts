import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { productService } from "@/src/modules/products/application/product.service";
import { ProductVariantNotFoundError } from "@/src/modules/products/domain/product.errors";
import {
  MAX_VARIANT_IMAGE_SIZE_BYTES,
  isSupportedVariantImageMimeType,
  persistVariantImageFile,
  removePersistedVariantImageFile,
} from "@/src/modules/products/infrastructure/variant-image-storage";
import {
  formatZodIssues,
  productVariantIdParamSchema,
} from "@/src/modules/products/presentation/product.schemas";

type RouteContext = {
  params: Promise<{ variantId: string }>;
};

function parseSortOrder(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return Number.NaN;
  }

  return parsed;
}

export async function POST(request: Request, { params }: RouteContext) {
  let storedAbsolutePath: string | null = null;

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

    await productService.getProductVariantById(parsedParams.data.variantId);

    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (!isSupportedVariantImageMimeType(fileEntry.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported image type. Use JPG, PNG, WEBP or AVIF.",
        },
        { status: 415 }
      );
    }

    if (fileEntry.size <= 0) {
      return NextResponse.json({ error: "Image file is empty" }, { status: 400 });
    }

    if (fileEntry.size > MAX_VARIANT_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image exceeds max size of 8MB" },
        { status: 400 }
      );
    }

    const sortOrder = parseSortOrder(formData.get("sortOrder"));
    if (sortOrder !== undefined && Number.isNaN(sortOrder)) {
      return NextResponse.json(
        { error: "sortOrder must be an integer >= 0" },
        { status: 400 }
      );
    }

    const altTextEntry = formData.get("altText");
    const altText =
      typeof altTextEntry === "string" && altTextEntry.trim()
        ? altTextEntry.trim()
        : undefined;

    const persisted = await persistVariantImageFile({
      variantId: parsedParams.data.variantId,
      file: fileEntry,
    });
    storedAbsolutePath = persisted.absolutePath;

    const image = await productService.createProductVariantImage(
      parsedParams.data.variantId,
      {
        url: persisted.url,
        altText,
        sortOrder,
      }
    );

    return NextResponse.json(image, { status: 201 });
  } catch (error: unknown) {
    if (storedAbsolutePath) {
      await removePersistedVariantImageFile(storedAbsolutePath);
    }

    if (error instanceof ProductVariantNotFoundError) {
      return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not upload variant image" },
      { status: 500 }
    );
  }
}
