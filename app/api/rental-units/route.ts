import { NextResponse } from "next/server";

import { rentalUnitService } from "@/src/modules/rental-units/application/rental-unit.service";
import {
  RentalUnitConflictError,
  RentalUnitProductNotFoundError,
  RentalUnitValidationError,
  RentalUnitVariantNotFoundError,
} from "@/src/modules/rental-units/domain/rental-unit.errors";
import {
  createRentalUnitSchema,
  formatZodIssues,
  listRentalUnitsQuerySchema,
} from "@/src/modules/rental-units/presentation/rental-unit.schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsedQuery = listRentalUnitsQuerySchema.safeParse({
    productId: searchParams.get("productId") ?? undefined,
    variantId: searchParams.get("variantId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    currentTier: searchParams.get("currentTier") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid query params", issues: formatZodIssues(parsedQuery.error) },
      { status: 400 }
    );
  }

  const units = await rentalUnitService.listRentalUnits(parsedQuery.data);
  return NextResponse.json(units);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = createRentalUnitSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const unit = await rentalUnitService.createRentalUnit(parsedBody.data);
    return NextResponse.json(unit, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof RentalUnitProductNotFoundError) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (error instanceof RentalUnitVariantNotFoundError) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    if (error instanceof RentalUnitConflictError) {
      return NextResponse.json(
        { error: "Rental unit already exists", fields: error.fields },
        { status: 409 }
      );
    }

    if (error instanceof RentalUnitValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: "Could not create rental unit" }, { status: 500 });
  }
}
