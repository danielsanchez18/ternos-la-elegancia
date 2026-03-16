import { NextResponse } from "next/server";

import { promotionService } from "@/src/modules/promotions/application/promotion.service";
import { PromotionRelatedEntityNotFoundError } from "@/src/modules/promotions/domain/promotion.errors";
import {
  availableCouponsOrderParamsSchema,
  formatZodIssues,
} from "@/src/modules/promotions/presentation/promotion.schemas";

type RouteContext = {
  params: Promise<{ orderType: string; orderId: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = availableCouponsOrderParamsSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
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
