import {
  AttributeScope,
  InputFieldType,
  Prisma,
  ProductKind,
} from "@prisma/client";

export type PublicCatalogAttributeOption = {
  id: number;
  definitionId: number;
  code: string;
  label: string;
  sortOrder: number;
  active: boolean;
};

export type PublicCatalogAttributeDefinition = {
  id: number;
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
  definitionId: number;
  optionId?: number | null;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
};

export type PublicProductAttributeValue = {
  id: number;
  productId: number;
  definitionId: number;
  optionId: number | null;
  valueText: string | null;
  valueNumber: Prisma.Decimal | null;
  valueBoolean: boolean | null;
  definition: {
    id: number;
    code: string;
    label: string;
    scope: AttributeScope;
    inputType: InputFieldType;
  };
  option: {
    id: number;
    code: string;
    label: string;
  } | null;
};

export type UpsertVariantAttributeValueInput = {
  definitionId: number;
  optionId?: number | null;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
};

export type PublicVariantAttributeValue = {
  id: number;
  variantId: number;
  definitionId: number;
  optionId: number | null;
  valueText: string | null;
  valueNumber: Prisma.Decimal | null;
  valueBoolean: boolean | null;
  definition: {
    id: number;
    code: string;
    label: string;
    scope: AttributeScope;
    inputType: InputFieldType;
  };
  option: {
    id: number;
    code: string;
    label: string;
  } | null;
};

export type CreateProductComponentInput = {
  childProductId: number;
  quantity?: number;
  sortOrder?: number;
};

export type UpdateProductComponentInput = {
  childProductId?: number;
  quantity?: number;
  sortOrder?: number;
};

export type PublicProductComponent = {
  id: number;
  parentProductId: number;
  childProductId: number;
  quantity: number;
  sortOrder: number;
  childProduct: {
    id: number;
    nombre: string;
    slug: string;
    active: boolean;
  };
};
