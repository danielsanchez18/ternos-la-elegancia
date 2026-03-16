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

export const bundleIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const bundleItemIdParamSchema = z.object({
  itemId: z.coerce.number().int().positive(),
});

export const listBundlesQuerySchema = z.object({
  search: z.string().trim().max(180).optional(),
  active: booleanFromQuery.optional(),
});

export const createBundleSchema = z.object({
  nombre: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180),
  descripcion: z.string().trim().max(2000).optional(),
  price: z.number().min(0),
  active: z.boolean().optional(),
});

export const updateBundleSchema = z
  .object({
    nombre: z.string().trim().min(1).max(180).optional(),
    slug: z.string().trim().min(1).max(180).optional(),
    descripcion: z.union([z.string().trim().max(2000), z.null()]).optional(),
    price: z.number().min(0).optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export const createBundleItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const updateBundleItemSchema = z
  .object({
    productId: z.coerce.number().int().positive().optional(),
    quantity: z.coerce.number().int().positive().optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export const createBundleVariantItemSchema = z.object({
  variantId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const updateBundleVariantItemSchema = z
  .object({
    variantId: z.coerce.number().int().positive().optional(),
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
