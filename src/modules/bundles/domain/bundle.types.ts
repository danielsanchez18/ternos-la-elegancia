import { Prisma } from "@prisma/client";

export type PublicBundleItem = {
  id: string;
  bundleId: string;
  productId: string;
  quantity: number;
  sortOrder: number;
  product: {
    id: string;
    nombre: string;
    slug: string;
    active: boolean;
  };
};

export type PublicBundleVariantItem = {
  id: string;
  bundleId: string;
  variantId: string;
  quantity: number;
  sortOrder: number;
  variant: {
    id: string;
    sku: string;
    active: boolean;
    product: {
      id: string;
      nombre: string;
      slug: string;
      active: boolean;
    };
  };
};

export type PublicBundle = {
  id: string;
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
  productId: string;
  quantity?: number;
  sortOrder?: number;
};

export type UpdateBundleItemInput = {
  productId?: string;
  quantity?: number;
  sortOrder?: number;
};

export type CreateBundleVariantItemInput = {
  variantId: string;
  quantity?: number;
  sortOrder?: number;
};

export type UpdateBundleVariantItemInput = {
  variantId?: string;
  quantity?: number;
  sortOrder?: number;
};
