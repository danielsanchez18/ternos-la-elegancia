export class PaymentCustomOrderNotFoundError extends Error {
  constructor() {
    super("Custom order not found");
    this.name = "PaymentCustomOrderNotFoundError";
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
