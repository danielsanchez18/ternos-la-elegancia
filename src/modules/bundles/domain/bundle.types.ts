import { Prisma } from "@prisma/client";

export type PublicBundleItem = {
  id: number;
  bundleId: number;
  productId: number;
  quantity: number;
  sortOrder: number;
  product: {
    id: number;
    nombre: string;
    slug: string;
    active: boolean;
  };
};

export type PublicBundleVariantItem = {
  id: number;
  bundleId: number;
  variantId: number;
  quantity: number;
  sortOrder: number;
  variant: {
    id: number;
    sku: string;
    active: boolean;
    product: {
      id: number;
      nombre: string;
      slug: string;
      active: boolean;
    };
  };
};

export type PublicBundle = {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  price: Prisma.Decimal;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  items: PublicBundleItem[];
  variantItems: PublicBundleVariantItem[];
};

export type ListBundlesFilters = {
  search?: string;
  active?: boolean;
};

export type CreateBundleInput = {
  nombre: string;
  slug: string;
  descripcion?: string;
  price: number;
  active?: boolean;
};

export type UpdateBundleInput = {
  nombre?: string;
  slug?: string;
  descripcion?: string | null;
  price?: number;
  active?: boolean;
};

export type CreateBundleItemInput = {
  productId: number;
  quantity?: number;
  sortOrder?: number;
};

export type UpdateBundleItemInput = {
  productId?: number;
  quantity?: number;
  sortOrder?: number;
};

export type CreateBundleVariantItemInput = {
  variantId: number;
  quantity?: number;
  sortOrder?: number;
};

export type UpdateBundleVariantItemInput = {
  variantId?: number;
  quantity?: number;
  sortOrder?: number;
};
