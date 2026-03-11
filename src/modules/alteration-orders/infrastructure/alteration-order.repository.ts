import { AlterationOrderStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  AlterationOrderListResult,
  CreateAlterationOrderInput,
  ListAlterationOrdersFilters,
  PublicAlterationOrder,
} from "@/src/modules/alteration-orders/domain/alteration-order.types";

const publicAlterationOrderSelect = {
  id: true,
  customerId: true,
  code: true,
  status: true,
  serviceId: true,
  garmentDescription: true,
  workDescription: true,
  initialCondition: true,
  receivedAt: true,
  promisedAt: true,
  deliveredAt: true,
  subtotal: true,
  discountTotal: true,
  total: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  service: {
    select: {
      id: true,
      nombre: true,
      precioBase: true,
      activo: true,
    },
  },
} satisfies Prisma.AlterationOrderSelect;

export class AlterationOrderRepository {
  async list(filters: ListAlterationOrdersFilters): Promise<AlterationOrderListResult> {
    const where: Prisma.AlterationOrderWhereInput = {
      customerId: filters.customerId,
      serviceId: filters.serviceId,
      status: filters.status,
      code: filters.code
        ? {
            contains: filters.code,
            mode: "insensitive",
          }
        : undefined,
      receivedAt:
        filters.receivedFrom || filters.receivedTo
          ? {
              gte: filters.receivedFrom,
              lte: filters.receivedTo,
            }
          : undefined,
      promisedAt:
        filters.promisedFrom || filters.promisedTo
          ? {
              gte: filters.promisedFrom,
              lte: filters.promisedTo,
            }
          : undefined,
    };

    const skip = (filters.page - 1) * filters.pageSize;

    const [items, total] = await prisma.$transaction([
      prisma.alterationOrder.findMany({
        where,
        orderBy: {
          [filters.orderBy]: filters.order,
        },
        skip,
        take: filters.pageSize,
        select: publicAlterationOrderSelect,
      }),
      prisma.alterationOrder.count({ where }),
    ]);

    return {
      items,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async findById(id: number): Promise<PublicAlterationOrder | null> {
    return prisma.alterationOrder.findUnique({
      where: { id },
      select: publicAlterationOrderSelect,
    });
  }

  async customerExists(customerId: number): Promise<boolean> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    return Boolean(customer);
  }

  async getAlterationServiceById(serviceId: number) {
    return prisma.alterationService.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        nombre: true,
        precioBase: true,
        activo: true,
      },
    });
  }

  async nextCodeForDate(date: Date): Promise<string> {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const prefix = `ALT-${y}${m}${d}-`;

    const existing = await prisma.alterationOrder.findMany({
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

  async createWithHistory(input: {
    code: string;
    status: AlterationOrderStatus;
    payload: Omit<CreateAlterationOrderInput, "subtotal" | "discountTotal"> & {
      receivedAt: Date;
      subtotal: Prisma.Decimal;
      discountTotal: Prisma.Decimal;
      total: Prisma.Decimal;
    };
  }): Promise<PublicAlterationOrder> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.alterationOrder.create({
        data: {
          customerId: input.payload.customerId,
          code: input.code,
          status: input.status,
          serviceId: input.payload.serviceId,
          garmentDescription: input.payload.garmentDescription,
          workDescription: input.payload.workDescription,
          initialCondition: input.payload.initialCondition,
          receivedAt: input.payload.receivedAt,
          promisedAt: input.payload.promisedAt,
          subtotal: input.payload.subtotal,
          discountTotal: input.payload.discountTotal,
          total: input.payload.total,
          notes: input.payload.notes,
        },
        select: { id: true },
      });

      await tx.alterationOrderStatusHistory.create({
        data: {
          alterationOrderId: order.id,
          status: input.status,
          note: "Orden de arreglo creada",
        },
      });

      return tx.alterationOrder.findUniqueOrThrow({
        where: { id: order.id },
        select: publicAlterationOrderSelect,
      });
    });
  }

  async updateStatus(input: {
    id: number;
    status: AlterationOrderStatus;
    note?: string;
    deliveredAt?: Date | null;
  }): Promise<PublicAlterationOrder> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.alterationOrder.update({
        where: { id: input.id },
        data: {
          status: input.status,
          deliveredAt: input.deliveredAt,
        },
        select: publicAlterationOrderSelect,
      });

      await tx.alterationOrderStatusHistory.create({
        data: {
          alterationOrderId: input.id,
          status: input.status,
          note: input.note,
        },
      });

      return updated;
    });
  }

  async getAlterationOrderApprovedPaymentsTotal(
    alterationOrderId: number
  ): Promise<Prisma.Decimal> {
    const aggregate = await prisma.payment.aggregate({
      where: {
        alterationOrderId,
        status: "APROBADO",
      },
      _sum: {
        amount: true,
      },
    });

    return aggregate._sum.amount ?? new Prisma.Decimal(0);
  }
}
