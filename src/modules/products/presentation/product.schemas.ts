import { Gender, ProductKind, ProductStatus, StockTrackingMode } from "@prisma/client";
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

export const productIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const productSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(180),
});

export const brandIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const productVariantIdParamSchema = z.object({
  variantId: z.string().uuid(),
});

export const productImageIdParamSchema = z.object({
  imageId: z.string().uuid(),
});

export const listProductsQuerySchema = z.object({
  search: z.string().trim().max(180).optional(),
  kind: z.nativeEnum(ProductKind).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  gender: z.nativeEnum(Gender).optional(),
  active: booleanFromQuery.optional(),
  allowsSale: booleanFromQuery.optional(),
  allowsRental: booleanFromQuery.optional(),
  allowsCustomization: booleanFromQuery.optional(),
  brandId: z.string().uuid().optional(),
});

export const createProductSchema = z.object({
  nombre: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(180),
  descripcion: z.string().trim().max(4000).optional(),
  kind: z.nativeEnum(ProductKind),
  gender: z.nativeEnum(Gender).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  stockTrackingMode: z.nativeEnum(StockTrackingMode).optional(),
  requiresMeasurement: z.boolean().optional(),
  allowsSale: z.boolean().optional(),
  allowsRental: z.boolean().optional(),
  allowsCustomization: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  active: z.boolean().optional(),
  brandId: z.string().uuid().nullable().optional(),
});

export const updateProductSchema = z
  .object({
    nombre: z.string().trim().min(1).max(180).optional(),
    slug: z.string().trim().min(1).max(180).optional(),
    descripcion: z.union([z.string().trim().max(4000), z.null()]).optional(),
    kind: z.nativeEnum(ProductKind).optional(),
    gender: z.union([z.nativeEnum(Gender), z.null()]).optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    stockTrackingMode: z.nativeEnum(StockTrackingMode).optional(),
    requiresMeasurement: z.boolean().optional(),
    allowsSale: z.boolean().optional(),
    allowsRental: z.boolean().optional(),
    allowsCustomization: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isNew: z.boolean().optional(),
    active: z.boolean().optional(),
    brandId: z.string().uuid().nullable().optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export const createBrandSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  activo: z.boolean().optional(),
});

export const updateBrandSchema = z
  .object({
    nombre: z.string().trim().min(1).max(120).optional(),
    activo: z.boolean().optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export const createProductImageSchema = z.object({
  url: z.string().url().max(500),
  altText: z.string().trim().max(200).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateProductImageSchema = z
  .object({
    url: z.string().url().max(500).optional(),
    altText: z.union([z.string().trim().max(200), z.null()]).optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one field is required"
  );

export const createProductVariantSchema = z.object({
  sku: z.string().trim().min(1).max(120),
  talla: z.string().trim().max(40).optional(),
  tallaSecundaria: z.string().trim().max(40).optional(),
  color: z.string().trim().max(60).optional(),
  colorCodigo: z.string().trim().max(20).optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  salePrice: z.number().min(0),
  compareAtPrice: z.union([z.number().min(0), z.null()]).optional(),
  active: z.boolean().optional(),
});

export const updateProductVariantSchema = z
  .object({
    talla: z.union([z.string().trim().max(40), z.null()]).optional(),
    tallaSecundaria: z.union([z.string().trim().max(40), z.null()]).optional(),
    color: z.union([z.string().trim().max(60), z.null()]).optional(),
    colorCodigo: z.union([z.string().trim().max(20), z.null()]).optional(),
    stock: z.number().int().min(0).optional(),
    minStock: z.number().int().min(0).optional(),
    salePrice: z.number().min(0).optional(),
    compareAtPrice: z.union([z.number().min(0), z.null()]).optional(),
    active: z.boolean().optional(),
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
