import { NextResponse } from "next/server";

import { saleOrderService } from "@/src/modules/sale-orders/application/sale-order.service";
import {
  SaleOrderCustomerNotFoundError,
  SaleOrderItemReferenceError,
} from "@/src/modules/sale-orders/domain/sale-order.errors";
import {
  createSaleOrderSchema,
  formatZodIssues,
  listSaleOrdersQuerySchema,
} from "@/src/modules/sale-orders/presentation/sale-order.schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsedQuery = listSaleOrdersQuerySchema.safeParse({
    customerId: searchParams.get("customerId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    code: searchParams.get("code") ?? undefined,
    requestedFrom: searchParams.get("requestedFrom") ?? undefined,
    requestedTo: searchParams.get("requestedTo") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    orderBy: searchParams.get("orderBy") ?? undefined,
    order: searchParams.get("order") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        error: "Invalid query params",
        issues: formatZodIssues(parsedQuery.error),
      },
      { status: 400 }
    );
  }

  const orders = await saleOrderService.listSaleOrders(parsedQuery.data);
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = createSaleOrderSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const order = await saleOrderService.createSaleOrder(parsedBody.data);
    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof SaleOrderCustomerNotFoundError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (error instanceof SaleOrderItemReferenceError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not create sale order" },
      { status: 500 }
    );
  }
}
