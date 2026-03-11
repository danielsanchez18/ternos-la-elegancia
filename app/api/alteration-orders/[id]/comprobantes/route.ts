import { NextResponse } from "next/server";

import { paymentService } from "@/src/modules/payments/application/payment.service";
import {
  ComprobanteOverchargeError,
  PaymentAlterationOrderNotFoundError,
} from "@/src/modules/payments/domain/payment.errors";
import {
  alterationOrderIdParamSchema,
  createAlterationOrderComprobanteSchema,
  formatZodIssues,
  listAlterationOrderComprobantesQuerySchema,
} from "@/src/modules/payments/presentation/payment.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
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

    const { searchParams } = new URL(request.url);
    const parsedQuery = listAlterationOrderComprobantesQuerySchema.safeParse({
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

    const comprobantes = await paymentService.listAlterationOrderComprobantes(
      parsedParams.data.id,
      parsedQuery.data
    );

    return NextResponse.json(comprobantes);
  } catch (error: unknown) {
    if (error instanceof PaymentAlterationOrderNotFoundError) {
      return NextResponse.json(
        { error: "Alteration order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Could not list alteration order comprobantes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
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
    const parsedBody = createAlterationOrderComprobanteSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const comprobante = await paymentService.createAlterationOrderComprobante(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(comprobante, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof PaymentAlterationOrderNotFoundError) {
      return NextResponse.json(
        { error: "Alteration order not found" },
        { status: 404 }
      );
    }

    if (error instanceof ComprobanteOverchargeError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not create alteration order comprobante" },
      { status: 500 }
    );
  }
}
