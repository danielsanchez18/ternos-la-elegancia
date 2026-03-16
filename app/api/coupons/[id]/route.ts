import { NextResponse } from "next/server";

import { promotionService } from "@/src/modules/promotions/application/promotion.service";
import {
  CouponConflictError,
  CouponNotFoundError,
  PromotionRelatedEntityNotFoundError,
  PromotionValidationError,
} from "@/src/modules/promotions/domain/promotion.errors";
import {
  couponIdParamSchema,
  formatZodIssues,
  updateCouponSchema,
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

    const coupon = await promotionService.getCouponById(parsedParams.data.id);
    return NextResponse.json(coupon);
  } catch (error: unknown) {
    if (error instanceof CouponNotFoundError) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not get coupon" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = couponIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updateCouponSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const coupon = await promotionService.updateCoupon(parsedParams.data.id, parsedBody.data);
    return NextResponse.json(coupon);
  } catch (error: unknown) {
    if (error instanceof CouponNotFoundError) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    if (error instanceof CouponConflictError) {
      return NextResponse.json(
        { error: "Coupon already exists", fields: error.fields },
        { status: 409 }
      );
    }

    if (error instanceof PromotionRelatedEntityNotFoundError) {
      return NextResponse.json(
        { error: "Related entity not found", field: error.entity },
        { status: 400 }
      );
    }

    if (error instanceof PromotionValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not update coupon" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = couponIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const coupon = await promotionService.deactivateCoupon(parsedParams.data.id);
    return NextResponse.json(coupon);
  } catch (error: unknown) {
    if (error instanceof CouponNotFoundError) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not deactivate coupon" }, { status: 500 });
  }
}
