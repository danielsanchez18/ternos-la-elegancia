import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { bundleService } from "@/src/modules/bundles/application/bundle.service";
import {
  BundleConflictError,
  BundleValidationError,
} from "@/src/modules/bundles/domain/bundle.errors";
import {
  createBundleSchema,
  formatZodIssues,
  listBundlesQuerySchema,
} from "@/src/modules/bundles/presentation/bundle.schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsedQuery = listBundlesQuerySchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    active: searchParams.get("active") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid query params", issues: formatZodIssues(parsedQuery.error) },
      { status: 400 }
    );
  }

  const bundles = await bundleService.listBundles(parsedQuery.data);
  return NextResponse.json(bundles);
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();
    const parsedBody = createBundleSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const bundle = await bundleService.createBundle(parsedBody.data);
    return NextResponse.json(bundle, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof BundleConflictError) {
      return NextResponse.json(
        { error: "Bundle already exists", fields: error.fields },
        { status: 409 }
      );
    }

    if (error instanceof BundleValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not create bundle" }, { status: 500 });
  }
}
