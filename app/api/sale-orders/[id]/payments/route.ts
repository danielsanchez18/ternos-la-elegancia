import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { paymentService } from "@/src/modules/payments/application/payment.service";
import {
  PaymentOverchargeError,
  PaymentSaleOrderNotFoundError,
} from "@/src/modules/payments/domain/payment.errors";
import {
  createSaleOrderPaymentSchema,
  formatZodIssues,
  listSaleOrderPaymentsQuerySchema,
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
    const parsedQuery = listSaleOrderPaymentsQuerySchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      concept: searchParams.get("concept") ?? undefined,
      method: searchParams.get("method") ?? undefined,
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

    const payments = await paymentService.listSaleOrderPayments(
      parsedParams.data.id,
      parsedQuery.data
    );

    const summary = await paymentService.getSaleOrderPaymentSummary(
      parsedParams.data.id
    );

    return NextResponse.json({ payments, summary });
  } catch (error: unknown) {
    if (error instanceof PaymentSaleOrderNotFoundError) {
      return NextResponse.json({ error: "Sale order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not list sale order payments" },
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
    const parsedBody = createSaleOrderPaymentSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const result = await paymentService.createSaleOrderPayment(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof PaymentSaleOrderNotFoundError) {
      return NextResponse.json({ error: "Sale order not found" }, { status: 404 });
    }

    if (error instanceof PaymentOverchargeError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not create sale order payment" },
      { status: 500 }
    );
  }
}
