import { Prisma } from "@prisma/client";

import {
  FabricCodeConflictError,
  FabricInvalidMovementError,
  FabricNotFoundError,
} from "@/src/modules/fabrics/domain/fabric.errors";
import {
  CreateFabricInput,
  CreateFabricMovementInput,
  FabricMovementItem,
  PublicFabric,
  UpdateFabricInput,
} from "@/src/modules/fabrics/domain/fabric.types";
import { FabricRepository } from "@/src/modules/fabrics/infrastructure/fabric.repository";

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (!("code" in error)) {
    return false;
  }

  return (error as { code?: unknown }).code === code;
}

export class FabricService {
  constructor(private readonly fabricRepository: FabricRepository) {}

  async listFabrics(): Promise<PublicFabric[]> {
    return this.fabricRepository.list();
  }

  async getFabricById(id: number): Promise<PublicFabric> {
    const fabric = await this.fabricRepository.findById(id);
    if (!fabric) {
      throw new FabricNotFoundError();
    }

    return fabric;
  }

  async createFabric(input: CreateFabricInput): Promise<PublicFabric> {
    try {
      return await this.fabricRepository.create(input);
    } catch (error: unknown) {
      if (hasPrismaErrorCode(error, "P2002")) {
        throw new FabricCodeConflictError();
      }

      throw error;
    }
  }

  async updateFabric(id: number, input: UpdateFabricInput): Promise<PublicFabric> {
    try {
      return await this.fabricRepository.updateById(id, input);
    } catch (error: unknown) {
      if (hasPrismaErrorCode(error, "P2025")) {
        throw new FabricNotFoundError();
      }

      if (hasPrismaErrorCode(error, "P2002")) {
        throw new FabricCodeConflictError();
      }

      throw error;
    }
  }

  async deactivateFabric(id: number): Promise<PublicFabric> {
    try {
      return await this.fabricRepository.deactivateById(id);
    } catch (error: unknown) {
      if (hasPrismaErrorCode(error, "P2025")) {
        throw new FabricNotFoundError();
      }

      throw error;
    }
  }

  async listFabricMovements(fabricId: number): Promise<FabricMovementItem[]> {
    const exists = await this.fabricRepository.exists(fabricId);
    if (!exists) {
      throw new FabricNotFoundError();
    }

    return this.fabricRepository.listMovements(fabricId);
  }

  async createFabricMovement(
    fabricId: number,
    input: CreateFabricMovementInput
  ): Promise<{ fabric: PublicFabric; movement: FabricMovementItem }> {
    const current = await this.fabricRepository.findById(fabricId);
    if (!current) {
      throw new FabricNotFoundError();
    }

    const delta = this.fabricRepository.computeStockDelta(input.type, input.quantity);
    const nextStock = current.metersInStock.add(delta);

    if (nextStock.lt(new Prisma.Decimal(0))) {
      throw new FabricInvalidMovementError("Movement would leave stock below zero");
    }

    return this.fabricRepository.createMovement(fabricId, input, delta);
  }
}

export const fabricService = new FabricService(new FabricRepository());
