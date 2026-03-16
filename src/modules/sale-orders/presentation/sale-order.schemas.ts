import { SaleOrderStatus } from "@prisma/client";
import { z } from "zod";

export const saleOrderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listSaleOrdersQuerySchema = z.object({
  customerId: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(SaleOrderStatus).optional(),
  code: z.string().trim().min(1).max(50).optional(),
  requestedFrom: z.coerce.date().optional(),
  requestedTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  orderBy: z.enum(["createdAt", "requestedAt", "total"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

const createSaleOrderItemComponentSchema = z
  .object({
    productId: z.number().int().positive().optional(),
    variantId: z.number().int().positive().optional(),
    quantity: z.number().int().positive().default(1),
  })
  .refine(
    (item) => item.productId !== undefined || item.variantId !== undefined,
    "Component requires productId or variantId"
  );

const createSaleOrderItemSchema = z
  .object({
    productId: z.number().int().positive().optional(),
    bundleId: z.number().int().positive().optional(),
    itemNameSnapshot: z.string().trim().min(1).max(200).optional(),
    quantity: z.number().int().positive().default(1),
    unitPrice: z.number().min(0),
    discountAmount: z.number().min(0).optional(),
    notes: z.string().trim().max(1000).optional(),
    components: z.array(createSaleOrderItemComponentSchema).optional(),
  })
  .refine(
    (item) =>
      (item.productId !== undefined && item.bundleId === undefined) ||
      (item.productId === undefined && item.bundleId !== undefined),
    "Each item must reference either productId or bundleId"
  );

export const createSaleOrderSchema = z.object({
  customerId: z.number().int().positive(),
  notes: z.string().trim().max(2000).optional(),
  requestedAt: z.coerce.date().optional(),
  items: z.array(createSaleOrderItemSchema).min(1),
});

export const saleOrderActionSchema = z.object({
  action: z.enum([
    "MARK_PAID",
    "START_PREPARATION",
    "MARK_READY_FOR_PICKUP",
    "MARK_DELIVERED",
    "CANCEL",
  ]),
  note: z.string().trim().max(1000).optional(),
});

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
