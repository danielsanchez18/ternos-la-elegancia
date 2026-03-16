export class BundleNotFoundError extends Error {
  constructor() {
    super("Bundle not found");
    this.name = "BundleNotFoundError";
  }
}

export class BundleConflictError extends Error {
  readonly fields: string[];

  constructor(fields: string[]) {
    super("Bundle unique field conflict");
    this.name = "BundleConflictError";
    this.fields = fields;
  }
}

export class BundleItemNotFoundError extends Error {
  constructor() {
    super("Bundle item not found");
    this.name = "BundleItemNotFoundError";
  }
}

export class BundleVariantItemNotFoundError extends Error {
  constructor() {
    super("Bundle variant item not found");
    this.name = "BundleVariantItemNotFoundError";
  }
}

export class BundleRelatedEntityNotFoundError extends Error {
  readonly entity: "product" | "variant";

  constructor(entity: "product" | "variant") {
    super(`Related entity not found: ${entity}`);
    this.name = "BundleRelatedEntityNotFoundError";
    this.entity = entity;
  }
}

export class BundleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BundleValidationError";
  }
}
