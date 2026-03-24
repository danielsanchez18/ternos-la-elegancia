import {
  AlterationServiceNotFoundError,
  AlterationServiceValidationError,
} from "@/src/modules/alteration-services/domain/alteration-service.errors";
import {
  CreateAlterationServiceInput,
  ListAlterationServicesFilters,
  PublicAlterationService,
  UpdateAlterationServiceInput,
} from "@/src/modules/alteration-services/domain/alteration-service.types";
import { AlterationServiceRepository } from "@/src/modules/alteration-services/infrastructure/alteration-service.repository";

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (!("code" in error)) {
    return false;
  }

  return (error as { code?: unknown }).code === code;
}

export class AlterationServiceService {
  constructor(private readonly alterationServiceRepository: AlterationServiceRepository) {}

  async listAlterationServices(
    filters: ListAlterationServicesFilters
  ): Promise<PublicAlterationService[]> {
    return this.alterationServiceRepository.list(filters);
  }

  async getAlterationServiceById(id: string): Promise<PublicAlterationService> {
    const service = await this.alterationServiceRepository.findById(id);
    if (!service) {
      throw new AlterationServiceNotFoundError();
    }

    return service;
  }

  async createAlterationService(
    input: CreateAlterationServiceInput
  ): Promise<PublicAlterationService> {
    if (input.precioBase !== undefined && input.precioBase < 0) {
      throw new AlterationServiceValidationError("precioBase must be >= 0");
    }

    return this.alterationServiceRepository.create(input);
  }

  async updateAlterationService(
    id: string,
    input: UpdateAlterationServiceInput
  ): Promise<PublicAlterationService> {
    if (input.precioBase !== undefined && input.precioBase !== null && input.precioBase < 0) {
      throw new AlterationServiceValidationError("precioBase must be >= 0");
    }

    try {
      return await this.alterationServiceRepository.updateById(id, input);
    } catch (error: unknown) {
      if (hasPrismaErrorCode(error, "P2025")) {
        throw new AlterationServiceNotFoundError();
      }

      throw error;
    }
  }

  async deactivateAlterationService(id: string): Promise<PublicAlterationService> {
    try {
      return await this.alterationServiceRepository.deactivateById(id);
    } catch (error: unknown) {
      if (hasPrismaErrorCode(error, "P2025")) {
        throw new AlterationServiceNotFoundError();
      }

      throw error;
    }
  }
}

export const alterationServiceService = new AlterationServiceService(
  new AlterationServiceRepository()
);
