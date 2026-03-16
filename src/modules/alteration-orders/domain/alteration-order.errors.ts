export class AlterationOrderNotFoundError extends Error {
  constructor() {
    super("Alteration order not found");
    this.name = "AlterationOrderNotFoundError";
  }
}

export class AlterationOrderCustomerNotFoundError extends Error {
  constructor() {
    super("Customer not found");
    this.name = "AlterationOrderCustomerNotFoundError";
  }
}

export class AlterationOrderServiceNotFoundError extends Error {
  constructor(serviceId: number) {
    super(`Alteration service ${serviceId} not found`);
    this.name = "AlterationOrderServiceNotFoundError";
  }
}

export class AlterationOrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlterationOrderValidationError";
  }
}

export class AlterationOrderStatusTransitionError extends Error {
  constructor() {
    super("Alteration order status transition is not allowed");
    this.name = "AlterationOrderStatusTransitionError";
  }
}
