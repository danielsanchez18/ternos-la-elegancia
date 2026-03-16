import { AttributeScope, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
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

const publicCatalogAttributeOptionSelect = {
  id: true,
  definitionId: true,
  code: true,
  label: true,
  sortOrder: true,
  active: true,
} satisfies Prisma.CatalogAttributeOptionSelect;

const publicCatalogAttributeDefinitionSelect = {
  id: true,
  code: true,
  label: true,
  scope: true,
  inputType: true,
  appliesToKind: true,
  active: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  options: {
    select: publicCatalogAttributeOptionSelect,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.CatalogAttributeDefinitionSelect;

const publicProductAttributeValueSelect = {
  id: true,
  productId: true,
  definitionId: true,
  optionId: true,
  valueText: true,
  valueNumber: true,
  valueBoolean: true,
  definition: {
    select: {
      id: true,
      code: true,
      label: true,
      scope: true,
      inputType: true,
    },
  },
  option: {
    select: {
      id: true,
      code: true,
      label: true,
    },
  },
} satisfies Prisma.ProductAttributeValueSelect;

const publicVariantAttributeValueSelect = {
  id: true,
  variantId: true,
  definitionId: true,
  optionId: true,
  valueText: true,
  valueNumber: true,
  valueBoolean: true,
  definition: {
    select: {
      id: true,
      code: true,
      label: true,
      scope: true,
      inputType: true,
    },
  },
  option: {
    select: {
      id: true,
      code: true,
      label: true,
    },
  },
} satisfies Prisma.VariantAttributeValueSelect;

const publicProductComponentSelect = {
  id: true,
  parentProductId: true,
  childProductId: true,
  quantity: true,
  sortOrder: true,
  childProduct: {
    select: {
      id: true,
      nombre: true,
      slug: true,
      active: true,
    },
  },
} satisfies Prisma.ProductComponentSelect;

export class CatalogRepository {
  async listAttributeDefinitions(
    filters: ListAttributeDefinitionsFilters
  ): Promise<PublicCatalogAttributeDefinition[]> {
    return prisma.catalogAttributeDefinition.findMany({
      where: {
        scope: filters.scope,
        appliesToKind: filters.appliesToKind,
        active: filters.active,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: publicCatalogAttributeDefinitionSelect,
    });
  }

  async findAttributeDefinitionById(id: number): Promise<PublicCatalogAttributeDefinition | null> {
    return prisma.catalogAttributeDefinition.findUnique({
      where: { id },
      select: publicCatalogAttributeDefinitionSelect,
    });
  }

  async createAttributeDefinition(
    input: CreateAttributeDefinitionInput
  ): Promise<PublicCatalogAttributeDefinition> {
    return prisma.catalogAttributeDefinition.create({
      data: {
        code: input.code,
        label: input.label,
        scope: input.scope,
        inputType: input.inputType,
        appliesToKind: input.appliesToKind,
        active: input.active,
        sortOrder: input.sortOrder,
      },
      select: publicCatalogAttributeDefinitionSelect,
    });
  }

  async updateAttributeDefinitionById(
    id: number,
    input: UpdateAttributeDefinitionInput
  ): Promise<PublicCatalogAttributeDefinition> {
    return prisma.catalogAttributeDefinition.update({
      where: { id },
      data: {
        label: input.label,
        inputType: input.inputType,
        appliesToKind: input.appliesToKind,
        active: input.active,
        sortOrder: input.sortOrder,
      },
      select: publicCatalogAttributeDefinitionSelect,
    });
  }

  async deactivateAttributeDefinitionById(id: number): Promise<PublicCatalogAttributeDefinition> {
    return this.updateAttributeDefinitionById(id, { active: false });
  }

  async listAttributeOptionsByDefinitionId(
    definitionId: number
  ): Promise<PublicCatalogAttributeOption[]> {
    return prisma.catalogAttributeOption.findMany({
      where: { definitionId },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: publicCatalogAttributeOptionSelect,
    });
  }

  async createAttributeOption(
    definitionId: number,
    input: CreateAttributeOptionInput
  ): Promise<PublicCatalogAttributeOption> {
    return prisma.catalogAttributeOption.create({
      data: {
        definitionId,
        code: input.code,
        label: input.label,
        sortOrder: input.sortOrder,
        active: input.active,
      },
      select: publicCatalogAttributeOptionSelect,
    });
  }

  async updateAttributeOptionById(
    optionId: number,
    input: UpdateAttributeOptionInput
  ): Promise<PublicCatalogAttributeOption> {
    return prisma.catalogAttributeOption.update({
      where: { id: optionId },
      data: {
        label: input.label,
        sortOrder: input.sortOrder,
        active: input.active,
      },
      select: publicCatalogAttributeOptionSelect,
    });
  }

  async deactivateAttributeOptionById(optionId: number): Promise<PublicCatalogAttributeOption> {
    return this.updateAttributeOptionById(optionId, { active: false });
  }

  async getAttributeOptionById(optionId: number) {
    return prisma.catalogAttributeOption.findUnique({
      where: { id: optionId },
      select: {
        id: true,
        definitionId: true,
      },
    });
  }

  async productExists(productId: number): Promise<boolean> {
    const row = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    return Boolean(row);
  }

  async variantExists(variantId: number): Promise<boolean> {
    const row = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true },
    });

    return Boolean(row);
  }

  async definitionById(definitionId: number) {
    return prisma.catalogAttributeDefinition.findUnique({
      where: { id: definitionId },
      select: {
        id: true,
        scope: true,
      },
    });
  }

  async listProductAttributeValues(productId: number): Promise<PublicProductAttributeValue[]> {
    return prisma.productAttributeValue.findMany({
      where: { productId },
      orderBy: [{ definition: { sortOrder: "asc" } }, { id: "asc" }],
      select: publicProductAttributeValueSelect,
    });
  }

  async upsertProductAttributeValue(
    productId: number,
    input: UpsertProductAttributeValueInput
  ): Promise<PublicProductAttributeValue> {
    return prisma.productAttributeValue.upsert({
      where: {
        productId_definitionId: {
          productId,
          definitionId: input.definitionId,
        },
      },
      create: {
        productId,
        definitionId: input.definitionId,
        optionId: input.optionId,
        valueText: input.valueText,
        valueNumber:
          input.valueNumber !== undefined && input.valueNumber !== null
            ? new Prisma.Decimal(input.valueNumber)
            : input.valueNumber,
        valueBoolean: input.valueBoolean,
      },
      update: {
        optionId: input.optionId,
        valueText: input.valueText,
        valueNumber:
          input.valueNumber !== undefined && input.valueNumber !== null
            ? new Prisma.Decimal(input.valueNumber)
            : input.valueNumber,
        valueBoolean: input.valueBoolean,
      },
      select: publicProductAttributeValueSelect,
    });
  }

  async deleteProductAttributeValue(
    productId: number,
    definitionId: number
  ): Promise<void> {
    await prisma.productAttributeValue.delete({
      where: {
        productId_definitionId: {
          productId,
          definitionId,
        },
      },
    });
  }

  async listVariantAttributeValues(variantId: number): Promise<PublicVariantAttributeValue[]> {
    return prisma.variantAttributeValue.findMany({
      where: { variantId },
      orderBy: [{ definition: { sortOrder: "asc" } }, { id: "asc" }],
      select: publicVariantAttributeValueSelect,
    });
  }

  async upsertVariantAttributeValue(
    variantId: number,
    input: UpsertVariantAttributeValueInput
  ): Promise<PublicVariantAttributeValue> {
    return prisma.variantAttributeValue.upsert({
      where: {
        variantId_definitionId: {
          variantId,
          definitionId: input.definitionId,
        },
      },
      create: {
        variantId,
        definitionId: input.definitionId,
        optionId: input.optionId,
        valueText: input.valueText,
        valueNumber:
          input.valueNumber !== undefined && input.valueNumber !== null
            ? new Prisma.Decimal(input.valueNumber)
            : input.valueNumber,
        valueBoolean: input.valueBoolean,
      },
      update: {
        optionId: input.optionId,
        valueText: input.valueText,
        valueNumber:
          input.valueNumber !== undefined && input.valueNumber !== null
            ? new Prisma.Decimal(input.valueNumber)
            : input.valueNumber,
        valueBoolean: input.valueBoolean,
      },
      select: publicVariantAttributeValueSelect,
    });
  }

  async deleteVariantAttributeValue(
    variantId: number,
    definitionId: number
  ): Promise<void> {
    await prisma.variantAttributeValue.delete({
      where: {
        variantId_definitionId: {
          variantId,
          definitionId,
        },
      },
    });
  }

  async listProductComponents(parentProductId: number): Promise<PublicProductComponent[]> {
    return prisma.productComponent.findMany({
      where: { parentProductId },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: publicProductComponentSelect,
    });
  }

  async createProductComponent(
    parentProductId: number,
    input: CreateProductComponentInput
  ): Promise<PublicProductComponent> {
    return prisma.productComponent.create({
      data: {
        parentProductId,
        childProductId: input.childProductId,
        quantity: input.quantity,
        sortOrder: input.sortOrder,
      },
      select: publicProductComponentSelect,
    });
  }

  async updateProductComponentById(
    componentId: number,
    input: UpdateProductComponentInput
  ): Promise<PublicProductComponent> {
    return prisma.productComponent.update({
      where: { id: componentId },
      data: {
        childProductId: input.childProductId,
        quantity: input.quantity,
        sortOrder: input.sortOrder,
      },
      select: publicProductComponentSelect,
    });
  }

  async deleteProductComponentById(componentId: number): Promise<void> {
    await prisma.productComponent.delete({ where: { id: componentId } });
  }

  async getProductComponentById(componentId: number) {
    return prisma.productComponent.findUnique({
      where: { id: componentId },
      select: {
        id: true,
        parentProductId: true,
      },
    });
  }

  async ensureDefinitionScope(definitionId: number, expectedScope: AttributeScope): Promise<boolean> {
    const definition = await this.definitionById(definitionId);
    return Boolean(definition && definition.scope === expectedScope);
  }
}
