import { MeasurementGarmentType } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type PublicMeasurementProfile = {
  id: number;
  customerId: number;
  takenAt: Date;
  validUntil: Date;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  garments: Array<{
    id: number;
    garmentType: MeasurementGarmentType;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    values: Array<{
      id: number;
      fieldId: number;
      valueNumber: Prisma.Decimal | null;
      valueText: string | null;
      field: {
        id: number;
        code: string;
        label: string;
        unit: string | null;
      };
    }>;
  }>;
};

export type MeasurementFieldListItem = {
  id: number;
  garmentType: MeasurementGarmentType;
  code: string;
  label: string;
  unit: string | null;
  sortOrder: number;
  active: boolean;
};

export type UpsertMeasurementValuesInput = {
  garmentType: MeasurementGarmentType;
  values: Array<{
    fieldId: number;
    valueNumber?: number;
    valueText?: string | null;
  }>;
};

export type CreateMeasurementProfileInput = {
  customerId: number;
  takenAt?: Date;
  notes?: string;
  garmentTypes?: MeasurementGarmentType[];
};

export type UpdateMeasurementProfileInput = {
  notes?: string | null;
  validUntil?: Date;
  isActive?: boolean;
};

export type MeasurementValuesByGarment = {
  profileId: number;
  garmentId: number;
  garmentType: MeasurementGarmentType;
  values: Array<{
    id: number;
    fieldId: number;
    fieldCode: string;
    fieldLabel: string;
    unit: string | null;
    valueNumber: Prisma.Decimal | null;
    valueText: string | null;
  }>;
};
