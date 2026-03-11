import { NextResponse } from "next/server";

import { rentalOrderService } from "@/src/modules/rental-orders/application/rental-order.service";
import {
  RentalOrderNotFoundError,
  RentalOrderTransitionError,
} from "@/src/modules/rental-orders/domain/rental-order.errors";
import {
  formatZodIssues,
  rentalOrderActionSchema,
  rentalOrderIdParamSchema,
} from "@/src/modules/rental-orders/presentation/rental-order.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = rentalOrderIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodIssues(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const order = await rentalOrderService.getRentalOrderById(parsedParams.data.id);
    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof RentalOrderNotFoundError) {
      return NextResponse.json({ error: "Rental order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not get rental order" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = rentalOrderIdParamSchema.safeParse(await params);

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
    const parsedBody = rentalOrderActionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const order = await rentalOrderService.actOnRentalOrder(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof RentalOrderNotFoundError) {
      return NextResponse.json({ error: "Rental order not found" }, { status: 404 });
    }

    if (error instanceof RentalOrderTransitionError) {
      return NextResponse.json(
        { error: "Rental order status transition not allowed" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Could not update rental order" },
      { status: 500 }
    );
  }
}
