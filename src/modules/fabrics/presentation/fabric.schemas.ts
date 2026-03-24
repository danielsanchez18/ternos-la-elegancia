import { InventoryMovementType } from "@prisma/client";
import { z } from "zod";

export const fabricIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createFabricSchema = z.object({
  code: z.string().trim().min(1).max(60),
  nombre: z.string().trim().min(1).max(150),
  color: z.string().trim().max(80).optional(),
  supplier: z.string().trim().max(120).optional(),
  composition: z.string().trim().max(150).optional(),
  pattern: z.string().trim().max(120).optional(),
  metersInStock: z.number().min(0).optional(),
  minMeters: z.number().min(0).optional(),
  costPerMeter: z.number().min(0).optional(),
  pricePerMeter: z.number().min(0).optional(),
  active: z.boolean().optional(),
});

export const updateFabricSchema = z
  .object({
    nombre: z.string().trim().min(1).max(150).optional(),
    color: z.union([z.string().trim().max(80), z.null()]).optional(),
    supplier: z.union([z.string().trim().max(120), z.null()]).optional(),
    composition: z.union([z.string().trim().max(150), z.null()]).optional(),
    pattern: z.union([z.string().trim().max(120), z.null()]).optional(),
    minMeters: z.number().min(0).optional(),
    costPerMeter: z.union([z.number().min(0), z.null()]).optional(),
    pricePerMeter: z.union([z.number().min(0), z.null()]).optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export const createFabricMovementSchema = z.object({
  type: z.nativeEnum(InventoryMovementType),
  quantity: z.number().positive(),
  note: z.string().trim().max(500).optional(),
});

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
