export class AlterationServiceNotFoundError extends Error {
  constructor() {
    super("Alteration service not found");
    this.name = "AlterationServiceNotFoundError";
  }
}

export class AlterationServiceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlterationServiceValidationError";
  }
}
