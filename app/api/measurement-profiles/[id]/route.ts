import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { measurementService } from "@/src/modules/measurements/application/measurement.service";
import { MeasurementProfileNotFoundError } from "@/src/modules/measurements/domain/measurement.errors";
import {
  formatZodIssues,
  measurementProfileIdParamSchema,
  updateMeasurementProfileSchema,
} from "@/src/modules/measurements/presentation/measurement.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = measurementProfileIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodIssues(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const profile = await measurementService.getProfileById(parsedParams.data.id);
    return NextResponse.json(profile);
  } catch (error: unknown) {
    if (error instanceof MeasurementProfileNotFoundError) {
      return NextResponse.json(
        { error: "Measurement profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Could not get measurement profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = measurementProfileIdParamSchema.safeParse(await params);

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
    const parsedBody = updateMeasurementProfileSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const profile = await measurementService.updateProfile(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(profile);
  } catch (error: unknown) {
    if (error instanceof MeasurementProfileNotFoundError) {
      return NextResponse.json(
        { error: "Measurement profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Could not update measurement profile" },
      { status: 500 }
    );
  }
}
