import { Prisma, ProductStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CreateBrandInput,
  CreateProductImageInput,
  CreateProductInput,
  CreateProductVariantInput,
  ListProductsFilters,
  PublicBrand,
  PublicProductImage,
  PublicProduct,
  PublicProductVariant,
  UpdateBrandInput,
  UpdateProductImageInput,
  UpdateProductInput,
  UpdateProductVariantInput,
} from "@/src/modules/products/domain/product.types";

const publicBrandSelect = {
  id: true,
  nombre: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BrandSelect;

const publicProductSelect = {
  id: true,
  nombre: true,
  slug: true,
  descripcion: true,
  kind: true,
  gender: true,
  status: true,
  stockTrackingMode: true,
  requiresMeasurement: true,
  allowsSale: true,
  allowsRental: true,
  allowsCustomization: true,
  isFeatured: true,
  isNew: true,
  active: true,
  brandId: true,
  brand: {
    select: {
      id: true,
      nombre: true,
      activo: true,
    },
  },
  images: {
    select: {
      id: true,
      url: true,
      altText: true,
      sortOrder: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  },
  variants: {
    select: {
      id: true,
      sku: true,
      talla: true,
      tallaSecundaria: true,
      color: true,
      colorCodigo: true,
      stock: true,
      minStock: true,
      salePrice: true,
      compareAtPrice: true,
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

const publicProductImageSelect = {
  id: true,
  url: true,
  altText: true,
  sortOrder: true,
} satisfies Prisma.ProductImageSelect;

const publicProductVariantSelect = {
  id: true,
  sku: true,
  talla: true,
  tallaSecundaria: true,
  color: true,
  colorCodigo: true,
  stock: true,
  minStock: true,
  salePrice: true,
  compareAtPrice: true,
  active: true,
} satisfies Prisma.ProductVariantSelect;

export class ProductRepository {
  async listProducts(filters: ListProductsFilters): Promise<PublicProduct[]> {
    return prisma.product.findMany({
      where: {
        ...(filters.search
          ? {
              OR: [
                { nombre: { contains: filters.search, mode: "insensitive" } },
                { slug: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(filters.kind ? { kind: filters.kind } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.gender ? { gender: filters.gender } : {}),
        ...(filters.active !== undefined ? { active: filters.active } : {}),
        ...(filters.allowsSale !== undefined ? { allowsSale: filters.allowsSale } : {}),
        ...(filters.allowsRental !== undefined ? { allowsRental: filters.allowsRental } : {}),
        ...(filters.allowsCustomization !== undefined
          ? { allowsCustomization: filters.allowsCustomization }
          : {}),
        ...(filters.brandId !== undefined ? { brandId: filters.brandId } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: publicProductSelect,
    });
  }

  async findProductById(id: number): Promise<PublicProduct | null> {
    return prisma.product.findUnique({
      where: { id },
      select: publicProductSelect,
    });
  }

  async findProductBySlug(slug: string): Promise<PublicProduct | null> {
    return prisma.product.findUnique({
      where: { slug },
      select: publicProductSelect,
    });
  }

  async createProduct(input: CreateProductInput): Promise<PublicProduct> {
    return prisma.product.create({
      data: {
        nombre: input.nombre,
        slug: input.slug,
        descripcion: input.descripcion,
        kind: input.kind,
        gender: input.gender,
        status: input.status,
        stockTrackingMode: input.stockTrackingMode,
        requiresMeasurement: input.requiresMeasurement,
        allowsSale: input.allowsSale,
        allowsRental: input.allowsRental,
        allowsCustomization: input.allowsCustomization,
        isFeatured: input.isFeatured,
        isNew: input.isNew,
        active: input.active,
        brandId: input.brandId,
      },
      select: publicProductSelect,
    });
  }

  async updateProductById(id: number, input: UpdateProductInput): Promise<PublicProduct> {
    return prisma.product.update({
      where: { id },
      data: {
        nombre: input.nombre,
        slug: input.slug,
        descripcion: input.descripcion,
        kind: input.kind,
        gender: input.gender,
        status: input.status,
        stockTrackingMode: input.stockTrackingMode,
        requiresMeasurement: input.requiresMeasurement,
        allowsSale: input.allowsSale,
        allowsRental: input.allowsRental,
        allowsCustomization: input.allowsCustomization,
        isFeatured: input.isFeatured,
        isNew: input.isNew,
        active: input.active,
        brandId: input.brandId,
      },
      select: publicProductSelect,
    });
  }

  async deactivateProductById(id: number): Promise<PublicProduct> {
    return this.updateProductById(id, {
      active: false,
      status: ProductStatus.INACTIVO,
    });
  }

  async listBrands(): Promise<PublicBrand[]> {
    return prisma.brand.findMany({
      orderBy: { createdAt: "desc" },
      select: publicBrandSelect,
    });
  }

  async findBrandById(id: number): Promise<PublicBrand | null> {
    return prisma.brand.findUnique({
      where: { id },
      select: publicBrandSelect,
    });
  }

  async createBrand(input: CreateBrandInput): Promise<PublicBrand> {
    return prisma.brand.create({
      data: {
        nombre: input.nombre,
        activo: input.activo,
      },
      select: publicBrandSelect,
    });
  }

  async updateBrandById(id: number, input: UpdateBrandInput): Promise<PublicBrand> {
    return prisma.brand.update({
      where: { id },
      data: {
        nombre: input.nombre,
        activo: input.activo,
      },
      select: publicBrandSelect,
    });
  }

  async deactivateBrandById(id: number): Promise<PublicBrand> {
    return this.updateBrandById(id, { activo: false });
  }

  async listProductImages(productId: number): Promise<PublicProductImage[]> {
    return prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: publicProductImageSelect,
    });
  }

  async createProductImage(
    productId: number,
    input: CreateProductImageInput
  ): Promise<PublicProductImage> {
    return prisma.productImage.create({
      data: {
        productId,
        url: input.url,
        altText: input.altText,
        sortOrder: input.sortOrder,
      },
      select: publicProductImageSelect,
    });
  }

  async updateProductImageById(
    imageId: number,
    input: UpdateProductImageInput
  ): Promise<PublicProductImage> {
    return prisma.productImage.update({
      where: { id: imageId },
      data: {
        url: input.url,
        altText: input.altText,
        sortOrder: input.sortOrder,
      },
      select: publicProductImageSelect,
    });
  }

  async deleteProductImageById(imageId: number): Promise<void> {
    await prisma.productImage.delete({ where: { id: imageId } });
  }

  async listProductVariants(productId: number): Promise<PublicProductVariant[]> {
    return prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      select: publicProductVariantSelect,
    });
  }

  async createProductVariant(
    productId: number,
    input: CreateProductVariantInput
  ): Promise<PublicProductVariant> {
    return prisma.productVariant.create({
      data: {
        productId,
        sku: input.sku,
        talla: input.talla,
        tallaSecundaria: input.tallaSecundaria,
        color: input.color,
        colorCodigo: input.colorCodigo,
        stock: input.stock,
        minStock: input.minStock,
        salePrice: new Prisma.Decimal(input.salePrice),
        compareAtPrice:
          input.compareAtPrice !== undefined && input.compareAtPrice !== null
            ? new Prisma.Decimal(input.compareAtPrice)
            : input.compareAtPrice,
        active: input.active,
      },
      select: publicProductVariantSelect,
    });
  }

  async updateProductVariantById(
    variantId: number,
    input: UpdateProductVariantInput
  ): Promise<PublicProductVariant> {
    return prisma.productVariant.update({
      where: { id: variantId },
      data: {
        talla: input.talla,
        tallaSecundaria: input.tallaSecundaria,
        color: input.color,
        colorCodigo: input.colorCodigo,
        stock: input.stock,
        minStock: input.minStock,
        salePrice:
          input.salePrice !== undefined
            ? new Prisma.Decimal(input.salePrice)
            : undefined,
        compareAtPrice:
          input.compareAtPrice !== undefined && input.compareAtPrice !== null
            ? new Prisma.Decimal(input.compareAtPrice)
            : input.compareAtPrice,
        active: input.active,
      },
      select: publicProductVariantSelect,
    });
  }

  async deactivateProductVariantById(variantId: number): Promise<PublicProductVariant> {
    return this.updateProductVariantById(variantId, { active: false });
  }
}
