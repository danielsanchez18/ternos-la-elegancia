import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { paymentService } from "@/src/modules/payments/application/payment.service";
import {
  PaymentOverchargeError,
  PaymentRentalOrderNotFoundError,
} from "@/src/modules/payments/domain/payment.errors";
import {
  createRentalOrderPaymentSchema,
  formatZodIssues,
  listRentalOrderPaymentsQuerySchema,
  rentalOrderIdParamSchema,
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

    const parsedParams = rentalOrderIdParamSchema.safeParse(await params);

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
    const parsedQuery = listRentalOrderPaymentsQuerySchema.safeParse({
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

    const payments = await paymentService.listRentalOrderPayments(
      parsedParams.data.id,
      parsedQuery.data
    );

    const summary = await paymentService.getRentalOrderPaymentSummary(
      parsedParams.data.id
    );

    return NextResponse.json({ payments, summary });
  } catch (error: unknown) {
    if (error instanceof PaymentRentalOrderNotFoundError) {
      return NextResponse.json({ error: "Rental order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Could not list rental order payments" },
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

    const parsedParams = rentalOrderIdParamSchema.safeParse(await params);

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
    const parsedBody = createRentalOrderPaymentSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: formatZodIssues(parsedBody.error),
        },
        { status: 400 }
      );
    }

    const result = await paymentService.createRentalOrderPayment(
      parsedParams.data.id,
      parsedBody.data
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof PaymentRentalOrderNotFoundError) {
      return NextResponse.json({ error: "Rental order not found" }, { status: 404 });
    }

    if (error instanceof PaymentOverchargeError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Could not create rental order payment" },
      { status: 500 }
    );
  }
}
