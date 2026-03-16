import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { customOrderService } from "@/src/modules/custom-orders/application/custom-order.service";
import {
  CustomOrderCustomerNotFoundError,
  CustomOrderCustomizationNotFoundError,
  CustomOrderFabricNotFoundError,
  CustomOrderMeasurementNotValidError,
} from "@/src/modules/custom-orders/domain/custom-order.errors";
import {
  createCustomOrderSchema,
  formatZodIssues,
  listCustomOrdersQuerySchema,
} from "@/src/modules/custom-orders/presentation/custom-order.schemas";

export async function GET(request: Request) {
  const auth = await requireApiAuth(request, "admin");
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);

  const parsedQuery = listCustomOrdersQuerySchema.safeParse({
    customerId: searchParams.get("customerId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    code: searchParams.get("code") ?? undefined,
    requiresMeasurement: searchParams.get("requiresMeasurement") ?? undefined,
    firstPurchaseFlow: searchParams.get("firstPurchaseFlow") ?? undefined,
    createdFrom: searchParams.get("createdFrom") ?? undefined,
    createdTo: searchParams.get("createdTo") ?? undefined,
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

  const orders = await customOrderService.listCustomOrders(parsedQuery.data);
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();
    const parsedBody = createCustomOrderSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const order = await customOrderService.createCustomOrder(parsedBody.data);
    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof CustomOrderCustomerNotFoundError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (error instanceof CustomOrderFabricNotFoundError) {
      return NextResponse.json({ error: "Fabric not found" }, { status: 404 });
    }

    if (error instanceof CustomOrderCustomizationNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof CustomOrderMeasurementNotValidError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not create custom order" },
      { status: 500 }
    );
  }
}
