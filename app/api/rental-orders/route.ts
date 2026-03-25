import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { rentalOrderService } from "@/src/modules/rental-orders/application/rental-order.service";
import {
  RentalOrderCustomerNotFoundError,
  RentalOrderUnitNotFoundError,
  RentalOrderUnitUnavailableError,
  RentalOrderValidationError,
} from "@/src/modules/rental-orders/domain/rental-order.errors";
import {
  createRentalOrderSchema,
  formatZodIssues,
  listRentalOrdersQuerySchema,
} from "@/src/modules/rental-orders/presentation/rental-order.schemas";

export async function GET(request: Request) {
  const auth = await requireApiAuth(request, "authenticated");
  if (!auth.ok) {
    return auth.response;
  }

  const isAdmin = Boolean(auth.context.adminUserId);
  if (!isAdmin && !auth.context.customerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);

  const parsedQuery = listRentalOrdersQuerySchema.safeParse({
    customerId: searchParams.get("customerId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    code: searchParams.get("code") ?? undefined,
    hasDelay: searchParams.get("hasDelay") ?? undefined,
    hasDamage: searchParams.get("hasDamage") ?? undefined,
    pickupFrom: searchParams.get("pickupFrom") ?? undefined,
    pickupTo: searchParams.get("pickupTo") ?? undefined,
    dueFrom: searchParams.get("dueFrom") ?? undefined,
    dueTo: searchParams.get("dueTo") ?? undefined,
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

  const orders = await rentalOrderService.listRentalOrders({
    ...parsedQuery.data,
    customerId: isAdmin ? parsedQuery.data.customerId : auth.context.customerId!,
  });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();
    const parsedBody = createRentalOrderSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const order = await rentalOrderService.createRentalOrder(parsedBody.data);
    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof RentalOrderCustomerNotFoundError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (error instanceof RentalOrderUnitNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof RentalOrderUnitUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof RentalOrderValidationError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not create rental order" },
      { status: 500 }
    );
  }
}
