import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CreateBundleInput,
  CreateBundleItemInput,
  CreateBundleVariantItemInput,
  ListBundlesFilters,
  PublicBundle,
  PublicBundleItem,
  PublicBundleVariantItem,
  UpdateBundleInput,
  UpdateBundleItemInput,
  UpdateBundleVariantItemInput,
} from "@/src/modules/bundles/domain/bundle.types";

const publicBundleItemSelect = {
  id: true,
  bundleId: true,
  productId: true,
  quantity: true,
  sortOrder: true,
  product: {
    select: {
      id: true,
      nombre: true,
      slug: true,
      active: true,
    },
  },
} satisfies Prisma.BundleItemSelect;

const publicBundleVariantItemSelect = {
  id: true,
  bundleId: true,
  variantId: true,
  quantity: true,
  sortOrder: true,
  variant: {
    select: {
      id: true,
      sku: true,
      active: true,
      product: {
        select: {
          id: true,
          nombre: true,
          slug: true,
          active: true,
        },
      },
    },
  },
} satisfies Prisma.BundleVariantItemSelect;

const publicBundleSelect = {
  id: true,
  nombre: true,
  slug: true,
  descripcion: true,
  price: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: publicBundleItemSelect,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  },
  variantItems: {
    select: publicBundleVariantItemSelect,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.BundleSelect;

export class BundleRepository {
  async listBundles(filters: ListBundlesFilters): Promise<PublicBundle[]> {
    return prisma.bundle.findMany({
      where: {
        ...(filters.search
          ? {
              OR: [
                { nombre: { contains: filters.search, mode: "insensitive" } },
                { slug: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(filters.active !== undefined ? { active: filters.active } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: publicBundleSelect,
    });
  }

  async findBundleById(id: string): Promise<PublicBundle | null> {
    return prisma.bundle.findUnique({ where: { id }, select: publicBundleSelect });
  }

  async createBundle(input: CreateBundleInput): Promise<PublicBundle> {
    return prisma.bundle.create({
      data: {
        nombre: input.nombre,
        slug: input.slug,
        descripcion: input.descripcion,
        price: new Prisma.Decimal(input.price),
        active: input.active,
      },
      select: publicBundleSelect,
    });
  }

  async updateBundleById(id: string, input: UpdateBundleInput): Promise<PublicBundle> {
    return prisma.bundle.update({
      where: { id },
      data: {
        nombre: input.nombre,
        slug: input.slug,
        descripcion: input.descripcion,
        price: input.price !== undefined ? new Prisma.Decimal(input.price) : undefined,
        active: input.active,
      },
      select: publicBundleSelect,
    });
  }

  async listBundleItems(bundleId: string): Promise<PublicBundleItem[]> {
    return prisma.bundleItem.findMany({
      where: { bundleId },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: publicBundleItemSelect,
    });
  }

  async createBundleItem(bundleId: string, input: CreateBundleItemInput): Promise<PublicBundleItem> {
    return prisma.bundleItem.create({
      data: {
        bundleId,
        productId: input.productId,
        quantity: input.quantity,
        sortOrder: input.sortOrder,
      },
      select: publicBundleItemSelect,
    });
  }

  async updateBundleItemById(itemId: string, input: UpdateBundleItemInput): Promise<PublicBundleItem> {
    return prisma.bundleItem.update({
      where: { id: itemId },
      data: {
        productId: input.productId,
        quantity: input.quantity,
        sortOrder: input.sortOrder,
      },
      select: publicBundleItemSelect,
    });
  }

  async deleteBundleItemById(itemId: string): Promise<void> {
    await prisma.bundleItem.delete({ where: { id: itemId } });
  }

  async getBundleItemById(itemId: string) {
    return prisma.bundleItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        bundleId: true,
      },
    });
  }

  async listBundleVariantItems(bundleId: string): Promise<PublicBundleVariantItem[]> {
    return prisma.bundleVariantItem.findMany({
      where: { bundleId },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: publicBundleVariantItemSelect,
    });
  }

  async createBundleVariantItem(
    bundleId: string,
    input: CreateBundleVariantItemInput
  ): Promise<PublicBundleVariantItem> {
    return prisma.bundleVariantItem.create({
      data: {
        bundleId,
        variantId: input.variantId,
        quantity: input.quantity,
        sortOrder: input.sortOrder,
      },
      select: publicBundleVariantItemSelect,
    });
  }

  async updateBundleVariantItemById(
    itemId: string,
    input: UpdateBundleVariantItemInput
  ): Promise<PublicBundleVariantItem> {
    return prisma.bundleVariantItem.update({
      where: { id: itemId },
      data: {
        variantId: input.variantId,
        quantity: input.quantity,
        sortOrder: input.sortOrder,
      },
      select: publicBundleVariantItemSelect,
    });
  }

  async deleteBundleVariantItemById(itemId: string): Promise<void> {
    await prisma.bundleVariantItem.delete({ where: { id: itemId } });
  }

  async getBundleVariantItemById(itemId: string) {
    return prisma.bundleVariantItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        bundleId: true,
      },
    });
  }

  async productExists(productId: string): Promise<boolean> {
    const row = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    return Boolean(row);
  }

  async variantExists(variantId: string): Promise<boolean> {
    const row = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true },
    });
    return Boolean(row);
  }
}
