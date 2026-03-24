import { AlterationOrderStatus, Prisma } from "@prisma/client";

import {
  AlterationOrderActionInput,
  AlterationOrderListResult,
  CreateAlterationOrderInput,
  ListAlterationOrdersFilters,
  PublicAlterationOrder,
} from "@/src/modules/alteration-orders/domain/alteration-order.types";
import {
  AlterationOrderCustomerNotFoundError,
  AlterationOrderNotFoundError,
  AlterationOrderServiceNotFoundError,
  AlterationOrderStatusTransitionError,
  AlterationOrderValidationError,
} from "@/src/modules/alteration-orders/domain/alteration-order.errors";
import { AlterationOrderRepository } from "@/src/modules/alteration-orders/infrastructure/alteration-order.repository";

function canTransitionStatus(
  current: AlterationOrderStatus,
  action: AlterationOrderActionInput["action"]
): boolean {
  const map: Record<AlterationOrderActionInput["action"], AlterationOrderStatus[]> = {
    START_EVALUATION: [AlterationOrderStatus.RECIBIDO],
    START_WORK: [AlterationOrderStatus.EN_EVALUACION],
    MARK_READY: [AlterationOrderStatus.EN_PROCESO],
    MARK_DELIVERED: [AlterationOrderStatus.LISTO],
    CANCEL: [
      AlterationOrderStatus.RECIBIDO,
      AlterationOrderStatus.EN_EVALUACION,
      AlterationOrderStatus.EN_PROCESO,
      AlterationOrderStatus.LISTO,
    ],
  };

  return map[action].includes(current);
}

function actionToStatus(action: AlterationOrderActionInput["action"]): AlterationOrderStatus {
  if (action === "START_EVALUATION") {
    return AlterationOrderStatus.EN_EVALUACION;
  }

  if (action === "START_WORK") {
    return AlterationOrderStatus.EN_PROCESO;
  }

  if (action === "MARK_READY") {
    return AlterationOrderStatus.LISTO;
  }

  if (action === "MARK_DELIVERED") {
    return AlterationOrderStatus.ENTREGADO;
  }

  return AlterationOrderStatus.CANCELADO;
}

export class AlterationOrderService {
  constructor(private readonly alterationOrderRepository: AlterationOrderRepository) {}

  async listAlterationOrders(
    filters: ListAlterationOrdersFilters
  ): Promise<AlterationOrderListResult> {
    return this.alterationOrderRepository.list(filters);
  }

  async getAlterationOrderById(id: string): Promise<PublicAlterationOrder> {
    const order = await this.alterationOrderRepository.findById(id);
    if (!order) {
      throw new AlterationOrderNotFoundError();
    }

    return order;
  }

  async createAlterationOrder(input: CreateAlterationOrderInput): Promise<PublicAlterationOrder> {
    const customerExists = await this.alterationOrderRepository.customerExists(
      input.customerId
    );

    if (!customerExists) {
      throw new AlterationOrderCustomerNotFoundError();
    }

    let serviceBasePrice = new Prisma.Decimal(0);

    if (input.serviceId !== undefined) {
      const service = await this.alterationOrderRepository.getAlterationServiceById(
        input.serviceId
      );

      if (!service) {
        throw new AlterationOrderServiceNotFoundError(input.serviceId);
      }

      serviceBasePrice = service.precioBase ?? new Prisma.Decimal(0);
    }

    const receivedAt = input.receivedAt ?? new Date();

    if (input.promisedAt && input.promisedAt < receivedAt) {
      throw new AlterationOrderValidationError("promisedAt must be after receivedAt");
    }

    const subtotal =
      input.subtotal !== undefined ? new Prisma.Decimal(input.subtotal) : serviceBasePrice;
    const discountTotal = new Prisma.Decimal(input.discountTotal ?? 0);
    const total = subtotal.sub(discountTotal);

    if (total.lt(new Prisma.Decimal(0))) {
      throw new AlterationOrderValidationError("Total cannot be negative");
    }

    const code = await this.alterationOrderRepository.nextCodeForDate(receivedAt);

    return this.alterationOrderRepository.createWithHistory({
      code,
      status: AlterationOrderStatus.RECIBIDO,
      payload: {
        ...input,
        receivedAt,
        subtotal,
        discountTotal,
        total,
      },
    });
  }

  async actOnAlterationOrder(
    id: string,
    input: AlterationOrderActionInput
  ): Promise<PublicAlterationOrder> {
    const order = await this.alterationOrderRepository.findById(id);
    if (!order) {
      throw new AlterationOrderNotFoundError();
    }

    if (!canTransitionStatus(order.status, input.action)) {
      throw new AlterationOrderStatusTransitionError();
    }

    const nextStatus = actionToStatus(input.action);

    return this.alterationOrderRepository.updateStatus({
      id,
      status: nextStatus,
      note: input.note,
      deliveredAt:
        nextStatus === AlterationOrderStatus.ENTREGADO ? new Date() : order.deliveredAt,
    });
  }
}

export const alterationOrderService = new AlterationOrderService(
  new AlterationOrderRepository()
);
