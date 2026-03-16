import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/api-auth";
import { promotionService } from "@/src/modules/promotions/application/promotion.service";
import {
  CouponUseNotFoundError,
  PromotionValidationError,
} from "@/src/modules/promotions/domain/promotion.errors";
import {
  couponUseIdParamSchema,
  formatZodIssues,
} from "@/src/modules/promotions/presentation/promotion.schemas";

type RouteContext = {
  params: Promise<{ useId: string }>;
};

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const auth = await requireApiAuth(request, "admin");
    if (!auth.ok) {
      return auth.response;
    }

    const parsedParams = couponUseIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const result = await promotionService.revertCouponUse(parsedParams.data.useId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof CouponUseNotFoundError) {
      return NextResponse.json({ error: "Coupon use not found" }, { status: 404 });
    }

    if (error instanceof PromotionValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not revert coupon use" }, { status: 500 });
  }
}
