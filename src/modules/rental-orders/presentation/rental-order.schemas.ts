import { RentalOrderStatus, RentalPriceTier } from "@prisma/client";
import { z } from "zod";

const queryBooleanSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const rentalOrderIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listRentalOrdersQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  status: z.nativeEnum(RentalOrderStatus).optional(),
  code: z.string().trim().min(1).max(50).optional(),
  hasDelay: queryBooleanSchema.optional(),
  hasDamage: queryBooleanSchema.optional(),
  pickupFrom: z.coerce.date().optional(),
  pickupTo: z.coerce.date().optional(),
  dueFrom: z.coerce.date().optional(),
  dueTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  orderBy: z
    .enum(["createdAt", "pickupAt", "dueBackAt", "total"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

const createRentalOrderItemSchema = z.object({
  rentalUnitId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  itemNameSnapshot: z.string().trim().min(1).max(200).optional(),
  tierAtRental: z.nativeEnum(RentalPriceTier).optional(),
  unitPrice: z.number().min(0).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const createRentalOrderSchema = z.object({
  customerId: z.string().uuid(),
  pickupAt: z.coerce.date().optional(),
  dueBackAt: z.coerce.date(),
  notes: z.string().trim().max(2000).optional(),
  items: z.array(createRentalOrderItemSchema).min(1),
});

export const rentalOrderActionSchema = z.object({
  action: z.enum(["MARK_RETURNED", "MARK_LATE", "CLOSE", "CANCEL"]),
  note: z.string().trim().max(1000).optional(),
  hasDamage: z.boolean().optional(),
  returnNotes: z.string().trim().max(1000).optional(),
});

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
