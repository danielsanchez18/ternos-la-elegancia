import { AttributeScope, Prisma } from "@prisma/client";

import {
  CatalogAttributeDefinitionConflictError,
  CatalogAttributeDefinitionNotFoundError,
  CatalogAttributeOptionConflictError,
  CatalogAttributeOptionNotFoundError,
  CatalogProductAttributeValueNotFoundError,
  CatalogProductComponentNotFoundError,
  CatalogRelatedEntityNotFoundError,
  CatalogValidationError,
  CatalogVariantAttributeValueNotFoundError,
} from "@/src/modules/catalog/domain/catalog.errors";
import {
  CreateAttributeDefinitionInput,
  CreateAttributeOptionInput,
  CreateProductComponentInput,
  ListAttributeDefinitionsFilters,
  PublicCatalogAttributeDefinition,
  PublicCatalogAttributeOption,
  PublicProductAttributeValue,
  PublicProductComponent,
  PublicVariantAttributeValue,
  UpdateAttributeDefinitionInput,
  UpdateAttributeOptionInput,
  UpdateProductComponentInput,
  UpsertProductAttributeValueInput,
  UpsertVariantAttributeValueInput,
} from "@/src/modules/catalog/domain/catalog.types";
import { CatalogRepository } from "@/src/modules/catalog/infrastructure/catalog.repository";

export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async listAttributeDefinitions(
    filters: ListAttributeDefinitionsFilters
  ): Promise<PublicCatalogAttributeDefinition[]> {
    return this.catalogRepository.listAttributeDefinitions(filters);
  }

  async getAttributeDefinitionById(id: string): Promise<PublicCatalogAttributeDefinition> {
    const definition = await this.catalogRepository.findAttributeDefinitionById(id);
    if (!definition) {
      throw new CatalogAttributeDefinitionNotFoundError();
    }

    return definition;
  }

  async createAttributeDefinition(
    input: CreateAttributeDefinitionInput
  ): Promise<PublicCatalogAttributeDefinition> {
    try {
      return await this.catalogRepository.createAttributeDefinition(input);
    } catch (error: unknown) {
      this.handleDefinitionPersistenceError(error);
    }
  }

  async updateAttributeDefinition(
    id: string,
    input: UpdateAttributeDefinitionInput
  ): Promise<PublicCatalogAttributeDefinition> {
    try {
      return await this.catalogRepository.updateAttributeDefinitionById(id, input);
    } catch (error: unknown) {
      this.handleDefinitionPersistenceError(error);
    }
  }

  async deactivateAttributeDefinition(id: string): Promise<PublicCatalogAttributeDefinition> {
    return this.updateAttributeDefinition(id, { active: false });
  }

  async listAttributeOptions(definitionId: string): Promise<PublicCatalogAttributeOption[]> {
    await this.getAttributeDefinitionById(definitionId);
    return this.catalogRepository.listAttributeOptionsByDefinitionId(definitionId);
  }

  async createAttributeOption(
    definitionId: string,
    input: CreateAttributeOptionInput
  ): Promise<PublicCatalogAttributeOption> {
    await this.getAttributeDefinitionById(definitionId);

    try {
      return await this.catalogRepository.createAttributeOption(definitionId, input);
    } catch (error: unknown) {
      this.handleOptionPersistenceError(error);
    }
  }

  async updateAttributeOption(
    optionId: string,
    input: UpdateAttributeOptionInput
  ): Promise<PublicCatalogAttributeOption> {
    try {
      return await this.catalogRepository.updateAttributeOptionById(optionId, input);
    } catch (error: unknown) {
      this.handleOptionPersistenceError(error);
    }
  }

  async deactivateAttributeOption(optionId: string): Promise<PublicCatalogAttributeOption> {
    return this.updateAttributeOption(optionId, { active: false });
  }

  async listProductAttributeValues(productId: string): Promise<PublicProductAttributeValue[]> {
    await this.assertProductExists(productId);
    return this.catalogRepository.listProductAttributeValues(productId);
  }

  async upsertProductAttributeValue(
    productId: string,
    input: UpsertProductAttributeValueInput
  ): Promise<PublicProductAttributeValue> {
    await this.assertProductExists(productId);
    await this.assertValueInputValid(input);
    await this.assertDefinitionScope(input.definitionId, AttributeScope.PRODUCT);
    await this.assertOptionBelongsToDefinition(input.optionId, input.definitionId);

    try {
      return await this.catalogRepository.upsertProductAttributeValue(productId, input);
    } catch (error: unknown) {
      this.handleProductAttributeValuePersistenceError(error);
    }
  }

  async deleteProductAttributeValue(productId: string, definitionId: string): Promise<void> {
    await this.assertProductExists(productId);

    try {
      await this.catalogRepository.deleteProductAttributeValue(productId, definitionId);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new CatalogProductAttributeValueNotFoundError();
      }

      throw error;
    }
  }

  async listVariantAttributeValues(variantId: string): Promise<PublicVariantAttributeValue[]> {
    await this.assertVariantExists(variantId);
    return this.catalogRepository.listVariantAttributeValues(variantId);
  }

  async upsertVariantAttributeValue(
    variantId: string,
    input: UpsertVariantAttributeValueInput
  ): Promise<PublicVariantAttributeValue> {
    await this.assertVariantExists(variantId);
    await this.assertValueInputValid(input);
    await this.assertDefinitionScope(input.definitionId, AttributeScope.VARIANT);
    await this.assertOptionBelongsToDefinition(input.optionId, input.definitionId);

    try {
      return await this.catalogRepository.upsertVariantAttributeValue(variantId, input);
    } catch (error: unknown) {
      this.handleVariantAttributeValuePersistenceError(error);
    }
  }

  async deleteVariantAttributeValue(variantId: string, definitionId: string): Promise<void> {
    await this.assertVariantExists(variantId);

    try {
      await this.catalogRepository.deleteVariantAttributeValue(variantId, definitionId);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new CatalogVariantAttributeValueNotFoundError();
      }

      throw error;
    }
  }

  async listProductComponents(parentProductId: string): Promise<PublicProductComponent[]> {
    await this.assertProductExists(parentProductId);
    return this.catalogRepository.listProductComponents(parentProductId);
  }

  async createProductComponent(
    parentProductId: string,
    input: CreateProductComponentInput
  ): Promise<PublicProductComponent> {
    await this.assertProductExists(parentProductId);
    await this.assertProductExists(input.childProductId);

    if (parentProductId === input.childProductId) {
      throw new CatalogValidationError("A product cannot include itself as component");
    }

    try {
      return await this.catalogRepository.createProductComponent(parentProductId, input);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new CatalogValidationError("Component already exists for this parent product");
      }

      throw error;
    }
  }

  async updateProductComponent(
    componentId: string,
    input: UpdateProductComponentInput
  ): Promise<PublicProductComponent> {
    const existing = await this.catalogRepository.getProductComponentById(componentId);
    if (!existing) {
      throw new CatalogProductComponentNotFoundError();
    }

    if (input.childProductId !== undefined) {
      await this.assertProductExists(input.childProductId);
      if (existing.parentProductId === input.childProductId) {
        throw new CatalogValidationError("A product cannot include itself as component");
      }
    }

    try {
      return await this.catalogRepository.updateProductComponentById(componentId, input);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new CatalogValidationError("Component already exists for this parent product");
      }

      throw error;
    }
  }

  async deleteProductComponent(componentId: string): Promise<void> {
    try {
      await this.catalogRepository.deleteProductComponentById(componentId);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new CatalogProductComponentNotFoundError();
      }

      throw error;
    }
  }

  private async assertProductExists(productId: string): Promise<void> {
    const exists = await this.catalogRepository.productExists(productId);
    if (!exists) {
      throw new CatalogRelatedEntityNotFoundError("product");
    }
  }

  private async assertVariantExists(variantId: string): Promise<void> {
    const exists = await this.catalogRepository.variantExists(variantId);
    if (!exists) {
      throw new CatalogRelatedEntityNotFoundError("variant");
    }
  }

  private async assertDefinitionScope(
    definitionId: string,
    expectedScope: AttributeScope
  ): Promise<void> {
    const scopeMatches = await this.catalogRepository.ensureDefinitionScope(
      definitionId,
      expectedScope
    );

    if (!scopeMatches) {
      throw new CatalogValidationError(
        `Definition must have scope ${expectedScope}`
      );
    }
  }

  private async assertOptionBelongsToDefinition(
    optionId: string | null | undefined,
    definitionId: string
  ): Promise<void> {
    if (optionId === undefined || optionId === null) {
      return;
    }

    const option = await this.catalogRepository.getAttributeOptionById(optionId);
    if (!option) {
      throw new CatalogRelatedEntityNotFoundError("option");
    }

    if (option.definitionId !== definitionId) {
      throw new CatalogValidationError(
        "Option does not belong to the provided definition"
      );
    }
  }

  private async assertValueInputValid(
    input: UpsertProductAttributeValueInput | UpsertVariantAttributeValueInput
  ): Promise<void> {
    const hasAnyValue =
      input.optionId !== undefined ||
      input.valueText !== undefined ||
      input.valueNumber !== undefined ||
      input.valueBoolean !== undefined;

    if (!hasAnyValue) {
      throw new CatalogValidationError("At least one value field is required");
    }
  }

  private handleDefinitionPersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new CatalogAttributeDefinitionNotFoundError();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      throw new CatalogAttributeDefinitionConflictError(fields);
    }

    throw error;
  }

  private handleOptionPersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new CatalogAttributeOptionNotFoundError();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      throw new CatalogAttributeOptionConflictError(fields);
    }

    throw error;
  }

  private handleProductAttributeValuePersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new CatalogRelatedEntityNotFoundError("definition");
    }

    throw error;
  }

  private handleVariantAttributeValuePersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new CatalogRelatedEntityNotFoundError("definition");
    }

    throw error;
  }
}

export const catalogService = new CatalogService(new CatalogRepository());
