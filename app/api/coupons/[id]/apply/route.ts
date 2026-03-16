import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { promotionService } from "@/src/modules/promotions/application/promotion.service";
import {
  CouponNotFoundError,
  PromotionRelatedEntityNotFoundError,
  PromotionValidationError,
} from "@/src/modules/promotions/domain/promotion.errors";
import {
  applyCouponSchema,
  couponIdParamSchema,
  formatZodIssues,
} from "@/src/modules/promotions/presentation/promotion.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = couponIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = applyCouponSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const result = await promotionService.applyCouponToOrder({
      couponId: parsedParams.data.id,
      orderType: parsedBody.data.orderType,
      orderId: parsedBody.data.orderId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof CouponNotFoundError) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    if (error instanceof PromotionRelatedEntityNotFoundError) {
      return NextResponse.json(
        { error: "Related entity not found", field: error.entity },
        { status: 404 }
      );
    }

    if (error instanceof PromotionValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not apply coupon" }, { status: 500 });
  }
}
