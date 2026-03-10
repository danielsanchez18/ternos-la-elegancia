export class FabricNotFoundError extends Error {
  constructor() {
    super("Fabric not found");
    this.name = "FabricNotFoundError";
  }
}

export class FabricCodeConflictError extends Error {
  constructor() {
    super("Fabric code already exists");
    this.name = "FabricCodeConflictError";
  }
}

export class FabricInvalidMovementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FabricInvalidMovementError";
  }
}
