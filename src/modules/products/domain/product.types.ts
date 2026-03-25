import {
  Gender,
  Prisma,
  ProductKind,
  ProductStatus,
  StockTrackingMode,
} from "@prisma/client";

export type PublicBrand = {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBrandInput = {
  nombre: string;
  activo?: boolean;
};

export type UpdateBrandInput = {
  nombre?: string;
  activo?: boolean;
};

export type ProductBrandSummary = {
  id: string;
  nombre: string;
  activo: boolean;
} | null;

export type PublicProductImage = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
};

export type PublicProductVariantImage = {
  id: string;
  variantId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicProductVariant = {
  id: string;
  sku: string;
  talla: string | null;
  tallaSecundaria: string | null;
  color: string | null;
  colorCodigo: string | null;
  stock: number;
  minStock: number;
  salePrice: Prisma.Decimal;
  compareAtPrice: Prisma.Decimal | null;
  active: boolean;
  images: PublicProductVariantImage[];
};

export type PublicProduct = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  kind: ProductKind;
  gender: Gender | null;
  status: ProductStatus;
  stockTrackingMode: StockTrackingMode;
  requiresMeasurement: boolean;
  allowsSale: boolean;
  allowsRental: boolean;
  allowsCustomization: boolean;
  isFeatured: boolean;
  isNew: boolean;
  active: boolean;
  brandId: string | null;
  brand: ProductBrandSummary;
  images: PublicProductImage[];
  variants: PublicProductVariant[];
  createdAt: Date;
  updatedAt: Date;
};

export type ListProductsFilters = {
  search?: string;
  kind?: ProductKind;
  status?: ProductStatus;
  gender?: Gender;
  active?: boolean;
  allowsSale?: boolean;
  allowsRental?: boolean;
  allowsCustomization?: boolean;
  brandId?: string;
};

export type CreateProductInput = {
  nombre: string;
  slug: string;
  descripcion?: string;
  kind: ProductKind;
  gender?: Gender;
  status?: ProductStatus;
  stockTrackingMode?: StockTrackingMode;
  requiresMeasurement?: boolean;
  allowsSale?: boolean;
  allowsRental?: boolean;
  allowsCustomization?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  active?: boolean;
  brandId?: string | null;
};

export type UpdateProductInput = {
  nombre?: string;
  slug?: string;
  descripcion?: string | null;
  kind?: ProductKind;
  gender?: Gender | null;
  status?: ProductStatus;
  stockTrackingMode?: StockTrackingMode;
  requiresMeasurement?: boolean;
  allowsSale?: boolean;
  allowsRental?: boolean;
  allowsCustomization?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  active?: boolean;
  brandId?: string | null;
};

export type CreateProductImageInput = {
  url: string;
  altText?: string;
  sortOrder?: number;
};

export type UpdateProductImageInput = {
  url?: string;
  altText?: string | null;
  sortOrder?: number;
};

export type CreateProductVariantImageInput = {
  url: string;
  altText?: string;
  sortOrder?: number;
};

export type UpdateProductVariantImageInput = {
  url?: string;
  altText?: string | null;
  sortOrder?: number;
};

export type CreateProductVariantInput = {
  sku: string;
  talla?: string;
  tallaSecundaria?: string;
  color?: string;
  colorCodigo?: string;
  stock?: number;
  minStock?: number;
  salePrice: number;
  compareAtPrice?: number | null;
  active?: boolean;
};

export type UpdateProductVariantInput = {
  talla?: string | null;
  tallaSecundaria?: string | null;
  color?: string | null;
  colorCodigo?: string | null;
  stock?: number;
  minStock?: number;
  salePrice?: number;
  compareAtPrice?: number | null;
  active?: boolean;
};
