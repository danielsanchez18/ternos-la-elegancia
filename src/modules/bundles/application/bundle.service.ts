import { Prisma } from "@prisma/client";

import {
  BundleConflictError,
  BundleItemNotFoundError,
  BundleNotFoundError,
  BundleRelatedEntityNotFoundError,
  BundleValidationError,
  BundleVariantItemNotFoundError,
} from "@/src/modules/bundles/domain/bundle.errors";
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
import { BundleRepository } from "@/src/modules/bundles/infrastructure/bundle.repository";

export class BundleService {
  constructor(private readonly bundleRepository: BundleRepository) {}

  async listBundles(filters: ListBundlesFilters): Promise<PublicBundle[]> {
    return this.bundleRepository.listBundles(filters);
  }

  async getBundleById(id: number): Promise<PublicBundle> {
    const bundle = await this.bundleRepository.findBundleById(id);
    if (!bundle) {
      throw new BundleNotFoundError();
    }

    return bundle;
  }

  async createBundle(input: CreateBundleInput): Promise<PublicBundle> {
    try {
      return await this.bundleRepository.createBundle(input);
    } catch (error: unknown) {
      this.handleBundlePersistenceError(error);
    }
  }

  async updateBundle(id: number, input: UpdateBundleInput): Promise<PublicBundle> {
    try {
      return await this.bundleRepository.updateBundleById(id, input);
    } catch (error: unknown) {
      this.handleBundlePersistenceError(error);
    }
  }

  async deactivateBundle(id: number): Promise<PublicBundle> {
    return this.updateBundle(id, { active: false });
  }

  async listBundleItems(bundleId: number): Promise<PublicBundleItem[]> {
    await this.getBundleById(bundleId);
    return this.bundleRepository.listBundleItems(bundleId);
  }

  async createBundleItem(bundleId: number, input: CreateBundleItemInput): Promise<PublicBundleItem> {
    await this.getBundleById(bundleId);
    await this.assertProductExists(input.productId);

    try {
      return await this.bundleRepository.createBundleItem(bundleId, input);
    } catch (error: unknown) {
      this.handleBundlePersistenceError(error);
    }
  }

  async updateBundleItem(itemId: number, input: UpdateBundleItemInput): Promise<PublicBundleItem> {
    const existing = await this.bundleRepository.getBundleItemById(itemId);
    if (!existing) {
      throw new BundleItemNotFoundError();
    }

    if (input.productId !== undefined) {
      await this.assertProductExists(input.productId);
    }

    try {
      return await this.bundleRepository.updateBundleItemById(itemId, input);
    } catch (error: unknown) {
      this.handleBundlePersistenceError(error);
    }
  }

  async deleteBundleItem(itemId: number): Promise<void> {
    try {
      await this.bundleRepository.deleteBundleItemById(itemId);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new BundleItemNotFoundError();
      }

      throw error;
    }
  }

  async listBundleVariantItems(bundleId: number): Promise<PublicBundleVariantItem[]> {
    await this.getBundleById(bundleId);
    return this.bundleRepository.listBundleVariantItems(bundleId);
  }

  async createBundleVariantItem(
    bundleId: number,
    input: CreateBundleVariantItemInput
  ): Promise<PublicBundleVariantItem> {
    await this.getBundleById(bundleId);
    await this.assertVariantExists(input.variantId);

    try {
      return await this.bundleRepository.createBundleVariantItem(bundleId, input);
    } catch (error: unknown) {
      this.handleBundlePersistenceError(error);
    }
  }

  async updateBundleVariantItem(
    itemId: number,
    input: UpdateBundleVariantItemInput
  ): Promise<PublicBundleVariantItem> {
    const existing = await this.bundleRepository.getBundleVariantItemById(itemId);
    if (!existing) {
      throw new BundleVariantItemNotFoundError();
    }

    if (input.variantId !== undefined) {
      await this.assertVariantExists(input.variantId);
    }

    try {
      return await this.bundleRepository.updateBundleVariantItemById(itemId, input);
    } catch (error: unknown) {
      this.handleBundlePersistenceError(error);
    }
  }

  async deleteBundleVariantItem(itemId: number): Promise<void> {
    try {
      await this.bundleRepository.deleteBundleVariantItemById(itemId);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new BundleVariantItemNotFoundError();
      }

      throw error;
    }
  }

  private async assertProductExists(productId: number): Promise<void> {
    const exists = await this.bundleRepository.productExists(productId);
    if (!exists) {
      throw new BundleRelatedEntityNotFoundError("product");
    }
  }

  private async assertVariantExists(variantId: number): Promise<void> {
    const exists = await this.bundleRepository.variantExists(variantId);
    if (!exists) {
      throw new BundleRelatedEntityNotFoundError("variant");
    }
  }

  private handleBundlePersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new BundleNotFoundError();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      throw new BundleConflictError(fields);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new BundleValidationError("Invalid relation for bundle operation");
    }

    throw error;
  }
}

export const bundleService = new BundleService(new BundleRepository());
