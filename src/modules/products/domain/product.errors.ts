export class ProductNotFoundError extends Error {
  constructor() {
    super("Product not found");
    this.name = "ProductNotFoundError";
  }
}

export class ProductConflictError extends Error {
  readonly fields: string[];

  constructor(fields: string[]) {
    super("Product unique field conflict");
    this.name = "ProductConflictError";
    this.fields = fields;
  }
}

export class ProductRelatedEntityNotFoundError extends Error {
  readonly entity: "brand";

  constructor(entity: "brand") {
    super(`Related entity not found: ${entity}`);
    this.name = "ProductRelatedEntityNotFoundError";
    this.entity = entity;
  }
}

export class BrandNotFoundError extends Error {
  constructor() {
    super("Brand not found");
    this.name = "BrandNotFoundError";
  }
}

export class BrandConflictError extends Error {
  readonly fields: string[];

  constructor(fields: string[]) {
    super("Brand unique field conflict");
    this.name = "BrandConflictError";
    this.fields = fields;
  }
}

export class ProductImageNotFoundError extends Error {
  constructor() {
    super("Product image not found");
    this.name = "ProductImageNotFoundError";
  }
}

export class ProductVariantNotFoundError extends Error {
  constructor() {
    super("Product variant not found");
    this.name = "ProductVariantNotFoundError";
  }
}

export class ProductVariantConflictError extends Error {
  readonly fields: string[];

  constructor(fields: string[]) {
    super("Product variant unique field conflict");
    this.name = "ProductVariantConflictError";
    this.fields = fields;
  }
}

export class ProductVariantValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductVariantValidationError";
  }
}

export class ProductVariantImageNotFoundError extends Error {
  constructor() {
    super("Product variant image not found");
    this.name = "ProductVariantImageNotFoundError";
  }
}
