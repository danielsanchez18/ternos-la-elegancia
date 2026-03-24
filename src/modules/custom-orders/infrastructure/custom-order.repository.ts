import {
  CustomOrderStatus,
  FabricPriceMode,
  InputFieldType,
  MeasurementGarmentType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CustomOrderListResult,
  CreateCustomOrderInput,
  ListCustomOrdersFilters,
  PublicCustomOrder,
} from "@/src/modules/custom-orders/domain/custom-order.types";

const publicCustomOrderSelect = {
  id: true,
  customerId: true,
  code: true,
  status: true,
  requiresMeasurement: true,
  measurementRequiredUntil: true,
  firstPurchaseFlow: true,
  subtotal: true,
  discountTotal: true,
  total: true,
  requestedDeliveryAt: true,
  promisedDeliveryAt: true,
  deliveredAt: true,
  notes: true,
  internalNotes: true,
  createdAt: true,
  updatedAt: true,
  items: {
    orderBy: { id: "asc" },
    select: {
      id: true,
      productId: true,
      itemNameSnapshot: true,
      quantity: true,
      unitPrice: true,
      discountAmount: true,
      subtotal: true,
      notes: true,
      parts: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          productId: true,
          garmentType: true,
          label: true,
          workMode: true,
          measurementProfileId: true,
          measurementProfileGarmentId: true,
          fabricId: true,
          fabricNameSnapshot: true,
          fabricCodeSnapshot: true,
          fabricColorSnapshot: true,
          unitPrice: true,
          notes: true,
          selections: {
            orderBy: { id: "asc" },
            select: {
              id: true,
              definitionId: true,
              optionId: true,
              definitionCodeSnapshot: true,
              definitionLabelSnapshot: true,
              inputTypeSnapshot: true,
              optionCodeSnapshot: true,
              optionLabelSnapshot: true,
              extraPriceSnapshot: true,
              valueText: true,
              valueNumber: true,
              valueBoolean: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CustomOrderSelect;

export type PreparedCustomOrderSelection = {
  definitionId: string;
  optionId?: string;
  definitionCodeSnapshot: string;
  definitionLabelSnapshot: string;
  inputTypeSnapshot: InputFieldType;
  optionCodeSnapshot?: string;
  optionLabelSnapshot?: string;
  extraPriceSnapshot?: Prisma.Decimal;
  valueText?: string;
  valueNumber?: Prisma.Decimal;
  valueBoolean?: boolean;
};

export type PreparedCustomOrderPart = {
  productId?: string;
  garmentType: MeasurementGarmentType;
  label: string;
  workMode: FabricPriceMode;
  measurementProfileId?: string;
  measurementProfileGarmentId?: string;
  fabricId?: string;
  fabricNameSnapshot?: string;
  fabricCodeSnapshot?: string;
  fabricColorSnapshot?: string;
  unitPrice?: Prisma.Decimal;
  notes?: string;
  selections: PreparedCustomOrderSelection[];
};

export type PreparedCustomOrderItem = {
  productId?: string;
  itemNameSnapshot: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  notes?: string;
  parts: PreparedCustomOrderPart[];
};

export class CustomOrderRepository {
  async list(filters: ListCustomOrdersFilters): Promise<CustomOrderListResult> {
    const where: Prisma.CustomOrderWhereInput = {
      customerId: filters.customerId,
      status: filters.status,
      requiresMeasurement: filters.requiresMeasurement,
      firstPurchaseFlow: filters.firstPurchaseFlow,
      code: filters.code
        ? {
            contains: filters.code,
            mode: "insensitive",
          }
        : undefined,
      createdAt:
        filters.createdFrom || filters.createdTo
          ? {
              gte: filters.createdFrom,
              lte: filters.createdTo,
            }
          : undefined,
      promisedDeliveryAt:
        filters.promisedFrom || filters.promisedTo
          ? {
              gte: filters.promisedFrom,
              lte: filters.promisedTo,
            }
          : undefined,
    };

    const skip = (filters.page - 1) * filters.pageSize;

    const [items, total] = await prisma.$transaction([
      prisma.customOrder.findMany({
        where,
        orderBy: {
          [filters.orderBy]: filters.order,
        },
        skip,
        take: filters.pageSize,
        select: publicCustomOrderSelect,
      }),
      prisma.customOrder.count({ where }),
    ]);

    return {
      items,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      pageCount: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }

  async findById(id: string): Promise<PublicCustomOrder | null> {
    return prisma.customOrder.findUnique({
      where: { id },
      select: publicCustomOrderSelect,
    });
  }

  async customerExists(customerId: string): Promise<boolean> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    return Boolean(customer);
  }

  async getActiveValidMeasurementProfileGarmentForCustomer(input: {
    customerId: string;
    garmentType: MeasurementGarmentType;
    now: Date;
  }) {
    return prisma.measurementProfileGarment.findFirst({
      where: {
        garmentType: input.garmentType,
        profile: {
          customerId: input.customerId,
          isActive: true,
          validUntil: {
            gte: input.now,
          },
        },
      },
      select: {
        id: true,
        profileId: true,
      },
      orderBy: {
        profile: {
          validUntil: "desc",
        },
      },
    });
  }

  async getMeasurementProfileForCustomer(profileId: string, customerId: string) {
    return prisma.measurementProfile.findFirst({
      where: {
        id: profileId,
        customerId,
        isActive: true,
      },
      select: {
        id: true,
        validUntil: true,
      },
    });
  }

  async getMeasurementProfileGarment(profileGarmentId: string) {
    return prisma.measurementProfileGarment.findUnique({
      where: { id: profileGarmentId },
      select: {
        id: true,
        profileId: true,
        garmentType: true,
      },
    });
  }

  async getFabricById(fabricId: string) {
    return prisma.fabric.findUnique({
      where: { id: fabricId },
      select: {
        id: true,
        code: true,
        nombre: true,
        color: true,
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

  async getCustomizationDefinition(definitionId: string) {
    return prisma.customizationDefinition.findUnique({
      where: { id: definitionId },
      select: {
        id: true,
        code: true,
        label: true,
        inputType: true,
      },
    });
  }

  async getCustomizationOption(optionId: string) {
    return prisma.customizationOption.findUnique({
      where: { id: optionId },
      select: {
        id: true,
        definitionId: true,
        code: true,
        label: true,
        extraPrice: true,
      },
    });
  }

  async nextCodeForDate(date: Date): Promise<string> {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const prefix = `CUS-${y}${m}${d}-`;

    const existing = await prisma.customOrder.findMany({
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
    status: CustomOrderStatus;
    requiresMeasurement: boolean;
    measurementRequiredUntil: Date | null;
    payload: CreateCustomOrderInput;
    preparedItems: PreparedCustomOrderItem[];
  }): Promise<PublicCustomOrder> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.customOrder.create({
        data: {
          customerId: input.payload.customerId,
          code: input.code,
          status: input.status,
          requiresMeasurement: input.requiresMeasurement,
          measurementRequiredUntil: input.measurementRequiredUntil,
          firstPurchaseFlow: input.payload.firstPurchaseFlow ?? false,
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
          requestedDeliveryAt: input.payload.requestedDeliveryAt,
          promisedDeliveryAt: input.payload.promisedDeliveryAt,
          notes: input.payload.notes,
          internalNotes: input.payload.internalNotes,
          items: {
            create: input.preparedItems.map((item) => ({
              productId: item.productId,
              itemNameSnapshot: item.itemNameSnapshot,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmount: item.discountAmount,
              subtotal: item.subtotal,
              notes: item.notes,
              parts: {
                create: item.parts.map((part) => ({
                  productId: part.productId,
                  garmentType: part.garmentType,
                  label: part.label,
                  workMode: part.workMode,
                  measurementProfileId: part.measurementProfileId,
                  measurementProfileGarmentId: part.measurementProfileGarmentId,
                  fabricId: part.fabricId,
                  fabricNameSnapshot: part.fabricNameSnapshot,
                  fabricCodeSnapshot: part.fabricCodeSnapshot,
                  fabricColorSnapshot: part.fabricColorSnapshot,
                  unitPrice: part.unitPrice,
                  notes: part.notes,
                  selections: {
                    create: part.selections.map((selection) => ({
                      definitionId: selection.definitionId,
                      optionId: selection.optionId,
                      definitionCodeSnapshot: selection.definitionCodeSnapshot,
                      definitionLabelSnapshot: selection.definitionLabelSnapshot,
                      inputTypeSnapshot: selection.inputTypeSnapshot,
                      optionCodeSnapshot: selection.optionCodeSnapshot,
                      optionLabelSnapshot: selection.optionLabelSnapshot,
                      extraPriceSnapshot: selection.extraPriceSnapshot,
                      valueText: selection.valueText,
                      valueNumber: selection.valueNumber,
                      valueBoolean: selection.valueBoolean,
                    })),
                  },
                })),
              },
            })),
          },
        },
        select: {
          id: true,
        },
      });

      await tx.customOrderStatusHistory.create({
        data: {
          customOrderId: order.id,
          status: input.status,
          note: "Orden de confeccion creada",
        },
      });

      return tx.customOrder.findUniqueOrThrow({
        where: { id: order.id },
        select: publicCustomOrderSelect,
      });
    });
  }

  async update(input: {
    id: string;
    notes?: string | null;
    internalNotes?: string | null;
    requestedDeliveryAt?: Date | null;
    promisedDeliveryAt?: Date | null;
    subtotal: Prisma.Decimal;
    discountTotal: Prisma.Decimal;
    total: Prisma.Decimal;
    preparedItems: PreparedCustomOrderItem[];
  }): Promise<PublicCustomOrder> {
    return prisma.$transaction(async (tx) => {
      await tx.customOrderItem.deleteMany({
        where: { customOrderId: input.id },
      });

      const updatedOrder = await tx.customOrder.update({
        where: { id: input.id },
        data: {
          notes: input.notes,
          internalNotes: input.internalNotes,
          requestedDeliveryAt: input.requestedDeliveryAt,
          promisedDeliveryAt: input.promisedDeliveryAt,
          subtotal: input.subtotal,
          discountTotal: input.discountTotal,
          total: input.total,
          items: {
            create: input.preparedItems.map((item) => ({
              productId: item.productId,
              itemNameSnapshot: item.itemNameSnapshot,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmount: item.discountAmount,
              subtotal: item.subtotal,
              notes: item.notes,
              parts: {
                create: item.parts.map((part) => ({
                  productId: part.productId,
                  garmentType: part.garmentType,
                  label: part.label,
                  workMode: part.workMode,
                  measurementProfileId: part.measurementProfileId,
                  measurementProfileGarmentId: part.measurementProfileGarmentId,
                  fabricId: part.fabricId,
                  fabricNameSnapshot: part.fabricNameSnapshot,
                  fabricCodeSnapshot: part.fabricCodeSnapshot,
                  fabricColorSnapshot: part.fabricColorSnapshot,
                  unitPrice: part.unitPrice,
                  notes: part.notes,
                  selections: {
                    create: part.selections.map((selection) => ({
                      definitionId: selection.definitionId,
                      optionId: selection.optionId,
                      definitionCodeSnapshot: selection.definitionCodeSnapshot,
                      definitionLabelSnapshot: selection.definitionLabelSnapshot,
                      inputTypeSnapshot: selection.inputTypeSnapshot,
                      optionCodeSnapshot: selection.optionCodeSnapshot,
                      optionLabelSnapshot: selection.optionLabelSnapshot,
                      extraPriceSnapshot: selection.extraPriceSnapshot,
                      valueText: selection.valueText,
                      valueNumber: selection.valueNumber,
                      valueBoolean: selection.valueBoolean,
                    })),
                  },
                })),
              },
            })),
          },
        },
        select: publicCustomOrderSelect,
      });

      await tx.customOrderStatusHistory.create({
        data: {
          customOrderId: input.id,
          status: updatedOrder.status,
          note: "Orden de confeccion actualizada",
        },
      });

      return updatedOrder;
    });
  }

  async updateStatus(input: {
    id: string;
    status: CustomOrderStatus;
    note?: string;
    deliveredAt?: Date | null;
    requiresMeasurement?: boolean;
  }): Promise<PublicCustomOrder> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.customOrder.update({
        where: { id: input.id },
        data: {
          status: input.status,
          deliveredAt: input.deliveredAt,
          requiresMeasurement: input.requiresMeasurement,
        },
        select: publicCustomOrderSelect,
      });

      await tx.customOrderStatusHistory.create({
        data: {
          customOrderId: input.id,
          status: input.status,
          note: input.note,
        },
      });

      return updated;
    });
  }

  async getApprovedPaymentsTotal(customOrderId: string): Promise<Prisma.Decimal> {
    const aggregated = await prisma.payment.aggregate({
      where: {
        customOrderId,
        status: "APROBADO",
      },
      _sum: {
        amount: true,
      },
    });

    return aggregated._sum?.amount ?? new Prisma.Decimal(0);
  }

  async linkMeasurementToPart(input: {
    orderId: string;
    partId: string;
    profileId: string;
    profileGarmentId: string;
  }): Promise<PublicCustomOrder> {
    const updatedRows = await prisma.customOrderItemPart.updateMany({
      where: {
        id: input.partId,
        customOrderItem: {
          customOrderId: input.orderId,
        },
      },
      data: {
        measurementProfileId: input.profileId,
        measurementProfileGarmentId: input.profileGarmentId,
      },
    });

    if (updatedRows.count === 0) {
      throw new Error("Part not found for order");
    }

    const updated = await this.findById(input.orderId);
    if (!updated) {
      throw new Error("Order not found after update");
    }
    return updated;
  }
}
