import { Prisma, RentalPriceTier, RentalUnitStatus } from "@prisma/client";

import {
  RentalUnitConflictError,
  RentalUnitNotFoundError,
  RentalUnitProductNotFoundError,
  RentalUnitValidationError,
  RentalUnitVariantNotFoundError,
} from "@/src/modules/rental-units/domain/rental-unit.errors";
import {
  CreateRentalUnitInput,
  ListRentalUnitsFilters,
  PublicRentalUnit,
  RentalUnitActionInput,
  UpdateRentalUnitInput,
} from "@/src/modules/rental-units/domain/rental-unit.types";
import { RentalUnitRepository } from "@/src/modules/rental-units/infrastructure/rental-unit.repository";

export class RentalUnitService {
  constructor(private readonly rentalUnitRepository: RentalUnitRepository) {}

  async listRentalUnits(filters: ListRentalUnitsFilters): Promise<PublicRentalUnit[]> {
    return this.rentalUnitRepository.list(filters);
  }

  async getRentalUnitById(id: number): Promise<PublicRentalUnit> {
    const unit = await this.rentalUnitRepository.findById(id);
    if (!unit) {
      throw new RentalUnitNotFoundError();
    }

    return unit;
  }

  async createRentalUnit(input: CreateRentalUnitInput): Promise<PublicRentalUnit> {
    await this.assertForeignKeys(input.productId, input.variantId);

    if (input.premierePrice < input.normalPrice) {
      throw new RentalUnitValidationError("premierePrice must be >= normalPrice");
    }

    try {
      return await this.rentalUnitRepository.create(input);
    } catch (error: unknown) {
      this.handlePersistenceError(error);
    }
  }

  async updateRentalUnit(id: number, input: UpdateRentalUnitInput): Promise<PublicRentalUnit> {
    const current = await this.getRentalUnitById(id);

    await this.assertForeignKeys(current.productId, input.variantId ?? undefined);

    const nextNormalPrice = input.normalPrice ?? Number(current.normalPrice);
    const nextPremierePrice = input.premierePrice ?? Number(current.premierePrice);

    if (nextPremierePrice < nextNormalPrice) {
      throw new RentalUnitValidationError("premierePrice must be >= normalPrice");
    }

    try {
      return await this.rentalUnitRepository.updateById(id, input);
    } catch (error: unknown) {
      this.handlePersistenceError(error);
    }
  }

  async retireRentalUnit(id: number): Promise<PublicRentalUnit> {
    return this.actOnRentalUnit(id, { action: "MARK_RETIRED" });
  }

  async actOnRentalUnit(id: number, input: RentalUnitActionInput): Promise<PublicRentalUnit> {
    const unit = await this.getRentalUnitById(id);

    if (input.action === "MARK_AVAILABLE") {
      if (unit.status === RentalUnitStatus.ALQUILADO) {
        throw new RentalUnitValidationError("Cannot mark available while unit is rented");
      }

      return this.rentalUnitRepository.updateStatusAndTier({
        id,
        status: RentalUnitStatus.DISPONIBLE,
        note: input.note,
      });
    }

    if (input.action === "MARK_MAINTENANCE") {
      if (unit.status === RentalUnitStatus.ALQUILADO) {
        throw new RentalUnitValidationError("Cannot move to maintenance while unit is rented");
      }

      return this.rentalUnitRepository.updateStatusAndTier({
        id,
        status: RentalUnitStatus.EN_MANTENIMIENTO,
        note: input.note,
      });
    }

    if (input.action === "MARK_DAMAGED") {
      return this.rentalUnitRepository.updateStatusAndTier({
        id,
        status: RentalUnitStatus.DANADO,
        note: input.note,
      });
    }

    if (input.action === "MARK_RETIRED") {
      if (unit.status === RentalUnitStatus.ALQUILADO) {
        throw new RentalUnitValidationError("Cannot retire while unit is rented");
      }

      return this.rentalUnitRepository.updateStatusAndTier({
        id,
        status: RentalUnitStatus.RETIRADO,
        note: input.note,
      });
    }

    return this.rentalUnitRepository.updateStatusAndTier({
      id,
      currentTier: RentalPriceTier.NORMAL,
      note: input.note,
    });
  }

  private async assertForeignKeys(productId: number, variantId?: number): Promise<void> {
    const product = await this.rentalUnitRepository.getProductById(productId);
    if (!product) {
      throw new RentalUnitProductNotFoundError();
    }

    if (variantId === undefined) {
      return;
    }

    const variant = await this.rentalUnitRepository.getVariantById(variantId);
    if (!variant) {
      throw new RentalUnitVariantNotFoundError();
    }

    if (variant.productId !== productId) {
      throw new RentalUnitValidationError("Variant does not belong to the selected product");
    }
  }

  private handlePersistenceError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new RentalUnitNotFoundError();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.map(String)
        : [];
      throw new RentalUnitConflictError(fields);
    }

    throw error;
  }
}

export const rentalUnitService = new RentalUnitService(new RentalUnitRepository());
