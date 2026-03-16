import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { alterationOrderService } from "@/src/modules/alteration-orders/application/alteration-order.service";
import {
  AlterationOrderNotFoundError,
  AlterationOrderStatusTransitionError,
} from "@/src/modules/alteration-orders/domain/alteration-order.errors";
import {
  alterationOrderActionSchema,
  alterationOrderIdParamSchema,
  formatZodIssues,
} from "@/src/modules/alteration-orders/presentation/alteration-order.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = alterationOrderIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid route params",
          issues: formatZodIssues(parsedParams.error),
        },
        { status: 400 }
      );
    }

    const order = await alterationOrderService.getAlterationOrderById(parsedParams.data.id);
    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof AlterationOrderNotFoundError) {
      return NextResponse.json({ error: "Alteration order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not get alteration order" },
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

    const parsedParams = alterationOrderIdParamSchema.safeParse(await params);

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
    const parsedBody = alterationOrderActionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const order = await alterationOrderService.actOnAlterationOrder(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof AlterationOrderNotFoundError) {
      return NextResponse.json({ error: "Alteration order not found" }, { status: 404 });
    }

    if (error instanceof AlterationOrderStatusTransitionError) {
      return NextResponse.json(
        { error: "Alteration order status transition not allowed" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Could not update alteration order" },
      { status: 500 }
    );
  }
}
