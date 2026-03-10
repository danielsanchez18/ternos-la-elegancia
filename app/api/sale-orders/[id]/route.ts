import { NextResponse } from "next/server";

import { saleOrderService } from "@/src/modules/sale-orders/application/sale-order.service";
import {
  SaleOrderNotFoundError,
  SaleOrderPaymentRequiredError,
  SaleOrderStatusTransitionError,
} from "@/src/modules/sale-orders/domain/sale-order.errors";
import {
  formatZodIssues,
  saleOrderActionSchema,
  saleOrderIdParamSchema,
} from "@/src/modules/sale-orders/presentation/sale-order.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = saleOrderIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodIssues(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const order = await saleOrderService.getSaleOrderById(parsedParams.data.id);
    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof SaleOrderNotFoundError) {
      return NextResponse.json({ error: "Sale order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not get sale order" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = saleOrderIdParamSchema.safeParse(await params);

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
    const parsedBody = saleOrderActionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const order = await saleOrderService.actOnSaleOrder(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof SaleOrderNotFoundError) {
      return NextResponse.json({ error: "Sale order not found" }, { status: 404 });
    }

    if (error instanceof SaleOrderStatusTransitionError) {
      return NextResponse.json(
        { error: "Sale order status transition not allowed" },
        { status: 409 }
      );
    }

    if (error instanceof SaleOrderPaymentRequiredError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not update sale order" },
      { status: 500 }
    );
  }
}
