import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAuth } from "@/lib/api-auth";
import { generateIzipaySessionToken } from "@/lib/izipay";
import { prisma } from "@/lib/prisma";
import { isUuidLike } from "@/src/security/public-id";

const yapeSessionTokenRequestSchema = z.object({
  orderType: z.enum(["sale", "custom", "rental", "alteration"]),
  orderId: z.string().trim().uuid().transform((value) => value.toLowerCase()),
});

type OrderCheckoutContext = {
  id: string;
  code: string;
  customerId: string;
  total: Prisma.Decimal;
};

async function loadOrderContext(
  orderType: "sale" | "custom" | "rental" | "alteration",
  orderId: string,
  customerId?: string
): Promise<OrderCheckoutContext | null> {
  if (!isUuidLike(orderId)) {
    return null;
  }

  const whereClause = customerId ? { id: orderId, customerId } : { id: orderId };

  if (orderType === "sale") {
    const order = await prisma.saleOrder.findFirst({
      where: whereClause,
      select: { id: true, code: true, customerId: true, total: true },
    });

    return order;
  }

  if (orderType === "custom") {
    const order = await prisma.customOrder.findFirst({
      where: whereClause,
      select: { id: true, code: true, customerId: true, total: true },
    });

    return order;
  }

  if (orderType === "rental") {
    const order = await prisma.rentalOrder.findFirst({
      where: whereClause,
      select: { id: true, code: true, customerId: true, total: true },
    });

    return order;
  }

  const order = await prisma.alterationOrder.findFirst({
    where: whereClause,
    select: { id: true, code: true, customerId: true, total: true },
  });

  return order;
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth(request, "authenticated");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedBody = yapeSessionTokenRequestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          issues: parsedBody.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const ownedCustomerId = auth.context.adminUserId
      ? undefined
      : auth.context.customerId ?? undefined;

    if (!auth.context.adminUserId && !ownedCustomerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const order = await loadOrderContext(parsedBody.data.orderType, parsedBody.data.orderId, ownedCustomerId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.total.gt(new Prisma.Decimal(2000))) {
      return NextResponse.json(
        {
          error:
            "Yape code payments are only allowed for totals up to S/ 2000",
        },
        { status: 409 }
      );
    }

    const sessionToken = await generateIzipaySessionToken();

    return NextResponse.json({
      authorization: sessionToken.token,
      tokenSource: sessionToken.source,
      mockMode: sessionToken.source === "mock",
      keyRSA: process.env.IZIPAY_RSA_PUBLIC_KEY ?? null,
      merchantCode: process.env.IZIPAY_MERCHANT_CODE ?? null,
      checkout: {
        orderType: parsedBody.data.orderType,
        orderId: order.id,
        orderPublicId: order.id,
        orderCode: order.code,
        currency: "PEN",
        amount: order.total.toFixed(2),
        processType: "AT",
        merchantBuyerId: String(order.customerId),
        dateTimeTransaction: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not generate Izipay session token",
      },
      { status: 500 }
    );
  }
}
