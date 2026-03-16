import { AttributeScope, InputFieldType, ProductKind } from "@prisma/client";
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

export const definitionIdParamSchema = z.object({
  definitionId: z.coerce.number().int().positive(),
});

export const optionIdParamSchema = z.object({
  optionId: z.coerce.number().int().positive(),
});

export const componentIdParamSchema = z.object({
  componentId: z.coerce.number().int().positive(),
});

export const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const variantIdParamSchema = z.object({
  variantId: z.coerce.number().int().positive(),
});

export const listAttributeDefinitionsQuerySchema = z.object({
  scope: z.nativeEnum(AttributeScope).optional(),
  appliesToKind: z.nativeEnum(ProductKind).optional(),
  active: booleanFromQuery.optional(),
});

export const createAttributeDefinitionSchema = z.object({
  code: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(180),
  scope: z.nativeEnum(AttributeScope),
  inputType: z.nativeEnum(InputFieldType),
  appliesToKind: z.union([z.nativeEnum(ProductKind), z.null()]).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateAttributeDefinitionSchema = z
  .object({
    label: z.string().trim().min(1).max(180).optional(),
    inputType: z.nativeEnum(InputFieldType).optional(),
    appliesToKind: z.union([z.nativeEnum(ProductKind), z.null()]).optional(),
    active: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export const createAttributeOptionSchema = z.object({
  code: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(180),
  sortOrder: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export const updateAttributeOptionSchema = z
  .object({
    label: z.string().trim().min(1).max(180).optional(),
    sortOrder: z.number().int().min(0).optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

const baseUpsertAttributeValueSchema = z
  .object({
    definitionId: z.coerce.number().int().positive(),
    optionId: z.coerce.number().int().positive().nullable().optional(),
    valueText: z.union([z.string().trim().max(1000), z.null()]).optional(),
    valueNumber: z.union([z.number(), z.null()]).optional(),
    valueBoolean: z.union([z.boolean(), z.null()]).optional(),
  })
  .refine(
    (data) =>
      data.optionId !== undefined ||
      data.valueText !== undefined ||
      data.valueNumber !== undefined ||
      data.valueBoolean !== undefined,
    "At least one value field is required"
  );

export const upsertProductAttributeValueSchema = baseUpsertAttributeValueSchema;
export const upsertVariantAttributeValueSchema = baseUpsertAttributeValueSchema;

export const attributeValueDefinitionIdParamSchema = z.object({
  definitionId: z.coerce.number().int().positive(),
});

export const createProductComponentSchema = z.object({
  childProductId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const updateProductComponentSchema = z
  .object({
    childProductId: z.coerce.number().int().positive().optional(),
    quantity: z.coerce.number().int().positive().optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
