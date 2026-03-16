export class CustomerNoteNotFoundError extends Error {
  constructor() {
    super("Customer note not found");
    this.name = "CustomerNoteNotFoundError";
  }
}

export class CustomerFileNotFoundError extends Error {
  constructor() {
    super("Customer file not found");
    this.name = "CustomerFileNotFoundError";
  }
}

export class CustomerRecordRelatedEntityNotFoundError extends Error {
  readonly entity: "customer" | "adminUser";

  constructor(entity: "customer" | "adminUser") {
    super(`Related entity not found: ${entity}`);
    this.name = "CustomerRecordRelatedEntityNotFoundError";
    this.entity = entity;
  }
}
