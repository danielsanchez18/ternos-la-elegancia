export class PromotionNotFoundError extends Error {
  constructor() {
    super("Promotion not found");
    this.name = "PromotionNotFoundError";
  }
}

export class PromotionConflictError extends Error {
  readonly fields: string[];

  constructor(fields: string[]) {
    super("Promotion unique field conflict");
    this.name = "PromotionConflictError";
    this.fields = fields;
  }
}

export class CouponNotFoundError extends Error {
  constructor() {
    super("Coupon not found");
    this.name = "CouponNotFoundError";
  }
}

export class CouponUseNotFoundError extends Error {
  constructor() {
    super("Coupon use not found");
    this.name = "CouponUseNotFoundError";
  }
}

export class CouponConflictError extends Error {
  readonly fields: string[];

  constructor(fields: string[]) {
    super("Coupon unique field conflict");
    this.name = "CouponConflictError";
    this.fields = fields;
  }
}

export class PromotionRelatedEntityNotFoundError extends Error {
  readonly entity:
    | "promotion"
    | "bundle"
    | "product"
    | "coupon"
    | "saleOrder"
    | "customOrder"
    | "rentalOrder"
    | "alterationOrder";

  constructor(
    entity:
      | "promotion"
      | "bundle"
      | "product"
      | "coupon"
      | "saleOrder"
      | "customOrder"
      | "rentalOrder"
      | "alterationOrder"
  ) {
    super(`Related entity not found: ${entity}`);
    this.name = "PromotionRelatedEntityNotFoundError";
    this.entity = entity;
  }
}

export class PromotionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromotionValidationError";
  }
}
