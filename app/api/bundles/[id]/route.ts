import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { bundleService } from "@/src/modules/bundles/application/bundle.service";
import {
  BundleConflictError,
  BundleNotFoundError,
  BundleValidationError,
} from "@/src/modules/bundles/domain/bundle.errors";
import {
  bundleIdParamSchema,
  formatZodIssues,
  updateBundleSchema,
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

    const bundle = await bundleService.getBundleById(parsedParams.data.id);
    return NextResponse.json(bundle);
  } catch (error: unknown) {
    if (error instanceof BundleNotFoundError) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not get bundle" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = bundleIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateBundleSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const bundle = await bundleService.updateBundle(parsedParams.data.id, parsedBody.data);
    return NextResponse.json(bundle);
  } catch (error: unknown) {
    if (error instanceof BundleNotFoundError) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    if (error instanceof BundleConflictError) {
      return NextResponse.json(
        { error: "Bundle already exists", fields: error.fields },
        { status: 409 }
      );
    }

    if (error instanceof BundleValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not update bundle" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = bundleIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const bundle = await bundleService.deactivateBundle(parsedParams.data.id);
    return NextResponse.json(bundle);
  } catch (error: unknown) {
    if (error instanceof BundleNotFoundError) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not deactivate bundle" }, { status: 500 });
  }
}
