import { DiscountType, PromotionScope } from "@prisma/client";
import { z } from "zod";

const booleanFromQuery = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value, context) => {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    context.addIssue({
      code: "custom",
      message: "Expected true or false",
    });

    return z.NEVER;
  });

export const promotionIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const couponIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const couponUseIdParamSchema = z.object({
  useId: z.string().uuid(),
});

export const availableCouponsOrderParamsSchema = z.object({
  orderType: z.enum(["sale", "custom", "rental", "alteration"]),
  orderId: z.string().uuid(),
});

export const listPromotionsQuerySchema = z.object({
  search: z.string().trim().max(180).optional(),
  scope: z.nativeEnum(PromotionScope).optional(),
  active: booleanFromQuery.optional(),
});

export const createPromotionSchema = z.object({
  nombre: z.string().trim().min(1).max(180),
  scope: z.nativeEnum(PromotionScope),
  discountType: z.nativeEnum(DiscountType),
  value: z.number().min(0),
  startsAt: z.coerce.date(),
  endsAt: z.union([z.coerce.date(), z.null()]).optional(),
  active: z.boolean().optional(),
  productIds: z.array(z.string().uuid()).optional(),
});

export const updatePromotionSchema = z
  .object({
    nombre: z.string().trim().min(1).max(180).optional(),
    scope: z.nativeEnum(PromotionScope).optional(),
    discountType: z.nativeEnum(DiscountType).optional(),
    value: z.number().min(0).optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.union([z.coerce.date(), z.null()]).optional(),
    active: z.boolean().optional(),
    productIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export const listCouponsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  active: booleanFromQuery.optional(),
  promotionId: z.string().uuid().optional(),
  bundleId: z.string().uuid().optional(),
});

export const createCouponSchema = z
  .object({
    code: z.string().trim().min(1).max(120),
    promotionId: z.string().uuid().nullable().optional(),
    bundleId: z.string().uuid().nullable().optional(),
    discountType: z.nativeEnum(DiscountType),
    value: z.number().min(0),
    maxUses: z.coerce.number().int().positive().nullable().optional(),
    startsAt: z.union([z.coerce.date(), z.null()]).optional(),
    endsAt: z.union([z.coerce.date(), z.null()]).optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) => !(data.promotionId && data.bundleId),
    "Coupon cannot reference promotion and bundle at the same time"
  );

export const updateCouponSchema = z
  .object({
    code: z.string().trim().min(1).max(120).optional(),
    promotionId: z.string().uuid().nullable().optional(),
    bundleId: z.string().uuid().nullable().optional(),
    discountType: z.nativeEnum(DiscountType).optional(),
    value: z.number().min(0).optional(),
    maxUses: z.coerce.number().int().positive().nullable().optional(),
    startsAt: z.union([z.coerce.date(), z.null()]).optional(),
    endsAt: z.union([z.coerce.date(), z.null()]).optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  )
  .refine(
    (data) => !(data.promotionId && data.bundleId),
    "Coupon cannot reference promotion and bundle at the same time"
  );

export const applyCouponSchema = z.object({
  orderType: z.enum(["sale", "custom", "rental", "alteration"]),
  orderId: z.string().uuid(),
});

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
