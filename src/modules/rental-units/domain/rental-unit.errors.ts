export class RentalUnitNotFoundError extends Error {
  constructor() {
    super("Rental unit not found");
    this.name = "RentalUnitNotFoundError";
  }
}

export class RentalUnitConflictError extends Error {
  readonly fields: string[];

  constructor(fields: string[]) {
    super("Rental unit unique field conflict");
    this.name = "RentalUnitConflictError";
    this.fields = fields;
  }
}

export class RentalUnitProductNotFoundError extends Error {
  constructor() {
    super("Product not found for rental unit");
    this.name = "RentalUnitProductNotFoundError";
  }
}

export class RentalUnitVariantNotFoundError extends Error {
  constructor() {
    super("Variant not found for rental unit");
    this.name = "RentalUnitVariantNotFoundError";
  }
}

export class RentalUnitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RentalUnitValidationError";
  }
}
