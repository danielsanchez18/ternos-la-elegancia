import { NextResponse } from "next/server";

import { bundleService } from "@/src/modules/bundles/application/bundle.service";
import {
  BundleConflictError,
  BundleNotFoundError,
  BundleRelatedEntityNotFoundError,
  BundleValidationError,
} from "@/src/modules/bundles/domain/bundle.errors";
import {
  bundleIdParamSchema,
  createBundleVariantItemSchema,
  formatZodIssues,
} from "@/src/modules/bundles/presentation/bundle.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = bundleIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const items = await bundleService.listBundleVariantItems(parsedParams.data.id);
    return NextResponse.json(items);
  } catch (error: unknown) {
    if (error instanceof BundleNotFoundError) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not list bundle variant items" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = bundleIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = createBundleVariantItemSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const item = await bundleService.createBundleVariantItem(parsedParams.data.id, parsedBody.data);
    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof BundleNotFoundError) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
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

    return NextResponse.json({ error: "Could not create bundle variant item" }, { status: 500 });
  }
}
