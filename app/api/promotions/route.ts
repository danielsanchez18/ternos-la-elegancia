import { NextResponse } from "next/server";

import { promotionService } from "@/src/modules/promotions/application/promotion.service";
import {
  PromotionConflictError,
  PromotionRelatedEntityNotFoundError,
  PromotionValidationError,
} from "@/src/modules/promotions/domain/promotion.errors";
import {
  createPromotionSchema,
  formatZodIssues,
  listPromotionsQuerySchema,
} from "@/src/modules/promotions/presentation/promotion.schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsedQuery = listPromotionsQuerySchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    scope: searchParams.get("scope") ?? undefined,
    active: searchParams.get("active") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid query params", issues: formatZodIssues(parsedQuery.error) },
      { status: 400 }
    );
  }

  const promotions = await promotionService.listPromotions(parsedQuery.data);
  return NextResponse.json(promotions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = createPromotionSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", issues: formatZodIssues(parsedBody.error) },
        { status: 400 }
      );
    }

    const promotion = await promotionService.createPromotion(parsedBody.data);
    return NextResponse.json(promotion, { status: 201 });
  } catch (error: unknown) {
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

    return NextResponse.json({ error: "Could not create promotion" }, { status: 500 });
  }
}
