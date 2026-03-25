import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { measurementService } from "@/src/modules/measurements/application/measurement.service";
import {
  MeasurementCustomerNotFoundError,
  MeasurementGarmentConflictError,
} from "@/src/modules/measurements/domain/measurement.errors";
import {
  createMeasurementProfileSchema,
  customerIdParamSchema,
  formatZodIssues,
} from "@/src/modules/measurements/presentation/measurement.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const auth = await requireApiAuth(request, "authenticated");
  if (!auth.ok) {
    return auth.response;
  }

  const parsedParams = customerIdParamSchema.safeParse(await params);

  const isAdmin = Boolean(auth.context.adminUserId);
  if (!isAdmin && (!auth.context.customerId || auth.context.customerId !== parsedParams.data?.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!parsedParams.success) {
    return NextResponse.json(
      {
        error: "Invalid route params",
        issues: formatZodIssues(parsedParams.error),
      },
      { status: 400 }
    );
  }

  const profiles = await measurementService.listProfilesByCustomer(
    parsedParams.data.id
  );

  return NextResponse.json(profiles);
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = customerIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodIssues(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = createMeasurementProfileSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const profile = await measurementService.createProfile({
      customerId: parsedParams.data.id,
      ...parsedBody.data,
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof MeasurementCustomerNotFoundError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (error instanceof MeasurementGarmentConflictError) {
      return NextResponse.json(
        { error: "Duplicated garment type in profile" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Could not create measurement profile" },
      { status: 500 }
    );
  }
}
