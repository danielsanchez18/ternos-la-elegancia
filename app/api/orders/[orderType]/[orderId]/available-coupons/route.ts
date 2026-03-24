import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/api-auth";
import { promotionService } from "@/src/modules/promotions/application/promotion.service";
import { PromotionRelatedEntityNotFoundError } from "@/src/modules/promotions/domain/promotion.errors";
import { formatZodIssues } from "@/src/modules/promotions/presentation/promotion.schemas";

type RouteContext = {
  params: Promise<{ orderType: string; orderId: string }>;
};

const availableCouponsOrderParamsSchema = z.object({
  orderType: z.enum(["sale", "custom", "rental", "alteration"]),
  orderId: z.string().uuid().transform((value) => value.toLowerCase()),
});

async function customerOwnsOrder(
  customerId: string,
  orderType: "sale" | "custom" | "rental" | "alteration",
  orderId: string
) {
  if (orderType === "sale") {
    const order = await prisma.saleOrder.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });

    return order?.customerId === customerId;
  }

  if (orderType === "custom") {
    const order = await prisma.customOrder.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });

    return order?.customerId === customerId;
  }

  if (orderType === "rental") {
    const order = await prisma.rentalOrder.findUnique({
      where: { id: orderId },
      select: { customerId: true },
    });

    return order?.customerId === customerId;
  }

  const order = await prisma.alterationOrder.findUnique({
    where: { id: orderId },
    select: { customerId: true },
  });

  return order?.customerId === customerId;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "authenticated");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = availableCouponsOrderParamsSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    if (!auth.context.adminUserId) {
      if (!auth.context.customerId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const hasAccess = await customerOwnsOrder(
        auth.context.customerId,
        parsedParams.data.orderType,
        parsedParams.data.orderId
      );

      if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const coupons = await promotionService.listAvailableCouponsForOrder(parsedParams.data);
    return NextResponse.json(coupons);
  } catch (error: unknown) {
    if (error instanceof PromotionRelatedEntityNotFoundError) {
      return NextResponse.json(
        { error: "Related entity not found", field: error.entity },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: "Could not list available coupons" }, { status: 500 });
  }
}
