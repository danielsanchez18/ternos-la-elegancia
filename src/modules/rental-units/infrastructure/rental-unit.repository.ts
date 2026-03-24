import { Prisma, RentalPriceTier, RentalUnitStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CreateRentalUnitInput,
  ListRentalUnitsFilters,
  PublicRentalUnit,
  UpdateRentalUnitInput,
} from "@/src/modules/rental-units/domain/rental-unit.types";

const publicRentalUnitSelect = {
  id: true,
  productId: true,
  variantId: true,
  internalCode: true,
  sizeLabel: true,
  color: true,
  currentTier: true,
  normalPrice: true,
  premierePrice: true,
  status: true,
  notes: true,
  firstRentedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.RentalUnitSelect;

export class RentalUnitRepository {
  async list(filters: ListRentalUnitsFilters): Promise<PublicRentalUnit[]> {
    return prisma.rentalUnit.findMany({
      where: {
        productId: filters.productId,
        variantId: filters.variantId,
        status: filters.status,
        currentTier: filters.currentTier,
        ...(filters.search
          ? {
              OR: [
                { internalCode: { contains: filters.search, mode: "insensitive" } },
                { sizeLabel: { contains: filters.search, mode: "insensitive" } },
                { color: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      select: publicRentalUnitSelect,
    });
  }

  async findById(id: string): Promise<PublicRentalUnit | null> {
    return prisma.rentalUnit.findUnique({
      where: { id },
      select: publicRentalUnitSelect,
    });
  }

  async create(input: CreateRentalUnitInput): Promise<PublicRentalUnit> {
    return prisma.rentalUnit.create({
      data: {
        productId: input.productId,
        variantId: input.variantId,
        internalCode: input.internalCode,
        sizeLabel: input.sizeLabel,
        color: input.color,
        currentTier: input.currentTier,
        normalPrice: new Prisma.Decimal(input.normalPrice),
        premierePrice: new Prisma.Decimal(input.premierePrice),
        status: input.status,
        notes: input.notes,
      },
      select: publicRentalUnitSelect,
    });
  }

  async updateById(id: string, input: UpdateRentalUnitInput): Promise<PublicRentalUnit> {
    return prisma.rentalUnit.update({
      where: { id },
      data: {
        variantId: input.variantId,
        sizeLabel: input.sizeLabel,
        color: input.color,
        normalPrice:
          input.normalPrice !== undefined
            ? new Prisma.Decimal(input.normalPrice)
            : undefined,
        premierePrice:
          input.premierePrice !== undefined
            ? new Prisma.Decimal(input.premierePrice)
            : undefined,
        status: input.status,
        notes: input.notes,
      },
      select: publicRentalUnitSelect,
    });
  }

  async updateStatusAndTier(input: {
    id: string;
    status?: RentalUnitStatus;
    currentTier?: RentalPriceTier;
    note?: string;
  }): Promise<PublicRentalUnit> {
    return prisma.rentalUnit.update({
      where: { id: input.id },
      data: {
        status: input.status,
        currentTier: input.currentTier,
        notes: input.note,
      },
      select: publicRentalUnitSelect,
    });
  }

  async getProductById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
  }

  async getVariantById(variantId: string) {
    return prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, productId: true },
    });
  }
}
