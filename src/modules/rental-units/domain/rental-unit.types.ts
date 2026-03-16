import { Prisma, RentalPriceTier, RentalUnitStatus } from "@prisma/client";

export type PublicRentalUnit = {
  id: number;
  productId: number;
  variantId: number | null;
  internalCode: string;
  sizeLabel: string | null;
  color: string | null;
  currentTier: RentalPriceTier;
  normalPrice: Prisma.Decimal;
  premierePrice: Prisma.Decimal;
  status: RentalUnitStatus;
  notes: string | null;
  firstRentedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ListRentalUnitsFilters = {
  productId?: number;
  variantId?: number;
  status?: RentalUnitStatus;
  currentTier?: RentalPriceTier;
  search?: string;
};

export type CreateRentalUnitInput = {
  productId: number;
  variantId?: number;
  internalCode: string;
  sizeLabel?: string;
  color?: string;
  currentTier?: RentalPriceTier;
  normalPrice: number;
  premierePrice: number;
  status?: RentalUnitStatus;
  notes?: string;
};

export type UpdateRentalUnitInput = {
  variantId?: number | null;
  sizeLabel?: string | null;
  color?: string | null;
  normalPrice?: number;
  premierePrice?: number;
  status?: RentalUnitStatus;
  notes?: string | null;
};

export type RentalUnitActionInput = {
  action:
    | "MARK_AVAILABLE"
    | "MARK_MAINTENANCE"
    | "MARK_DAMAGED"
    | "MARK_RETIRED"
    | "MARK_NORMAL_TIER";
  note?: string;
};
