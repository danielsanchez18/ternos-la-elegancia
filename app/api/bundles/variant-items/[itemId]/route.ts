import { NextResponse } from "next/server";

import { bundleService } from "@/src/modules/bundles/application/bundle.service";
import {
  BundleConflictError,
  BundleRelatedEntityNotFoundError,
  BundleValidationError,
  BundleVariantItemNotFoundError,
} from "@/src/modules/bundles/domain/bundle.errors";
import {
  bundleItemIdParamSchema,
  formatZodIssues,
  updateBundleVariantItemSchema,
} from "@/src/modules/bundles/presentation/bundle.schemas";

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = bundleItemIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateBundleVariantItemSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const item = await bundleService.updateBundleVariantItem(
      parsedParams.data.itemId,
      parsedBody.data
    );

    return NextResponse.json(item);
  } catch (error: unknown) {
    if (error instanceof BundleVariantItemNotFoundError) {
      return NextResponse.json({ error: "Bundle variant item not found" }, { status: 404 });
    }

    if (error instanceof BundleRelatedEntityNotFoundError) {
      return NextResponse.json(
        { error: "Related entity not found", field: error.entity },
        { status: 400 }
      );
    }

    if (error instanceof BundleConflictError) {
      return NextResponse.json(
        { error: "Bundle variant item already exists", fields: error.fields },
        { status: 409 }
      );
    }

    if (error instanceof BundleValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not update bundle variant item" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = bundleItemIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    await bundleService.deleteBundleVariantItem(parsedParams.data.itemId);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof BundleVariantItemNotFoundError) {
      return NextResponse.json({ error: "Bundle variant item not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not delete bundle variant item" }, { status: 500 });
  }
}
