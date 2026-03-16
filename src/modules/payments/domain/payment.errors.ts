export class PaymentCustomOrderNotFoundError extends Error {
  constructor() {
    super("Custom order not found");
    this.name = "PaymentCustomOrderNotFoundError";
  }
}

export class PaymentSaleOrderNotFoundError extends Error {
  constructor() {
    super("Sale order not found");
    this.name = "PaymentSaleOrderNotFoundError";
  }
}

export class PaymentRentalOrderNotFoundError extends Error {
  constructor() {
    super("Rental order not found");
    this.name = "PaymentRentalOrderNotFoundError";
  }
}

export class PaymentAlterationOrderNotFoundError extends Error {
  constructor() {
    super("Alteration order not found");
    this.name = "PaymentAlterationOrderNotFoundError";
  }
}

export class PaymentOverchargeError extends Error {
  constructor() {
    super("Payment amount exceeds pending balance for the order");
    this.name = "PaymentOverchargeError";
  }
}

export class ComprobanteOverchargeError extends Error {
  constructor() {
    super("Comprobante total exceeds custom order total");
    this.name = "ComprobanteOverchargeError";
  }
}
