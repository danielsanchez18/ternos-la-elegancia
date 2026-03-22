import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { customOrderService } from "@/src/modules/custom-orders/application/custom-order.service";
import {
  CustomOrderAdvancePaymentRequiredError,
  CustomOrderNotFoundError,
  CustomOrderStatusTransitionError,
} from "@/src/modules/custom-orders/domain/custom-order.errors";
import {
  customOrderActionSchema,
  customOrderIdParamSchema,
  formatZodIssues,
  updateCustomOrderSchema,
} from "@/src/modules/custom-orders/presentation/custom-order.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = customOrderIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodIssues(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const order = await customOrderService.getCustomOrderById(parsedParams.data.id);
    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof CustomOrderNotFoundError) {
      return NextResponse.json(
        { error: "Custom order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Could not get custom order" },
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

    const parsedParams = customOrderIdParamSchema.safeParse(await params);

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
    const parsedBody = customOrderActionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const order = await customOrderService.actOnCustomOrder(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof CustomOrderNotFoundError) {
      return NextResponse.json(
        { error: "Custom order not found" },
        { status: 404 }
      );
    }

    if (error instanceof CustomOrderStatusTransitionError) {
      return NextResponse.json(
        { error: "Custom order status transition not allowed" },
        { status: 409 }
      );
    }

    if (error instanceof CustomOrderAdvancePaymentRequiredError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not update custom order" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = customOrderIdParamSchema.safeParse(await params);

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
    const parsedBody = updateCustomOrderSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const order = await customOrderService.updateCustomOrder(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof CustomOrderNotFoundError) {
      return NextResponse.json(
        { error: "Custom order not found" },
        { status: 404 }
      );
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
      { error: "Could not update custom order" },
      { status: 500 }
    );
  }
}
