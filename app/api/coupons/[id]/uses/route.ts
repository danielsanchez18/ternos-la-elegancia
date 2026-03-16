import { NextResponse } from "next/server";

import { promotionService } from "@/src/modules/promotions/application/promotion.service";
import { CouponNotFoundError } from "@/src/modules/promotions/domain/promotion.errors";
import {
  couponIdParamSchema,
  formatZodIssues,
} from "@/src/modules/promotions/presentation/promotion.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = couponIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const uses = await promotionService.listCouponUses(parsedParams.data.id);
    return NextResponse.json(uses);
  } catch (error: unknown) {
    if (error instanceof CouponNotFoundError) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not list coupon uses" }, { status: 500 });
  }
}
