export class CustomOrderNotFoundError extends Error {
  constructor() {
    super("Custom order not found");
    this.name = "CustomOrderNotFoundError";
  }
}

export class CustomOrderCustomerNotFoundError extends Error {
  constructor() {
    super("Customer not found");
    this.name = "CustomOrderCustomerNotFoundError";
  }
}

export class CustomOrderMeasurementNotValidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomOrderMeasurementNotValidError";
  }
}

export class CustomOrderFabricNotFoundError extends Error {
  constructor() {
    super("Fabric not found");
    this.name = "CustomOrderFabricNotFoundError";
  }
}

export class CustomOrderCustomizationNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomOrderCustomizationNotFoundError";
  }
}

export class CustomOrderStatusTransitionError extends Error {
  constructor() {
    super("Custom order status transition is not allowed");
    this.name = "CustomOrderStatusTransitionError";
  }
}

export class CustomOrderAdvancePaymentRequiredError extends Error {
  constructor() {
    super("A 50% approved advance payment is required before starting confección");
    this.name = "CustomOrderAdvancePaymentRequiredError";
  }
}
