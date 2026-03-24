import { Prisma, RentalOrderStatus, RentalUnitStatus } from "@prisma/client";

import {
  CreateRentalOrderInput,
  ListRentalOrdersFilters,
  PublicRentalOrder,
  RentalOrderActionInput,
  RentalOrderListResult,
} from "@/src/modules/rental-orders/domain/rental-order.types";
import {
  RentalOrderCustomerNotFoundError,
  RentalOrderNotFoundError,
  RentalOrderTransitionError,
  RentalOrderUnitNotFoundError,
  RentalOrderUnitUnavailableError,
  RentalOrderValidationError,
} from "@/src/modules/rental-orders/domain/rental-order.errors";
import { RentalOrderRepository } from "@/src/modules/rental-orders/infrastructure/rental-order.repository";

function canTransitionStatus(
  current: RentalOrderStatus,
  action: RentalOrderActionInput["action"]
): boolean {
  const map: Record<RentalOrderActionInput["action"], RentalOrderStatus[]> = {
    MARK_RETURNED: [RentalOrderStatus.ENTREGADO, RentalOrderStatus.ATRASADO],
    MARK_LATE: [RentalOrderStatus.ENTREGADO],
    CLOSE: [RentalOrderStatus.DEVUELTO],
    CANCEL: [RentalOrderStatus.RESERVADO],
  };

  return map[action].includes(current);
}

export class RentalOrderService {
  constructor(private readonly rentalOrderRepository: RentalOrderRepository) {}

  async listRentalOrders(filters: ListRentalOrdersFilters): Promise<RentalOrderListResult> {
    return this.rentalOrderRepository.list(filters);
  }

  async getRentalOrderById(id: string): Promise<PublicRentalOrder> {
    const order = await this.rentalOrderRepository.findById(id);
    if (!order) {
      throw new RentalOrderNotFoundError();
    }

    return order;
  }

  async createRentalOrder(input: CreateRentalOrderInput): Promise<PublicRentalOrder> {
    const customerExists = await this.rentalOrderRepository.customerExists(
      input.customerId
    );

    if (!customerExists) {
      throw new RentalOrderCustomerNotFoundError();
    }

    const pickupAt = input.pickupAt ?? new Date();
    const now = new Date();

    if (pickupAt.getTime() - now.getTime() > 5 * 60 * 1000) {
      throw new RentalOrderValidationError(
        "Rental orders are immediate and cannot be scheduled in the future"
      );
    }

    if (input.dueBackAt <= pickupAt) {
      throw new RentalOrderValidationError("dueBackAt must be after pickupAt");
    }

    const preparedItems = [] as Array<{
      rentalUnitId: string;
      productId?: string;
      itemNameSnapshot: string;
      tierAtRental: "ESTRENO" | "NORMAL";
      unitPrice: Prisma.Decimal;
      notes?: string;
    }>;

    for (const item of input.items) {
      const unit = await this.rentalOrderRepository.getRentalUnitById(item.rentalUnitId);

      if (!unit) {
        throw new RentalOrderUnitNotFoundError(item.rentalUnitId);
      }

      if (unit.status !== RentalUnitStatus.DISPONIBLE) {
        throw new RentalOrderUnitUnavailableError(unit.id);
      }

      const product = await this.rentalOrderRepository.getProductById(
        item.productId ?? unit.productId
      );

      if (!product) {
        throw new RentalOrderValidationError(
          `Product ${item.productId ?? unit.productId} not found`
        );
      }

      const tierAtRental = item.tierAtRental ?? unit.currentTier;
      const defaultPrice = tierAtRental === "ESTRENO" ? unit.premierePrice : unit.normalPrice;

      preparedItems.push({
        rentalUnitId: unit.id,
        productId: item.productId ?? unit.productId,
        itemNameSnapshot: item.itemNameSnapshot ?? product.nombre,
        tierAtRental,
        unitPrice:
          item.unitPrice !== undefined
            ? new Prisma.Decimal(item.unitPrice)
            : defaultPrice,
        notes: item.notes,
      });
    }

    const code = await this.rentalOrderRepository.nextCodeForDate(pickupAt);

    return this.rentalOrderRepository.createWithInitialDelivery({
      code,
      payload: {
        ...input,
        pickupAt,
      },
      preparedItems,
    });
  }

  async actOnRentalOrder(
    rentalOrderId: string,
    input: RentalOrderActionInput
  ): Promise<PublicRentalOrder> {
    const order = await this.rentalOrderRepository.findById(rentalOrderId);
    if (!order) {
      throw new RentalOrderNotFoundError();
    }

    if (!canTransitionStatus(order.status, input.action)) {
      throw new RentalOrderTransitionError();
    }

    if (input.action === "MARK_RETURNED") {
      return this.rentalOrderRepository.markReturned({
        rentalOrderId,
        returnedAt: new Date(),
        hasDamage: input.hasDamage,
        returnNotes: input.returnNotes,
        note: input.note,
      });
    }

    if (input.action === "MARK_LATE") {
      return this.rentalOrderRepository.updateStatus({
        rentalOrderId,
        status: RentalOrderStatus.ATRASADO,
        note: input.note,
      });
    }

    if (input.action === "CLOSE") {
      return this.rentalOrderRepository.updateStatus({
        rentalOrderId,
        status: RentalOrderStatus.CERRADO,
        note: input.note,
      });
    }

    return this.rentalOrderRepository.updateStatus({
      rentalOrderId,
      status: RentalOrderStatus.CANCELADO,
      note: input.note,
    });
  }
}

export const rentalOrderService = new RentalOrderService(new RentalOrderRepository());
