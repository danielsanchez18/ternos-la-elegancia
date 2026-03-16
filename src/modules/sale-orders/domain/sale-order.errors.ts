export class SaleOrderNotFoundError extends Error {
  constructor() {
    super("Sale order not found");
    this.name = "SaleOrderNotFoundError";
  }
}

export class SaleOrderCustomerNotFoundError extends Error {
  constructor() {
    super("Customer not found");
    this.name = "SaleOrderCustomerNotFoundError";
  }
}

export class SaleOrderItemReferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SaleOrderItemReferenceError";
  }
}

export class SaleOrderStatusTransitionError extends Error {
  constructor() {
    super("Sale order status transition is not allowed");
    this.name = "SaleOrderStatusTransitionError";
  }
}

export class SaleOrderPaymentRequiredError extends Error {
  constructor() {
    super("Approved payments must cover total before marking order as paid");
    this.name = "SaleOrderPaymentRequiredError";
  }
}

export class SaleOrderMeasurementReservationRequiredError extends Error {
  constructor() {
    super(
      "First suit/jacket purchase without valid measurements requires an active measurement appointment"
    );
    this.name = "SaleOrderMeasurementReservationRequiredError";
  }
}
