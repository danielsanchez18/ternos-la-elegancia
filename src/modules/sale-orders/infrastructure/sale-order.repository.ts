import { Prisma, SaleOrderStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CreateSaleOrderInput,
  ListSaleOrdersFilters,
  PublicSaleOrder,
  SaleOrderListResult,
} from "@/src/modules/sale-orders/domain/sale-order.types";

const publicSaleOrderSelect = {
  id: true,
  customerId: true,
  code: true,
  status: true,
  subtotal: true,
  discountTotal: true,
  total: true,
  notes: true,
  requestedAt: true,
  preparedAt: true,
  readyAt: true,
  deliveredAt: true,
  createdAt: true,
  updatedAt: true,
  items: {
    orderBy: { id: "asc" },
    select: {
      id: true,
      saleOrderId: true,
      productId: true,
      bundleId: true,
      itemNameSnapshot: true,
      quantity: true,
      unitPrice: true,
      discountAmount: true,
      subtotal: true,
      notes: true,
      components: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          saleOrderItemId: true,
          productId: true,
          variantId: true,
          quantity: true,
        },
      },
    },
  },
} satisfies Prisma.SaleOrderSelect;

export class SaleOrderRepository {
  async list(filters: ListSaleOrdersFilters): Promise<SaleOrderListResult> {
    const where: Prisma.SaleOrderWhereInput = {
      customerId: filters.customerId,
      status: filters.status,
      code: filters.code
        ? {
            contains: filters.code,
            mode: "insensitive",
          }
        : undefined,
      requestedAt:
        filters.requestedFrom || filters.requestedTo
          ? {
              gte: filters.requestedFrom,
              lte: filters.requestedTo,
            }
          : undefined,
    };

    const skip = (filters.page - 1) * filters.pageSize;

    const [items, total] = await prisma.$transaction([
      prisma.saleOrder.findMany({
        where,
        orderBy: {
          [filters.orderBy]: filters.order,
        },
        skip,
        take: filters.pageSize,
        select: publicSaleOrderSelect,
      }),
      prisma.saleOrder.count({ where }),
    ]);

    return {
      items,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async findById(id: number): Promise<PublicSaleOrder | null> {
    return prisma.saleOrder.findUnique({
      where: { id },
      select: publicSaleOrderSelect,
    });
  }

  async customerExists(customerId: number): Promise<boolean> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    return Boolean(customer);
  }

  async getProductById(productId: number) {
    return prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        nombre: true,
      },
    });
  }

  async getBundleById(bundleId: number) {
    return prisma.bundle.findUnique({
      where: { id: bundleId },
      select: {
        id: true,
        nombre: true,
      },
    });
  }

  async getSaleOrderApprovedPaymentsTotal(saleOrderId: number): Promise<Prisma.Decimal> {
    const aggregate = await prisma.payment.aggregate({
      where: {
        saleOrderId,
        status: "APROBADO",
      },
      _sum: {
        amount: true,
      },
    });

    return aggregate._sum.amount ?? new Prisma.Decimal(0);
  }

  async nextCodeForDate(date: Date): Promise<string> {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const prefix = `SAL-${y}${m}${d}-`;

    const existing = await prisma.saleOrder.findMany({
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
    status: SaleOrderStatus;
    payload: CreateSaleOrderInput;
    preparedItems: Array<{
      productId?: number;
      bundleId?: number;
      itemNameSnapshot: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      discountAmount: Prisma.Decimal;
      subtotal: Prisma.Decimal;
      notes?: string;
      components: Array<{
        productId?: number;
        variantId?: number;
        quantity: number;
      }>;
    }>;
  }): Promise<PublicSaleOrder> {
    return prisma.$transaction(async (tx) => {
      const saleOrder = await tx.saleOrder.create({
        data: {
          customerId: input.payload.customerId,
          code: input.code,
          status: input.status,
          subtotal: input.preparedItems.reduce(
            (acc, item) => acc.add(item.unitPrice.mul(item.quantity)),
            new Prisma.Decimal(0)
          ),
          discountTotal: input.preparedItems.reduce(
            (acc, item) => acc.add(item.discountAmount),
            new Prisma.Decimal(0)
          ),
          total: input.preparedItems.reduce(
            (acc, item) => acc.add(item.subtotal),
            new Prisma.Decimal(0)
          ),
          notes: input.payload.notes,
          requestedAt: input.payload.requestedAt,
          items: {
            create: input.preparedItems.map((item) => ({
              productId: item.productId,
              bundleId: item.bundleId,
              itemNameSnapshot: item.itemNameSnapshot,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmount: item.discountAmount,
              subtotal: item.subtotal,
              notes: item.notes,
              components: {
                create: item.components.map((component) => ({
                  productId: component.productId,
                  variantId: component.variantId,
                  quantity: component.quantity,
                })),
              },
            })),
          },
        },
        select: { id: true },
      });

      await tx.saleOrderStatusHistory.create({
        data: {
          saleOrderId: saleOrder.id,
          status: input.status,
          note: "Orden de venta creada",
        },
      });

      return tx.saleOrder.findUniqueOrThrow({
        where: { id: saleOrder.id },
        select: publicSaleOrderSelect,
      });
    });
  }

  async updateStatus(input: {
    id: number;
    status: SaleOrderStatus;
    note?: string;
    preparedAt?: Date | null;
    readyAt?: Date | null;
    deliveredAt?: Date | null;
  }): Promise<PublicSaleOrder> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.saleOrder.update({
        where: { id: input.id },
        data: {
          status: input.status,
          preparedAt: input.preparedAt,
          readyAt: input.readyAt,
          deliveredAt: input.deliveredAt,
        },
        select: publicSaleOrderSelect,
      });

      await tx.saleOrderStatusHistory.create({
        data: {
          saleOrderId: input.id,
          status: input.status,
          note: input.note,
        },
      });

      return updated;
    });
  }
}
