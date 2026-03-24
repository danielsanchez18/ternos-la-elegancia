import { Prisma, ProductStatus } from "@prisma/client";

import {
  BrandConflictError,
  BrandNotFoundError,
  ProductConflictError,
  ProductImageNotFoundError,
  ProductNotFoundError,
  ProductRelatedEntityNotFoundError,
  ProductVariantConflictError,
  ProductVariantNotFoundError,
} from "@/src/modules/products/domain/product.errors";
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
import { ProductRepository } from "@/src/modules/products/infrastructure/product.repository";

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async listProducts(filters: ListProductsFilters): Promise<PublicProduct[]> {
    return this.productRepository.listProducts(filters);
  }

  async getProductById(id: string): Promise<PublicProduct> {
    const product = await this.productRepository.findProductById(id);
    if (!product) {
      throw new ProductNotFoundError();
    }

    return product;
  }

  async getProductBySlug(slug: string): Promise<PublicProduct> {
    const product = await this.productRepository.findProductBySlug(slug);
    if (!product) {
      throw new ProductNotFoundError();
    }

    return product;
  }

  async createProduct(input: CreateProductInput): Promise<PublicProduct> {
    try {
      return await this.productRepository.createProduct(input);
    } catch (error: unknown) {
      this.handleProductPersistenceError(error);
    }
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<PublicProduct> {
    try {
      return await this.productRepository.updateProductById(id, input);
    } catch (error: unknown) {
      this.handleProductPersistenceError(error);
    }
  }

  async deactivateProduct(id: string): Promise<PublicProduct> {
    return this.updateProduct(id, { active: false, status: ProductStatus.INACTIVO });
  }

  async listBrands(): Promise<PublicBrand[]> {
    return this.productRepository.listBrands();
  }

  async getBrandById(id: string): Promise<PublicBrand> {
    const brand = await this.productRepository.findBrandById(id);
    if (!brand) {
      throw new BrandNotFoundError();
    }

    return brand;
  }

  async createBrand(input: CreateBrandInput): Promise<PublicBrand> {
    try {
      return await this.productRepository.createBrand(input);
    } catch (error: unknown) {
      this.handleBrandPersistenceError(error);
    }
  }

  async updateBrand(id: string, input: UpdateBrandInput): Promise<PublicBrand> {
    try {
      return await this.productRepository.updateBrandById(id, input);
    } catch (error: unknown) {
      this.handleBrandPersistenceError(error);
    }
  }

  async deactivateBrand(id: string): Promise<PublicBrand> {
    return this.updateBrand(id, { activo: false });
  }

  async listProductImages(productId: string): Promise<PublicProductImage[]> {
    await this.getProductById(productId);
    return this.productRepository.listProductImages(productId);
  }

  async createProductImage(
    productId: string,
    input: CreateProductImageInput
  ): Promise<PublicProductImage> {
    await this.getProductById(productId);
    return this.productRepository.createProductImage(productId, input);
  }

  async updateProductImage(
    imageId: string,
    input: UpdateProductImageInput
  ): Promise<PublicProductImage> {
    try {
      return await this.productRepository.updateProductImageById(imageId, input);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new ProductImageNotFoundError();
      }

      throw error;
    }
  }

  async deleteProductImage(imageId: string): Promise<void> {
    try {
      await this.productRepository.deleteProductImageById(imageId);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new ProductImageNotFoundError();
      }

      throw error;
    }
  }

  async listProductVariants(productId: string): Promise<PublicProductVariant[]> {
    await this.getProductById(productId);
    return this.productRepository.listProductVariants(productId);
  }

  async createProductVariant(
    productId: string,
    input: CreateProductVariantInput
  ): Promise<PublicProductVariant> {
    await this.getProductById(productId);

    try {
      return await this.productRepository.createProductVariant(productId, input);
    } catch (error: unknown) {
      this.handleProductVariantPersistenceError(error);
    }
  }

  async updateProductVariant(
    variantId: string,
    input: UpdateProductVariantInput
  ): Promise<PublicProductVariant> {
    try {
      return await this.productRepository.updateProductVariantById(variantId, input);
    } catch (error: unknown) {
      this.handleProductVariantPersistenceError(error);
    }
  }

  async deactivateProductVariant(variantId: string): Promise<PublicProductVariant> {
    try {
      return await this.productRepository.deactivateProductVariantById(variantId);
    } catch (error: unknown) {
      this.handleProductVariantPersistenceError(error);
    }
  }

  private handleProductPersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new ProductNotFoundError();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      throw new ProductConflictError(fields);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new ProductRelatedEntityNotFoundError("brand");
    }

    throw error;
  }

  private handleBrandPersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new BrandNotFoundError();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      throw new BrandConflictError(fields);
    }

    throw error;
  }

  private handleProductVariantPersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new ProductVariantNotFoundError();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      throw new ProductVariantConflictError(fields);
    }

    throw error;
  }
}

export const productService = new ProductService(new ProductRepository());
