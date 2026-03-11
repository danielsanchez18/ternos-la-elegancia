import { RentalPriceTier, RentalUnitStatus } from "@prisma/client";
import { z } from "zod";

export const rentalUnitIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listRentalUnitsQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  variantId: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(RentalUnitStatus).optional(),
  currentTier: z.nativeEnum(RentalPriceTier).optional(),
  search: z.string().trim().max(120).optional(),
});

export const createRentalUnitSchema = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive().optional(),
  internalCode: z.string().trim().min(1).max(120),
  sizeLabel: z.string().trim().max(60).optional(),
  color: z.string().trim().max(60).optional(),
  currentTier: z.nativeEnum(RentalPriceTier).optional(),
  normalPrice: z.number().min(0),
  premierePrice: z.number().min(0),
  status: z.nativeEnum(RentalUnitStatus).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const updateRentalUnitSchema = z
  .object({
    variantId: z.coerce.number().int().positive().nullable().optional(),
    sizeLabel: z.union([z.string().trim().max(60), z.null()]).optional(),
    color: z.union([z.string().trim().max(60), z.null()]).optional(),
    normalPrice: z.number().min(0).optional(),
    premierePrice: z.number().min(0).optional(),
    status: z.nativeEnum(RentalUnitStatus).optional(),
    notes: z.union([z.string().trim().max(1000), z.null()]).optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export const rentalUnitActionSchema = z.object({
  action: z.enum([
    "MARK_AVAILABLE",
    "MARK_MAINTENANCE",
    "MARK_DAMAGED",
    "MARK_RETIRED",
    "MARK_NORMAL_TIER",
  ]),
  note: z.string().trim().max(1000).optional(),
});

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
