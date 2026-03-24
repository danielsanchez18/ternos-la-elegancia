import { Prisma } from "@prisma/client";

import {
  MeasurementCustomerNotFoundError,
  MeasurementFieldNotFoundForGarmentError,
  MeasurementGarmentConflictError,
  MeasurementProfileGarmentNotFoundError,
  MeasurementProfileNotFoundError,
} from "@/src/modules/measurements/domain/measurement.errors";
import {
  CreateMeasurementProfileInput,
  MeasurementFieldListItem,
  MeasurementValuesByGarment,
  PublicMeasurementProfile,
  UpsertMeasurementValuesInput,
  UpdateMeasurementProfileInput,
} from "@/src/modules/measurements/domain/measurement.types";
import { MeasurementGarmentType } from "@prisma/client";
import { MeasurementRepository } from "@/src/modules/measurements/infrastructure/measurement.repository";

function addThreeMonths(date: Date): Date {
  const validUntil = new Date(date);
  validUntil.setMonth(validUntil.getMonth() + 3);
  return validUntil;
}

export class MeasurementService {
  constructor(private readonly measurementRepository: MeasurementRepository) {}

  async createProfile(input: CreateMeasurementProfileInput): Promise<PublicMeasurementProfile> {
    const customerExists = await this.measurementRepository.customerExists(
      input.customerId
    );

    if (!customerExists) {
      throw new MeasurementCustomerNotFoundError();
    }

    const takenAt = input.takenAt ?? new Date();

    try {
      return await this.measurementRepository.createProfile({
        ...input,
        takenAt,
        validUntil: addThreeMonths(takenAt),
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new MeasurementGarmentConflictError();
      }

      throw error;
    }
  }

  async listProfilesByCustomer(customerId: string): Promise<PublicMeasurementProfile[]> {
    return this.measurementRepository.listProfilesByCustomer(customerId);
  }

  async listFieldsByGarmentType(
    garmentType: MeasurementGarmentType
  ): Promise<MeasurementFieldListItem[]> {
    return this.measurementRepository.listFieldsByGarmentType(garmentType);
  }

  async getProfileById(id: string): Promise<PublicMeasurementProfile> {
    const profile = await this.measurementRepository.findProfileById(id);

    if (!profile) {
      throw new MeasurementProfileNotFoundError();
    }

    return profile;
  }

  async updateProfile(
    id: string,
    input: UpdateMeasurementProfileInput
  ): Promise<PublicMeasurementProfile> {
    try {
      return await this.measurementRepository.updateProfile(id, input);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new MeasurementProfileNotFoundError();
      }

      throw error;
    }
  }

  async getProfileValuesByGarmentType(
    profileId: string,
    garmentType: MeasurementGarmentType
  ): Promise<MeasurementValuesByGarment> {
    const profile = await this.measurementRepository.findProfileById(profileId);

    if (!profile) {
      throw new MeasurementProfileNotFoundError();
    }

    const garmentValues =
      await this.measurementRepository.getProfileValuesByGarmentType(
        profileId,
        garmentType
      );

    if (!garmentValues) {
      throw new MeasurementProfileGarmentNotFoundError();
    }

    return garmentValues;
  }

  async upsertProfileValues(
    profileId: string,
    input: UpsertMeasurementValuesInput
  ): Promise<MeasurementValuesByGarment> {
    const profile = await this.measurementRepository.findProfileById(profileId);

    if (!profile) {
      throw new MeasurementProfileNotFoundError();
    }

    try {
      return await this.measurementRepository.upsertProfileValues(profileId, input);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === "MEASUREMENT_FIELD_NOT_FOUND_FOR_GARMENT"
      ) {
        throw new MeasurementFieldNotFoundForGarmentError();
      }

      if (
        error instanceof Error &&
        error.message === "MEASUREMENT_PROFILE_GARMENT_NOT_FOUND"
      ) {
        throw new MeasurementProfileGarmentNotFoundError();
      }

      throw error;
    }
  }
}

export const measurementService = new MeasurementService(
  new MeasurementRepository()
);
