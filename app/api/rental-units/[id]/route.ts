import { NextResponse } from "next/server";

import { rentalUnitService } from "@/src/modules/rental-units/application/rental-unit.service";
import {
  RentalUnitNotFoundError,
  RentalUnitValidationError,
  RentalUnitVariantNotFoundError,
} from "@/src/modules/rental-units/domain/rental-unit.errors";
import {
  formatZodIssues,
  rentalUnitIdParamSchema,
  updateRentalUnitSchema,
} from "@/src/modules/rental-units/presentation/rental-unit.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = rentalUnitIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const unit = await rentalUnitService.getRentalUnitById(parsedParams.data.id);
    return NextResponse.json(unit);
  } catch (error: unknown) {
    if (error instanceof RentalUnitNotFoundError) {
      return NextResponse.json({ error: "Rental unit not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not get rental unit" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = rentalUnitIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateRentalUnitSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const unit = await rentalUnitService.updateRentalUnit(parsedParams.data.id, parsedBody.data);
    return NextResponse.json(unit);
  } catch (error: unknown) {
    if (error instanceof RentalUnitNotFoundError) {
      return NextResponse.json({ error: "Rental unit not found" }, { status: 404 });
    }

    if (error instanceof RentalUnitVariantNotFoundError) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    if (error instanceof RentalUnitValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: "Could not update rental unit" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = rentalUnitIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const unit = await rentalUnitService.retireRentalUnit(parsedParams.data.id);
    return NextResponse.json(unit);
  } catch (error: unknown) {
    if (error instanceof RentalUnitNotFoundError) {
      return NextResponse.json({ error: "Rental unit not found" }, { status: 404 });
    }

    if (error instanceof RentalUnitValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: "Could not retire rental unit" }, { status: 500 });
  }
}
