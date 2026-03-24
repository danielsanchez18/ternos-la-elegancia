export class RentalOrderNotFoundError extends Error {
  constructor() {
    super("Rental order not found");
    this.name = "RentalOrderNotFoundError";
  }
}

export class RentalOrderCustomerNotFoundError extends Error {
  constructor() {
    super("Customer not found");
    this.name = "RentalOrderCustomerNotFoundError";
  }
}

export class RentalOrderUnitNotFoundError extends Error {
  constructor(unitId: string) {
    super(`Rental unit ${unitId} not found`);
    this.name = "RentalOrderUnitNotFoundError";
  }
}

export class RentalOrderUnitUnavailableError extends Error {
  constructor(unitId: string) {
    super(`Rental unit ${unitId} is not available`);
    this.name = "RentalOrderUnitUnavailableError";
  }
}

export class RentalOrderTransitionError extends Error {
  constructor() {
    super("Rental order status transition is not allowed");
    this.name = "RentalOrderTransitionError";
  }
}

export class RentalOrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RentalOrderValidationError";
  }
}
