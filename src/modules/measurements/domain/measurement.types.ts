import { MeasurementGarmentType } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type PublicMeasurementProfile = {
  id: string;
  customerId: string;
  takenAt: Date;
  validUntil: Date;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  garments: Array<{
    id: string;
    garmentType: MeasurementGarmentType;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    values: Array<{
      id: string;
      fieldId: string;
      valueNumber: Prisma.Decimal | null;
      valueText: string | null;
      field: {
        id: string;
        code: string;
        label: string;
        unit: string | null;
      };
    }>;
  }>;
};

export type MeasurementFieldListItem = {
  id: string;
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
    fieldId: string;
    valueNumber?: number;
    valueText?: string | null;
  }>;
};

export type CreateMeasurementProfileInput = {
  customerId: string;
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
  profileId: string;
  garmentId: string;
  garmentType: MeasurementGarmentType;
  values: Array<{
    id: string;
    fieldId: string;
    fieldCode: string;
    fieldLabel: string;
    unit: string | null;
    valueNumber: Prisma.Decimal | null;
    valueText: string | null;
  }>;
};
