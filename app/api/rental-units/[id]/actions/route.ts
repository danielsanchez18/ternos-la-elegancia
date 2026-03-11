import { NextResponse } from "next/server";

import { rentalUnitService } from "@/src/modules/rental-units/application/rental-unit.service";
import {
  RentalUnitNotFoundError,
  RentalUnitValidationError,
} from "@/src/modules/rental-units/domain/rental-unit.errors";
import {
  formatZodIssues,
  rentalUnitActionSchema,
  rentalUnitIdParamSchema,
} from "@/src/modules/rental-units/presentation/rental-unit.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
    const parsedBody = rentalUnitActionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const unit = await rentalUnitService.actOnRentalUnit(parsedParams.data.id, parsedBody.data);
    return NextResponse.json(unit);
  } catch (error: unknown) {
    if (error instanceof RentalUnitNotFoundError) {
      return NextResponse.json({ error: "Rental unit not found" }, { status: 404 });
    }

    if (error instanceof RentalUnitValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: "Could not perform rental unit action" }, { status: 500 });
  }
}
