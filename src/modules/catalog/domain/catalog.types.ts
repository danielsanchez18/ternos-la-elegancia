import {
  AttributeScope,
  InputFieldType,
  Prisma,
  ProductKind,
} from "@prisma/client";

export type PublicCatalogAttributeOption = {
  id: string;
  definitionId: string;
  code: string;
  label: string;
  sortOrder: number;
  active: boolean;
};

export type PublicCatalogAttributeDefinition = {
  id: string;
  code: string;
  label: string;
  scope: AttributeScope;
  inputType: InputFieldType;
  appliesToKind: ProductKind | null;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  options: PublicCatalogAttributeOption[];
};

export type ListAttributeDefinitionsFilters = {
  scope?: AttributeScope;
  appliesToKind?: ProductKind;
  active?: boolean;
};

export type CreateAttributeDefinitionInput = {
  code: string;
  label: string;
  scope: AttributeScope;
  inputType: InputFieldType;
  appliesToKind?: ProductKind | null;
  active?: boolean;
  sortOrder?: number;
};

export type UpdateAttributeDefinitionInput = {
  label?: string;
  inputType?: InputFieldType;
  appliesToKind?: ProductKind | null;
  active?: boolean;
  sortOrder?: number;
};

export type CreateAttributeOptionInput = {
  code: string;
  label: string;
  sortOrder?: number;
  active?: boolean;
};

export type UpdateAttributeOptionInput = {
  label?: string;
  sortOrder?: number;
  active?: boolean;
};

export type UpsertProductAttributeValueInput = {
  definitionId: string;
  optionId?: string | null;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
};

export type PublicProductAttributeValue = {
  id: string;
  productId: string;
  definitionId: string;
  optionId: string | null;
  valueText: string | null;
  valueNumber: Prisma.Decimal | null;
  valueBoolean: boolean | null;
  definition: {
    id: string;
    code: string;
    label: string;
    scope: AttributeScope;
    inputType: InputFieldType;
  };
  option: {
    id: string;
    code: string;
    label: string;
  } | null;
};

export type UpsertVariantAttributeValueInput = {
  definitionId: string;
  optionId?: string | null;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
};

export type PublicVariantAttributeValue = {
  id: string;
  variantId: string;
  definitionId: string;
  optionId: string | null;
  valueText: string | null;
  valueNumber: Prisma.Decimal | null;
  valueBoolean: boolean | null;
  definition: {
    id: string;
    code: string;
    label: string;
    scope: AttributeScope;
    inputType: InputFieldType;
  };
  option: {
    id: string;
    code: string;
    label: string;
  } | null;
};

export type CreateProductComponentInput = {
  childProductId: string;
  quantity?: number;
  sortOrder?: number;
};

export type UpdateProductComponentInput = {
  childProductId?: string;
  quantity?: number;
  sortOrder?: number;
};

export type PublicProductComponent = {
  id: string;
  parentProductId: string;
  childProductId: string;
  quantity: number;
  sortOrder: number;
  childProduct: {
    id: string;
    nombre: string;
    slug: string;
    active: boolean;
  };
};
