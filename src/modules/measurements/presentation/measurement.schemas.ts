import { MeasurementGarmentType } from "@prisma/client";
import { z } from "zod";

export const customerIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const measurementProfileIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createMeasurementProfileSchema = z.object({
  takenAt: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional(),
  garmentTypes: z.array(z.nativeEnum(MeasurementGarmentType)).optional(),
});

export const updateMeasurementProfileSchema = z
  .object({
    notes: z.union([z.string().trim().max(500), z.null()]).optional(),
    validUntil: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export const measurementFieldsQuerySchema = z.object({
  garmentType: z.nativeEnum(MeasurementGarmentType),
});

export const garmentTypeQuerySchema = z.object({
  garmentType: z.nativeEnum(MeasurementGarmentType),
});

const measurementValueInputSchema = z
  .object({
    fieldId: z.coerce.number().int().positive(),
    valueNumber: z.number().optional(),
    valueText: z.union([z.string().trim().max(100), z.null()]).optional(),
  })
  .refine(
    (data) => data.valueNumber !== undefined || data.valueText !== undefined,
    "valueNumber or valueText is required"
  );

export const upsertMeasurementValuesSchema = z
  .object({
    garmentType: z.nativeEnum(MeasurementGarmentType),
    values: z.array(measurementValueInputSchema).min(1),
  })
  .refine(
    (data) => new Set(data.values.map((item) => item.fieldId)).size === data.values.length,
    "Duplicated fieldId in values payload"
  );

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
