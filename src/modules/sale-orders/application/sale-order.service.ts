import { Prisma, SaleOrderStatus } from "@prisma/client";

import {
  CreateSaleOrderInput,
  ListSaleOrdersFilters,
  PublicSaleOrder,
  SaleOrderActionInput,
  SaleOrderListResult,
} from "@/src/modules/sale-orders/domain/sale-order.types";
import {
  SaleOrderCustomerNotFoundError,
  SaleOrderItemReferenceError,
  SaleOrderMeasurementReservationRequiredError,
  SaleOrderNotFoundError,
  SaleOrderPaymentRequiredError,
  SaleOrderStatusTransitionError,
} from "@/src/modules/sale-orders/domain/sale-order.errors";
import { SaleOrderRepository } from "@/src/modules/sale-orders/infrastructure/sale-order.repository";

function canTransitionStatus(
  current: SaleOrderStatus,
  action: SaleOrderActionInput["action"]
): boolean {
  const map: Record<SaleOrderActionInput["action"], SaleOrderStatus[]> = {
    MARK_PAID: [SaleOrderStatus.PENDIENTE_PAGO],
    START_PREPARATION: [SaleOrderStatus.PAGADO],
    MARK_READY_FOR_PICKUP: [SaleOrderStatus.EN_PREPARACION],
    MARK_DELIVERED: [SaleOrderStatus.LISTO_PARA_RECOJO],
    CANCEL: [
      SaleOrderStatus.PENDIENTE_PAGO,
      SaleOrderStatus.PAGADO,
      SaleOrderStatus.EN_PREPARACION,
      SaleOrderStatus.LISTO_PARA_RECOJO,
    ],
  };

  return map[action].includes(current);
}

function actionToStatus(action: SaleOrderActionInput["action"]): SaleOrderStatus {
  if (action === "MARK_PAID") {
    return SaleOrderStatus.PAGADO;
  }

  if (action === "START_PREPARATION") {
    return SaleOrderStatus.EN_PREPARACION;
  }

  if (action === "MARK_READY_FOR_PICKUP") {
    return SaleOrderStatus.LISTO_PARA_RECOJO;
  }

  if (action === "MARK_DELIVERED") {
    return SaleOrderStatus.ENTREGADO;
  }

  return SaleOrderStatus.CANCELADO;
}

export class SaleOrderService {
  constructor(private readonly saleOrderRepository: SaleOrderRepository) {}

  async listSaleOrders(filters: ListSaleOrdersFilters): Promise<SaleOrderListResult> {
    return this.saleOrderRepository.list(filters);
  }

  async getSaleOrderById(id: number): Promise<PublicSaleOrder> {
    const order = await this.saleOrderRepository.findById(id);
    if (!order) {
      throw new SaleOrderNotFoundError();
    }

    return order;
  }

  async createSaleOrder(input: CreateSaleOrderInput): Promise<PublicSaleOrder> {
    const customerExists = await this.saleOrderRepository.customerExists(
      input.customerId
    );

    if (!customerExists) {
      throw new SaleOrderCustomerNotFoundError();
    }

    const preparedItems = [] as Array<{
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
    let includesSuitOrJacket = false;

    for (const item of input.items) {
      const quantity = item.quantity ?? 1;
      const unitPrice = new Prisma.Decimal(item.unitPrice);
      const discountAmount = new Prisma.Decimal(item.discountAmount ?? 0);
      const subtotal = unitPrice.mul(quantity).sub(discountAmount);

      if (subtotal.lt(new Prisma.Decimal(0))) {
        throw new SaleOrderItemReferenceError("Item subtotal cannot be negative");
      }

      let itemNameSnapshot = item.itemNameSnapshot;

      if (item.productId !== undefined) {
        const product = await this.saleOrderRepository.getProductById(item.productId);
        if (!product) {
          throw new SaleOrderItemReferenceError(
            `Product ${item.productId} not found`
          );
        }

        itemNameSnapshot = itemNameSnapshot ?? product.nombre;

        if (product.kind === "TERNO" || product.kind === "SACO") {
          includesSuitOrJacket = true;
        }
      }

      if (item.bundleId !== undefined) {
        const bundle = await this.saleOrderRepository.getBundleById(item.bundleId);
        if (!bundle) {
          throw new SaleOrderItemReferenceError(
            `Bundle ${item.bundleId} not found`
          );
        }

        itemNameSnapshot = itemNameSnapshot ?? bundle.nombre;

        if (
          bundle.items.some(
            (bundleItem) =>
              bundleItem.product.kind === "TERNO" ||
              bundleItem.product.kind === "SACO"
          )
        ) {
          includesSuitOrJacket = true;
        }
      }

      if (!itemNameSnapshot) {
        throw new SaleOrderItemReferenceError("Item snapshot name is required");
      }

      preparedItems.push({
        productId: item.productId,
        bundleId: item.bundleId,
        itemNameSnapshot,
        quantity,
        unitPrice,
        discountAmount,
        subtotal,
        notes: item.notes,
        components: (item.components ?? []).map((component) => ({
          productId: component.productId,
          variantId: component.variantId,
          quantity: component.quantity ?? 1,
        })),
      });
    }

    if (includesSuitOrJacket) {
      const hasPriorSuitOrJacketPurchase =
        await this.saleOrderRepository.customerHasPriorSuitOrJacketPurchase(
          input.customerId
        );

      if (!hasPriorSuitOrJacketPurchase) {
        const now = new Date();

        const hasValidMeasurements =
          await this.saleOrderRepository.customerHasValidMeasurementProfile(
            input.customerId,
            now
          );

        if (!hasValidMeasurements) {
          const hasReservedMeasurementAppointment =
            await this.saleOrderRepository.customerHasReservedMeasurementAppointment(
              input.customerId,
              now
            );

          if (!hasReservedMeasurementAppointment) {
            throw new SaleOrderMeasurementReservationRequiredError();
          }
        }
      }
    }

    const requestedAt = input.requestedAt ?? new Date();
    const code = await this.saleOrderRepository.nextCodeForDate(requestedAt);

    return this.saleOrderRepository.createWithHistory({
      code,
      status: SaleOrderStatus.PENDIENTE_PAGO,
      payload: {
        ...input,
        requestedAt,
      },
      preparedItems,
    });
  }

  async actOnSaleOrder(id: number, input: SaleOrderActionInput): Promise<PublicSaleOrder> {
    const order = await this.saleOrderRepository.findById(id);
    if (!order) {
      throw new SaleOrderNotFoundError();
    }

    if (!canTransitionStatus(order.status, input.action)) {
      throw new SaleOrderStatusTransitionError();
    }

    if (input.action === "MARK_PAID") {
      const approvedTotal =
        await this.saleOrderRepository.getSaleOrderApprovedPaymentsTotal(id);

      if (approvedTotal.lt(order.total)) {
        throw new SaleOrderPaymentRequiredError();
      }
    }

    const nextStatus = actionToStatus(input.action);
    const now = new Date();

    return this.saleOrderRepository.updateStatus({
      id,
      status: nextStatus,
      note: input.note,
      preparedAt:
        nextStatus === SaleOrderStatus.EN_PREPARACION ? now : order.preparedAt,
      readyAt:
        nextStatus === SaleOrderStatus.LISTO_PARA_RECOJO ? now : order.readyAt,
      deliveredAt:
        nextStatus === SaleOrderStatus.ENTREGADO ? now : order.deliveredAt,
    });
  }
}

export const saleOrderService = new SaleOrderService(new SaleOrderRepository());
