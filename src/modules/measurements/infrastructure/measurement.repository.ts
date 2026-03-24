import { Prisma } from "@prisma/client";
import { MeasurementGarmentType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CreateMeasurementProfileInput,
  MeasurementFieldListItem,
  MeasurementValuesByGarment,
  PublicMeasurementProfile,
  UpsertMeasurementValuesInput,
  UpdateMeasurementProfileInput,
} from "@/src/modules/measurements/domain/measurement.types";

const measurementProfileSelect = {
  id: true,
  customerId: true,
  takenAt: true,
  validUntil: true,
  notes: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  garments: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      garmentType: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      values: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          fieldId: true,
          valueNumber: true,
          valueText: true,
          field: {
            select: {
              id: true,
              code: true,
              label: true,
              unit: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.MeasurementProfileSelect;

export class MeasurementRepository {
  async listFieldsByGarmentType(
    garmentType: MeasurementGarmentType
  ): Promise<MeasurementFieldListItem[]> {
    return prisma.measurementField.findMany({
      where: { garmentType, active: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: {
        id: true,
        garmentType: true,
        code: true,
        label: true,
        unit: true,
        sortOrder: true,
        active: true,
      },
    });
  }

  async customerExists(customerId: string): Promise<boolean> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    return Boolean(customer);
  }

  async createProfile(input: CreateMeasurementProfileInput & { validUntil: Date }): Promise<PublicMeasurementProfile> {
    return prisma.measurementProfile.create({
      data: {
        customerId: input.customerId,
        takenAt: input.takenAt,
        validUntil: input.validUntil,
        notes: input.notes,
        garments: input.garmentTypes?.length
          ? {
              create: input.garmentTypes.map((garmentType) => ({
                garmentType,
              })),
            }
          : undefined,
      },
      select: measurementProfileSelect,
    });
  }

  async listProfilesByCustomer(customerId: string): Promise<PublicMeasurementProfile[]> {
    return prisma.measurementProfile.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      select: measurementProfileSelect,
    });
  }

  async findProfileById(id: string): Promise<PublicMeasurementProfile | null> {
    return prisma.measurementProfile.findUnique({
      where: { id },
      select: measurementProfileSelect,
    });
  }

  async updateProfile(id: string, input: UpdateMeasurementProfileInput): Promise<PublicMeasurementProfile> {
    return prisma.measurementProfile.update({
      where: { id },
      data: {
        notes: input.notes,
        validUntil: input.validUntil,
        isActive: input.isActive,
      },
      select: measurementProfileSelect,
    });
  }

  async getProfileValuesByGarmentType(
    profileId: string,
    garmentType: MeasurementGarmentType
  ): Promise<MeasurementValuesByGarment | null> {
    const garment = await prisma.measurementProfileGarment.findFirst({
      where: { profileId, garmentType },
      select: {
        id: true,
        profileId: true,
        garmentType: true,
        values: {
          orderBy: { id: "asc" },
          select: {
            id: true,
            fieldId: true,
            valueNumber: true,
            valueText: true,
            field: {
              select: {
                code: true,
                label: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!garment) {
      return null;
    }

    return {
      profileId: garment.profileId,
      garmentId: garment.id,
      garmentType: garment.garmentType,
      values: garment.values.map((item) => ({
        id: item.id,
        fieldId: item.fieldId,
        fieldCode: item.field.code,
        fieldLabel: item.field.label,
        unit: item.field.unit,
        valueNumber: item.valueNumber,
        valueText: item.valueText,
      })),
    };
  }

  async upsertProfileValues(
    profileId: string,
    input: UpsertMeasurementValuesInput
  ): Promise<MeasurementValuesByGarment> {
    return prisma.$transaction(async (tx) => {
      const garment =
        (await tx.measurementProfileGarment.findFirst({
          where: { profileId, garmentType: input.garmentType },
          select: { id: true },
        })) ??
        (await tx.measurementProfileGarment.create({
          data: { profileId, garmentType: input.garmentType },
          select: { id: true },
        }));

      const validFields = await tx.measurementField.findMany({
        where: {
          garmentType: input.garmentType,
          active: true,
          id: { in: input.values.map((item) => item.fieldId) },
        },
        select: { id: true },
      });

      const validFieldIds = new Set(validFields.map((item) => item.id));
      const invalidFieldExists = input.values.some(
        (item) => !validFieldIds.has(item.fieldId)
      );

      if (invalidFieldExists) {
        throw new Error("MEASUREMENT_FIELD_NOT_FOUND_FOR_GARMENT");
      }

      for (const value of input.values) {
        await tx.measurementValue.upsert({
          where: {
            garmentId_fieldId: {
              garmentId: garment.id,
              fieldId: value.fieldId,
            },
          },
          update: {
            valueNumber:
              value.valueNumber !== undefined
                ? new Prisma.Decimal(value.valueNumber)
                : null,
            valueText: value.valueText ?? null,
          },
          create: {
            garmentId: garment.id,
            fieldId: value.fieldId,
            valueNumber:
              value.valueNumber !== undefined
                ? new Prisma.Decimal(value.valueNumber)
                : null,
            valueText: value.valueText ?? null,
          },
        });
      }

      const fullGarment = await tx.measurementProfileGarment.findUnique({
        where: { id: garment.id },
        select: {
          id: true,
          profileId: true,
          garmentType: true,
          values: {
            orderBy: { id: "asc" },
            select: {
              id: true,
              fieldId: true,
              valueNumber: true,
              valueText: true,
              field: {
                select: {
                  code: true,
                  label: true,
                  unit: true,
                },
              },
            },
          },
        },
      });

      if (!fullGarment) {
        throw new Error("MEASUREMENT_PROFILE_GARMENT_NOT_FOUND");
      }

      return {
        profileId: fullGarment.profileId,
        garmentId: fullGarment.id,
        garmentType: fullGarment.garmentType,
        values: fullGarment.values.map((item) => ({
          id: item.id,
          fieldId: item.fieldId,
          fieldCode: item.field.code,
          fieldLabel: item.field.label,
          unit: item.field.unit,
          valueNumber: item.valueNumber,
          valueText: item.valueText,
        })),
      };
    });
  }
}
