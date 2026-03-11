import { NextResponse } from "next/server";

import { alterationOrderService } from "@/src/modules/alteration-orders/application/alteration-order.service";
import {
  AlterationOrderCustomerNotFoundError,
  AlterationOrderServiceNotFoundError,
  AlterationOrderValidationError,
} from "@/src/modules/alteration-orders/domain/alteration-order.errors";
import {
  createAlterationOrderSchema,
  formatZodIssues,
  listAlterationOrdersQuerySchema,
} from "@/src/modules/alteration-orders/presentation/alteration-order.schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsedQuery = listAlterationOrdersQuerySchema.safeParse({
    customerId: searchParams.get("customerId") ?? undefined,
    serviceId: searchParams.get("serviceId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    code: searchParams.get("code") ?? undefined,
    receivedFrom: searchParams.get("receivedFrom") ?? undefined,
    receivedTo: searchParams.get("receivedTo") ?? undefined,
    promisedFrom: searchParams.get("promisedFrom") ?? undefined,
    promisedTo: searchParams.get("promisedTo") ?? undefined,
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

  const orders = await alterationOrderService.listAlterationOrders(parsedQuery.data);
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = createAlterationOrderSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const order = await alterationOrderService.createAlterationOrder(parsedBody.data);
    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof AlterationOrderCustomerNotFoundError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (error instanceof AlterationOrderServiceNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof AlterationOrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not create alteration order" },
      { status: 500 }
    );
  }
}
