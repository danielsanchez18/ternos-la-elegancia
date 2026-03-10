import { InventoryMovementType, Prisma } from "@prisma/client";

export type PublicFabric = {
  id: number;
  code: string;
  nombre: string;
  color: string | null;
  supplier: string | null;
  composition: string | null;
  pattern: string | null;
  metersInStock: Prisma.Decimal;
  minMeters: Prisma.Decimal;
  costPerMeter: Prisma.Decimal | null;
  pricePerMeter: Prisma.Decimal | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FabricMovementItem = {
  id: number;
  fabricId: number;
  type: InventoryMovementType;
  quantity: Prisma.Decimal;
  note: string | null;
  happenedAt: Date;
};

export type CreateFabricInput = {
  code: string;
  nombre: string;
  color?: string;
  supplier?: string;
  composition?: string;
  pattern?: string;
  metersInStock?: number;
  minMeters?: number;
  costPerMeter?: number;
  pricePerMeter?: number;
  active?: boolean;
};

export type UpdateFabricInput = {
  nombre?: string;
  color?: string | null;
  supplier?: string | null;
  composition?: string | null;
  pattern?: string | null;
  minMeters?: number;
  costPerMeter?: number | null;
  pricePerMeter?: number | null;
  active?: boolean;
};

export type CreateFabricMovementInput = {
  type: InventoryMovementType;
  quantity: number;
  note?: string;
};
