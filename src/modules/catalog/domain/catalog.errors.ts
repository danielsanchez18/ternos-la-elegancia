export class CatalogAttributeDefinitionNotFoundError extends Error {
  constructor() {
    super("Catalog attribute definition not found");
    this.name = "CatalogAttributeDefinitionNotFoundError";
  }
}

export class CatalogAttributeDefinitionConflictError extends Error {
  readonly fields: string[];

  constructor(fields: string[]) {
    super("Catalog attribute definition unique conflict");
    this.name = "CatalogAttributeDefinitionConflictError";
    this.fields = fields;
  }
}

export class CatalogAttributeOptionNotFoundError extends Error {
  constructor() {
    super("Catalog attribute option not found");
    this.name = "CatalogAttributeOptionNotFoundError";
  }
}

export class CatalogAttributeOptionConflictError extends Error {
  readonly fields: string[];

  constructor(fields: string[]) {
    super("Catalog attribute option unique conflict");
    this.name = "CatalogAttributeOptionConflictError";
    this.fields = fields;
  }
}

export class CatalogProductAttributeValueNotFoundError extends Error {
  constructor() {
    super("Product attribute value not found");
    this.name = "CatalogProductAttributeValueNotFoundError";
  }
}

export class CatalogVariantAttributeValueNotFoundError extends Error {
  constructor() {
    super("Variant attribute value not found");
    this.name = "CatalogVariantAttributeValueNotFoundError";
  }
}

export class CatalogProductComponentNotFoundError extends Error {
  constructor() {
    super("Product component not found");
    this.name = "CatalogProductComponentNotFoundError";
  }
}

export class CatalogRelatedEntityNotFoundError extends Error {
  readonly entity: "product" | "variant" | "definition" | "option";

  constructor(entity: "product" | "variant" | "definition" | "option") {
    super(`Related entity not found: ${entity}`);
    this.name = "CatalogRelatedEntityNotFoundError";
    this.entity = entity;
  }
}

export class CatalogValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogValidationError";
  }
}
