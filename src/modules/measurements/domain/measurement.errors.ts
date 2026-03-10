export class MeasurementProfileNotFoundError extends Error {
  constructor() {
    super("Measurement profile not found");
    this.name = "MeasurementProfileNotFoundError";
  }
}

export class MeasurementCustomerNotFoundError extends Error {
  constructor() {
    super("Customer not found for measurement profile");
    this.name = "MeasurementCustomerNotFoundError";
  }
}

export class MeasurementGarmentConflictError extends Error {
  constructor() {
    super("Duplicated garment type in measurement profile");
    this.name = "MeasurementGarmentConflictError";
  }
}

export class MeasurementFieldNotFoundForGarmentError extends Error {
  constructor() {
    super("One or more measurement fields are not valid for the garment type");
    this.name = "MeasurementFieldNotFoundForGarmentError";
  }
}

export class MeasurementProfileGarmentNotFoundError extends Error {
  constructor() {
    super("Measurement garment was not found for profile");
    this.name = "MeasurementProfileGarmentNotFoundError";
  }
}
