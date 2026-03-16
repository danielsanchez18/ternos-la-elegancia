export class CustomerNotFoundError extends Error {
  constructor() {
    super("Customer not found");
    this.name = "CustomerNotFoundError";
  }
}

export class CustomerConflictError extends Error {
  readonly fields: string[];

  constructor(fields: string[]) {
    super("Customer unique field conflict");
    this.name = "CustomerConflictError";
    this.fields = fields;
  }
}
