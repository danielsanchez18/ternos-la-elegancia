import { NextResponse } from "next/server";

import { paymentService } from "@/src/modules/payments/application/payment.service";
import {
  ComprobanteOverchargeError,
  PaymentCustomOrderNotFoundError,
} from "@/src/modules/payments/domain/payment.errors";
import {
  createCustomOrderComprobanteSchema,
  customOrderIdParamSchema,
  formatZodIssues,
  listCustomOrderComprobantesQuerySchema,
} from "@/src/modules/payments/presentation/payment.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
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

    const { searchParams } = new URL(request.url);
    const parsedQuery = listCustomOrderComprobantesQuerySchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
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

    const comprobantes = await paymentService.listCustomOrderComprobantes(
      parsedParams.data.id,
      parsedQuery.data
    );

    return NextResponse.json(comprobantes);
  } catch (error: unknown) {
    if (error instanceof PaymentCustomOrderNotFoundError) {
      return NextResponse.json(
        { error: "Custom order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Could not list custom order comprobantes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
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
    const parsedBody = createCustomOrderComprobanteSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const comprobante = await paymentService.createCustomOrderComprobante(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(comprobante, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof PaymentCustomOrderNotFoundError) {
      return NextResponse.json(
        { error: "Custom order not found" },
        { status: 404 }
      );
    }

    if (error instanceof ComprobanteOverchargeError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not create custom order comprobante" },
      { status: 500 }
    );
  }
}
