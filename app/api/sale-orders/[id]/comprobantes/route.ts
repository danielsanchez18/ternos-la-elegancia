import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { paymentService } from "@/src/modules/payments/application/payment.service";
import {
  ComprobanteOverchargeError,
  PaymentSaleOrderNotFoundError,
} from "@/src/modules/payments/domain/payment.errors";
import {
  createSaleOrderComprobanteSchema,
  formatZodIssues,
  listSaleOrderComprobantesQuerySchema,
  saleOrderIdParamSchema,
} from "@/src/modules/payments/presentation/payment.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

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

    const { searchParams } = new URL(request.url);
    const parsedQuery = listSaleOrderComprobantesQuerySchema.safeParse({
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

    const comprobantes = await paymentService.listSaleOrderComprobantes(
      parsedParams.data.id,
      parsedQuery.data
    );

    return NextResponse.json(comprobantes);
  } catch (error: unknown) {
    if (error instanceof PaymentSaleOrderNotFoundError) {
      return NextResponse.json({ error: "Sale order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not list sale order comprobantes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

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
    const parsedBody = createSaleOrderComprobanteSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const comprobante = await paymentService.createSaleOrderComprobante(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(comprobante, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof PaymentSaleOrderNotFoundError) {
      return NextResponse.json({ error: "Sale order not found" }, { status: 404 });
    }

    if (error instanceof ComprobanteOverchargeError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not create sale order comprobante" },
      { status: 500 }
    );
  }
}
