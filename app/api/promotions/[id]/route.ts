import { NextResponse } from "next/server";

import { promotionService } from "@/src/modules/promotions/application/promotion.service";
import {
  PromotionConflictError,
  PromotionNotFoundError,
  PromotionRelatedEntityNotFoundError,
  PromotionValidationError,
} from "@/src/modules/promotions/domain/promotion.errors";
import {
  formatZodIssues,
  promotionIdParamSchema,
  updatePromotionSchema,
} from "@/src/modules/promotions/presentation/promotion.schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = promotionIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const promotion = await promotionService.getPromotionById(parsedParams.data.id);
    return NextResponse.json(promotion);
  } catch (error: unknown) {
    if (error instanceof PromotionNotFoundError) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not get promotion" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const parsedParams = promotionIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsedBody = updatePromotionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const promotion = await promotionService.updatePromotion(parsedParams.data.id, parsedBody.data);
    return NextResponse.json(promotion);
  } catch (error: unknown) {
    if (error instanceof PromotionNotFoundError) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    if (error instanceof PromotionConflictError) {
      return NextResponse.json(
        { error: "Promotion already exists", fields: error.fields },
        { status: 409 }
      );
    }

    if (error instanceof PromotionValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof PromotionRelatedEntityNotFoundError) {
      return NextResponse.json(
        { error: "Related entity not found", field: error.entity },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Could not update promotion" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const parsedParams = promotionIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: "Invalid route params", issues: formatZodIssues(parsedParams.error) },
        { status: 400 }
      );
    }

    const promotion = await promotionService.deactivatePromotion(parsedParams.data.id);
    return NextResponse.json(promotion);
  } catch (error: unknown) {
    if (error instanceof PromotionNotFoundError) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Could not deactivate promotion" }, { status: 500 });
  }
}
