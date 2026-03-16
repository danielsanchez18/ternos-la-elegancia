import { NextResponse } from "next/server";

import { promotionService } from "@/src/modules/promotions/application/promotion.service";
import {
  CouponConflictError,
  PromotionRelatedEntityNotFoundError,
  PromotionValidationError,
} from "@/src/modules/promotions/domain/promotion.errors";
import {
  createCouponSchema,
  formatZodIssues,
  listCouponsQuerySchema,
} from "@/src/modules/promotions/presentation/promotion.schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsedQuery = listCouponsQuerySchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    active: searchParams.get("active") ?? undefined,
    promotionId: searchParams.get("promotionId") ?? undefined,
    bundleId: searchParams.get("bundleId") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid query params", issues: formatZodIssues(parsedQuery.error) },
      { status: 400 }
    );
  }

  const coupons = await promotionService.listCoupons(parsedQuery.data);
  return NextResponse.json(coupons);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = createCouponSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const coupon = await promotionService.createCoupon(parsedBody.data);
    return NextResponse.json(coupon, { status: 201 });
  } catch (error: unknown) {
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

    return NextResponse.json({ error: "Could not create coupon" }, { status: 500 });
  }
}
