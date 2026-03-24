import { InventoryMovementType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CreateFabricInput,
  CreateFabricMovementInput,
  FabricMovementItem,
  PublicFabric,
  UpdateFabricInput,
} from "@/src/modules/fabrics/domain/fabric.types";

const publicFabricSelect = {
  id: true,
  code: true,
  nombre: true,
  color: true,
  supplier: true,
  composition: true,
  pattern: true,
  metersInStock: true,
  minMeters: true,
  costPerMeter: true,
  pricePerMeter: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FabricSelect;

export class FabricRepository {
  async list(): Promise<PublicFabric[]> {
    return prisma.fabric.findMany({
      orderBy: { createdAt: "desc" },
      select: publicFabricSelect,
    });
  }

  async findById(id: string): Promise<PublicFabric | null> {
    return prisma.fabric.findUnique({
      where: { id },
      select: publicFabricSelect,
    });
  }

  async create(input: CreateFabricInput): Promise<PublicFabric> {
    return prisma.fabric.create({
      data: {
        code: input.code,
        nombre: input.nombre,
        color: input.color,
        supplier: input.supplier,
        composition: input.composition,
        pattern: input.pattern,
        metersInStock:
          input.metersInStock !== undefined
            ? new Prisma.Decimal(input.metersInStock)
            : undefined,
        minMeters:
          input.minMeters !== undefined
            ? new Prisma.Decimal(input.minMeters)
            : undefined,
        costPerMeter:
          input.costPerMeter !== undefined
            ? new Prisma.Decimal(input.costPerMeter)
            : undefined,
        pricePerMeter:
          input.pricePerMeter !== undefined
            ? new Prisma.Decimal(input.pricePerMeter)
            : undefined,
        active: input.active,
      },
      select: publicFabricSelect,
    });
  }

  async updateById(id: string, input: UpdateFabricInput): Promise<PublicFabric> {
    return prisma.fabric.update({
      where: { id },
      data: {
        nombre: input.nombre,
        color: input.color,
        supplier: input.supplier,
        composition: input.composition,
        pattern: input.pattern,
        minMeters:
          input.minMeters !== undefined
            ? new Prisma.Decimal(input.minMeters)
            : undefined,
        costPerMeter:
          input.costPerMeter !== undefined && input.costPerMeter !== null
            ? new Prisma.Decimal(input.costPerMeter)
            : input.costPerMeter,
        pricePerMeter:
          input.pricePerMeter !== undefined && input.pricePerMeter !== null
            ? new Prisma.Decimal(input.pricePerMeter)
            : input.pricePerMeter,
        active: input.active,
      },
      select: publicFabricSelect,
    });
  }

  async deactivateById(id: string): Promise<PublicFabric> {
    return this.updateById(id, { active: false });
  }

  async listMovements(fabricId: string): Promise<FabricMovementItem[]> {
    return prisma.fabricMovement.findMany({
      where: { fabricId },
      orderBy: { happenedAt: "desc" },
      select: {
        id: true,
        fabricId: true,
        type: true,
        quantity: true,
        note: true,
        happenedAt: true,
      },
    });
  }

  async createMovement(
    fabricId: string,
    input: CreateFabricMovementInput,
    delta: Prisma.Decimal
  ): Promise<{ fabric: PublicFabric; movement: FabricMovementItem }> {
    return prisma.$transaction(async (tx) => {
      const updatedFabric = await tx.fabric.update({
        where: { id: fabricId },
        data: {
          metersInStock: {
            increment: delta,
          },
        },
        select: publicFabricSelect,
      });

      const movement = await tx.fabricMovement.create({
        data: {
          fabricId,
          type: input.type,
          quantity: new Prisma.Decimal(input.quantity),
          note: input.note,
        },
        select: {
          id: true,
          fabricId: true,
          type: true,
          quantity: true,
          note: true,
          happenedAt: true,
        },
      });

      return {
        fabric: updatedFabric,
        movement,
      };
    });
  }

  async exists(fabricId: string): Promise<boolean> {
    const fabric = await prisma.fabric.findUnique({
      where: { id: fabricId },
      select: { id: true },
    });

    return Boolean(fabric);
  }

  computeStockDelta(
    movementType: InventoryMovementType,
    quantity: number
  ): Prisma.Decimal {
    const positive = new Prisma.Decimal(quantity);

    if (
      movementType === InventoryMovementType.INGRESO ||
      movementType === InventoryMovementType.DEVOLUCION
    ) {
      return positive;
    }

    if (
      movementType === InventoryMovementType.VENTA ||
      movementType === InventoryMovementType.ALQUILER ||
      movementType === InventoryMovementType.MERMA ||
      movementType === InventoryMovementType.REPARACION
    ) {
      return positive.neg();
    }

    return positive;
  }
}
