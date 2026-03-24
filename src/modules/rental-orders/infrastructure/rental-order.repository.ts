import {
  InventoryMovementType,
  Prisma,
  RentalOrderStatus,
  RentalUnitStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CreateRentalOrderInput,
  ListRentalOrdersFilters,
  PublicRentalOrder,
  RentalOrderListResult,
} from "@/src/modules/rental-orders/domain/rental-order.types";

const publicRentalOrderSelect = {
  id: true,
  customerId: true,
  code: true,
  status: true,
  subtotal: true,
  discountTotal: true,
  total: true,
  pickupAt: true,
  dueBackAt: true,
  returnedAt: true,
  hasDelay: true,
  hasDamage: true,
  returnNotes: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  items: {
    orderBy: { id: "asc" },
    select: {
      id: true,
      rentalOrderId: true,
      productId: true,
      rentalUnitId: true,
      itemNameSnapshot: true,
      tierAtRental: true,
      unitPrice: true,
      returnedAt: true,
      returnCondition: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.RentalOrderSelect;

export class RentalOrderRepository {
  async list(filters: ListRentalOrdersFilters): Promise<RentalOrderListResult> {
    const where: Prisma.RentalOrderWhereInput = {
      customerId: filters.customerId,
      status: filters.status,
      hasDelay: filters.hasDelay,
      hasDamage: filters.hasDamage,
      code: filters.code
        ? {
            contains: filters.code,
            mode: "insensitive",
          }
        : undefined,
      pickupAt:
        filters.pickupFrom || filters.pickupTo
          ? {
              gte: filters.pickupFrom,
              lte: filters.pickupTo,
            }
          : undefined,
      dueBackAt:
        filters.dueFrom || filters.dueTo
          ? {
              gte: filters.dueFrom,
              lte: filters.dueTo,
            }
          : undefined,
    };

    const skip = (filters.page - 1) * filters.pageSize;

    const [items, total] = await prisma.$transaction([
      prisma.rentalOrder.findMany({
        where,
        orderBy: {
          [filters.orderBy]: filters.order,
        },
        skip,
        take: filters.pageSize,
        select: publicRentalOrderSelect,
      }),
      prisma.rentalOrder.count({ where }),
    ]);

    return {
      items,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async findById(id: string): Promise<PublicRentalOrder | null> {
    return prisma.rentalOrder.findUnique({
      where: { id },
      select: publicRentalOrderSelect,
    });
  }

  async customerExists(customerId: string): Promise<boolean> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    return Boolean(customer);
  }

  async getRentalUnitById(rentalUnitId: string) {
    return prisma.rentalUnit.findUnique({
      where: { id: rentalUnitId },
      select: {
        id: true,
        productId: true,
        internalCode: true,
        currentTier: true,
        normalPrice: true,
        premierePrice: true,
        status: true,
        firstRentedAt: true,
      },
    });
  }

  async getProductById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        nombre: true,
      },
    });
  }

  async nextCodeForDate(date: Date): Promise<string> {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const prefix = `REN-${y}${m}${d}-`;

    const existing = await prisma.rentalOrder.findMany({
      where: {
        code: {
          startsWith: prefix,
        },
      },
      select: { code: true },
      orderBy: { code: "desc" },
    });

    const maxCounter = existing.reduce((max, item) => {
      const lastPart = item.code.split("-").pop();
      const counter = lastPart ? Number(lastPart) : 0;
      return Number.isFinite(counter) && counter > max ? counter : max;
    }, 0);

    return `${prefix}${maxCounter + 1}`;
  }

  async createWithInitialDelivery(input: {
    code: string;
    payload: CreateRentalOrderInput & { pickupAt: Date };
    preparedItems: Array<{
      rentalUnitId: string;
      productId?: string;
      itemNameSnapshot: string;
      tierAtRental: "ESTRENO" | "NORMAL";
      unitPrice: Prisma.Decimal;
      notes?: string;
    }>;
  }): Promise<PublicRentalOrder> {
    return prisma.$transaction(async (tx) => {
      const rentalOrder = await tx.rentalOrder.create({
        data: {
          customerId: input.payload.customerId,
          code: input.code,
          status: RentalOrderStatus.ENTREGADO,
          subtotal: input.preparedItems.reduce(
            (acc, item) => acc.add(item.unitPrice),
            new Prisma.Decimal(0)
          ),
          discountTotal: new Prisma.Decimal(0),
          total: input.preparedItems.reduce(
            (acc, item) => acc.add(item.unitPrice),
            new Prisma.Decimal(0)
          ),
          pickupAt: input.payload.pickupAt,
          dueBackAt: input.payload.dueBackAt,
          notes: input.payload.notes,
          items: {
            create: input.preparedItems.map((item) => ({
              rentalUnitId: item.rentalUnitId,
              productId: item.productId,
              itemNameSnapshot: item.itemNameSnapshot,
              tierAtRental: item.tierAtRental,
              unitPrice: item.unitPrice,
              notes: item.notes,
            })),
          },
        },
        select: { id: true },
      });

      for (const item of input.preparedItems) {
        await tx.rentalUnit.update({
          where: { id: item.rentalUnitId },
          data: {
            status: RentalUnitStatus.ALQUILADO,
            firstRentedAt: new Date(),
          },
        });

        await tx.rentalUnitMovement.create({
          data: {
            rentalUnitId: item.rentalUnitId,
            type: InventoryMovementType.ALQUILER,
            note: `Salida por orden ${input.code}`,
          },
        });
      }

      await tx.rentalOrderStatusHistory.create({
        data: {
          rentalOrderId: rentalOrder.id,
          status: RentalOrderStatus.ENTREGADO,
          note: "Orden de alquiler creada y entregada",
        },
      });

      return tx.rentalOrder.findUniqueOrThrow({
        where: { id: rentalOrder.id },
        select: publicRentalOrderSelect,
      });
    });
  }

  async markReturned(input: {
    rentalOrderId: string;
    returnedAt: Date;
    hasDamage?: boolean;
    returnNotes?: string;
    note?: string;
  }): Promise<PublicRentalOrder> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.rentalOrder.update({
        where: { id: input.rentalOrderId },
        data: {
          status: RentalOrderStatus.DEVUELTO,
          returnedAt: input.returnedAt,
          hasDamage: input.hasDamage,
          hasDelay: input.returnedAt > (await tx.rentalOrder.findUniqueOrThrow({ where: { id: input.rentalOrderId }, select: { dueBackAt: true } })).dueBackAt,
          returnNotes: input.returnNotes,
          items: {
            updateMany: {
              where: {},
              data: {
                returnedAt: input.returnedAt,
                returnCondition: input.hasDamage ? "DANADO" : "OK",
              },
            },
          },
        },
        select: publicRentalOrderSelect,
      });

      for (const item of order.items) {
        const unit = await tx.rentalUnit.findUniqueOrThrow({
          where: { id: item.rentalUnitId },
          select: { id: true, currentTier: true },
        });

        await tx.rentalUnit.update({
          where: { id: unit.id },
          data: {
            status: RentalUnitStatus.DISPONIBLE,
            currentTier:
              item.tierAtRental === "ESTRENO" ? "NORMAL" : unit.currentTier,
          },
        });

        await tx.rentalUnitMovement.create({
          data: {
            rentalUnitId: unit.id,
            type: InventoryMovementType.DEVOLUCION,
            note: `Devolucion por orden ${order.code}`,
          },
        });
      }

      await tx.rentalOrderStatusHistory.create({
        data: {
          rentalOrderId: input.rentalOrderId,
          status: RentalOrderStatus.DEVUELTO,
          note: input.note,
        },
      });

      return order;
    });
  }

  async updateStatus(input: {
    rentalOrderId: string;
    status: RentalOrderStatus;
    note?: string;
  }): Promise<PublicRentalOrder> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.rentalOrder.update({
        where: { id: input.rentalOrderId },
        data: {
          status: input.status,
        },
        select: publicRentalOrderSelect,
      });

      await tx.rentalOrderStatusHistory.create({
        data: {
          rentalOrderId: input.rentalOrderId,
          status: input.status,
          note: input.note,
        },
      });

      return updated;
    });
  }

  async getRentalOrderApprovedPaymentsTotal(rentalOrderId: string): Promise<Prisma.Decimal> {
    const aggregate = await prisma.payment.aggregate({
      where: {
        rentalOrderId,
        status: "APROBADO",
      },
      _sum: {
        amount: true,
      },
    });

    return aggregate._sum?.amount ?? new Prisma.Decimal(0);
  }
}
