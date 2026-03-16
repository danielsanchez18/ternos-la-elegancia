import {
  CustomOrderStatus,
  FabricPriceMode,
  InputFieldType,
  MeasurementGarmentType,
  Prisma,
} from "@prisma/client";

import {
  CustomOrderActionInput,
  CustomOrderListResult,
  CreateCustomOrderInput,
  ListCustomOrdersFilters,
  PublicCustomOrder,
} from "@/src/modules/custom-orders/domain/custom-order.types";
import {
  CustomOrderAdvancePaymentRequiredError,
  CustomOrderCustomerNotFoundError,
  CustomOrderCustomizationNotFoundError,
  CustomOrderFabricNotFoundError,
  CustomOrderMeasurementNotValidError,
  CustomOrderNotFoundError,
  CustomOrderStatusTransitionError,
} from "@/src/modules/custom-orders/domain/custom-order.errors";
import { CustomOrderRepository } from "@/src/modules/custom-orders/infrastructure/custom-order.repository";

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function canTransitionStatus(
  current: CustomOrderStatus,
  action: CustomOrderActionInput["action"]
): boolean {
  const map: Record<CustomOrderActionInput["action"], CustomOrderStatus[]> = {
    CONFIRM_RESERVATION: [CustomOrderStatus.PENDIENTE_RESERVA],
    MARK_MEASUREMENTS_TAKEN: [
      CustomOrderStatus.PENDIENTE_RESERVA,
      CustomOrderStatus.RESERVA_CONFIRMADA,
    ],
    START_CONFECTION: [
      CustomOrderStatus.MEDIDAS_TOMADAS,
      CustomOrderStatus.RESERVA_CONFIRMADA,
    ],
    START_FITTING: [CustomOrderStatus.EN_CONFECCION],
    MARK_READY: [CustomOrderStatus.EN_PRUEBA, CustomOrderStatus.EN_CONFECCION],
    MARK_DELIVERED: [CustomOrderStatus.LISTO],
    CANCEL: [
      CustomOrderStatus.PENDIENTE_RESERVA,
      CustomOrderStatus.RESERVA_CONFIRMADA,
      CustomOrderStatus.MEDIDAS_TOMADAS,
      CustomOrderStatus.EN_CONFECCION,
      CustomOrderStatus.EN_PRUEBA,
      CustomOrderStatus.LISTO,
    ],
  };

  return map[action].includes(current);
}

function actionToStatus(action: CustomOrderActionInput["action"]): CustomOrderStatus {
  if (action === "CONFIRM_RESERVATION") {
    return CustomOrderStatus.RESERVA_CONFIRMADA;
  }

  if (action === "MARK_MEASUREMENTS_TAKEN") {
    return CustomOrderStatus.MEDIDAS_TOMADAS;
  }

  if (action === "START_CONFECTION") {
    return CustomOrderStatus.EN_CONFECCION;
  }

  if (action === "START_FITTING") {
    return CustomOrderStatus.EN_PRUEBA;
  }

  if (action === "MARK_READY") {
    return CustomOrderStatus.LISTO;
  }

  if (action === "MARK_DELIVERED") {
    return CustomOrderStatus.ENTREGADO;
  }

  return CustomOrderStatus.CANCELADO;
}

export class CustomOrderService {
  constructor(private readonly customOrderRepository: CustomOrderRepository) {}

  async listCustomOrders(filters: ListCustomOrdersFilters): Promise<CustomOrderListResult> {
    return this.customOrderRepository.list(filters);
  }

  async getCustomOrderById(id: number): Promise<PublicCustomOrder> {
    const order = await this.customOrderRepository.findById(id);
    if (!order) {
      throw new CustomOrderNotFoundError();
    }

    return order;
  }

  async createCustomOrder(input: CreateCustomOrderInput): Promise<PublicCustomOrder> {
    const customerExists = await this.customOrderRepository.customerExists(
      input.customerId
    );

    if (!customerExists) {
      throw new CustomOrderCustomerNotFoundError();
    }

    const now = new Date();
    let requiresMeasurement = Boolean(input.firstPurchaseFlow);

    const preparedItems = [] as Array<{
      productId?: number;
      itemNameSnapshot: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      discountAmount: Prisma.Decimal;
      subtotal: Prisma.Decimal;
      notes?: string;
      parts: Array<{
        productId?: number;
        garmentType: MeasurementGarmentType;
        label: string;
        workMode: FabricPriceMode;
        measurementProfileId?: number;
        measurementProfileGarmentId?: number;
        fabricId?: number;
        fabricNameSnapshot?: string;
        fabricCodeSnapshot?: string;
        fabricColorSnapshot?: string;
        unitPrice?: Prisma.Decimal;
        notes?: string;
        selections: Array<{
          definitionId: number;
          optionId?: number;
          definitionCodeSnapshot: string;
          definitionLabelSnapshot: string;
          inputTypeSnapshot: InputFieldType;
          optionCodeSnapshot?: string;
          optionLabelSnapshot?: string;
          extraPriceSnapshot?: Prisma.Decimal;
          valueText?: string;
          valueNumber?: Prisma.Decimal;
          valueBoolean?: boolean;
        }>;
      }>;
    }>;

    for (const item of input.items) {
      const unitPrice = new Prisma.Decimal(item.unitPrice);
      const discountAmount = new Prisma.Decimal(item.discountAmount ?? 0);
      const subtotal = unitPrice.mul(item.quantity).sub(discountAmount);

      if (subtotal.lt(new Prisma.Decimal(0))) {
        throw new CustomOrderMeasurementNotValidError(
          "Item subtotal cannot be negative"
        );
      }

      const product = item.productId
        ? await this.customOrderRepository.getProductById(item.productId)
        : null;

      const itemNameSnapshot = item.itemNameSnapshot ?? product?.nombre;

      if (!itemNameSnapshot) {
        throw new CustomOrderCustomizationNotFoundError(
          "Item snapshot name is required"
        );
      }

      const preparedParts = [] as Array<{
        productId?: number;
        garmentType: MeasurementGarmentType;
        label: string;
        workMode: FabricPriceMode;
        measurementProfileId?: number;
        measurementProfileGarmentId?: number;
        fabricId?: number;
        fabricNameSnapshot?: string;
        fabricCodeSnapshot?: string;
        fabricColorSnapshot?: string;
        unitPrice?: Prisma.Decimal;
        notes?: string;
        selections: Array<{
          definitionId: number;
          optionId?: number;
          definitionCodeSnapshot: string;
          definitionLabelSnapshot: string;
          inputTypeSnapshot: InputFieldType;
          optionCodeSnapshot?: string;
          optionLabelSnapshot?: string;
          extraPriceSnapshot?: Prisma.Decimal;
          valueText?: string;
          valueNumber?: Prisma.Decimal;
          valueBoolean?: boolean;
        }>;
      }>;

      for (const part of item.parts) {
        let measurementProfileId = part.measurementProfileId;
        let measurementProfileGarmentId = part.measurementProfileGarmentId;

        if (measurementProfileId) {
          const profile = await this.customOrderRepository.getMeasurementProfileForCustomer(
            measurementProfileId,
            input.customerId
          );

          if (!profile || profile.validUntil < now) {
            throw new CustomOrderMeasurementNotValidError(
              "Measurement profile is missing or expired"
            );
          }

          if (measurementProfileGarmentId) {
            const garment = await this.customOrderRepository.getMeasurementProfileGarment(
              measurementProfileGarmentId
            );

            if (
              !garment ||
              garment.profileId !== profile.id ||
              garment.garmentType !== part.garmentType
            ) {
              throw new CustomOrderMeasurementNotValidError(
                "Measurement garment does not match profile/garment type"
              );
            }
          } else {
            const garment =
              await this.customOrderRepository.getActiveValidMeasurementProfileGarmentForCustomer(
                {
                  customerId: input.customerId,
                  garmentType: part.garmentType,
                  now,
                }
              );

            if (!garment || garment.profileId !== profile.id) {
              throw new CustomOrderMeasurementNotValidError(
                "Selected profile does not have valid garment measurements"
              );
            }

            measurementProfileGarmentId = garment.id;
          }
        } else {
          const validGarment =
            await this.customOrderRepository.getActiveValidMeasurementProfileGarmentForCustomer(
              {
                customerId: input.customerId,
                garmentType: part.garmentType,
                now,
              }
            );

          if (validGarment) {
            measurementProfileId = validGarment.profileId;
            measurementProfileGarmentId = validGarment.id;
          } else {
            requiresMeasurement = true;
          }
        }

        let fabricSnapshot:
          | {
              id: number;
              nombre: string;
              code: string;
              color: string | null;
            }
          | undefined;

        if (part.fabricId) {
          const fabric = await this.customOrderRepository.getFabricById(part.fabricId);
          if (!fabric) {
            throw new CustomOrderFabricNotFoundError();
          }

          fabricSnapshot = fabric;
        }

        const preparedSelections = [] as Array<{
          definitionId: number;
          optionId?: number;
          definitionCodeSnapshot: string;
          definitionLabelSnapshot: string;
          inputTypeSnapshot: InputFieldType;
          optionCodeSnapshot?: string;
          optionLabelSnapshot?: string;
          extraPriceSnapshot?: Prisma.Decimal;
          valueText?: string;
          valueNumber?: Prisma.Decimal;
          valueBoolean?: boolean;
        }>;

        for (const selection of part.selections ?? []) {
          const definition = await this.customOrderRepository.getCustomizationDefinition(
            selection.definitionId
          );

          if (!definition) {
            throw new CustomOrderCustomizationNotFoundError(
              `Customization definition ${selection.definitionId} not found`
            );
          }

          let optionSnapshot:
            | {
                code: string;
                label: string;
                extraPrice: Prisma.Decimal | null;
              }
            | undefined;

          if (selection.optionId) {
            const option = await this.customOrderRepository.getCustomizationOption(
              selection.optionId
            );

            if (!option || option.definitionId !== definition.id) {
              throw new CustomOrderCustomizationNotFoundError(
                `Customization option ${selection.optionId} not found for definition ${definition.id}`
              );
            }

            optionSnapshot = {
              code: option.code,
              label: option.label,
              extraPrice: option.extraPrice,
            };
          }

          preparedSelections.push({
            definitionId: definition.id,
            optionId: selection.optionId,
            definitionCodeSnapshot: definition.code,
            definitionLabelSnapshot: definition.label,
            inputTypeSnapshot: definition.inputType,
            optionCodeSnapshot: optionSnapshot?.code,
            optionLabelSnapshot: optionSnapshot?.label,
            extraPriceSnapshot: optionSnapshot?.extraPrice ?? undefined,
            valueText: selection.valueText,
            valueNumber:
              selection.valueNumber !== undefined
                ? new Prisma.Decimal(selection.valueNumber)
                : undefined,
            valueBoolean: selection.valueBoolean,
          });
        }

        preparedParts.push({
          productId: part.productId,
          garmentType: part.garmentType,
          label: part.label,
          workMode: part.workMode ?? FabricPriceMode.A_TODO_COSTO,
          measurementProfileId,
          measurementProfileGarmentId,
          fabricId: fabricSnapshot?.id,
          fabricNameSnapshot: fabricSnapshot?.nombre,
          fabricCodeSnapshot: fabricSnapshot?.code,
          fabricColorSnapshot: fabricSnapshot?.color ?? undefined,
          unitPrice:
            part.unitPrice !== undefined
              ? new Prisma.Decimal(part.unitPrice)
              : undefined,
          notes: part.notes,
          selections: preparedSelections,
        });
      }

      preparedItems.push({
        productId: item.productId,
        itemNameSnapshot,
        quantity: item.quantity,
        unitPrice,
        discountAmount,
        subtotal,
        notes: item.notes,
        parts: preparedParts,
      });
    }

    const status = requiresMeasurement
      ? CustomOrderStatus.PENDIENTE_RESERVA
      : CustomOrderStatus.RESERVA_CONFIRMADA;

    const code = await this.customOrderRepository.nextCodeForDate(now);

    return this.customOrderRepository.createWithHistory({
      code,
      status,
      requiresMeasurement,
      measurementRequiredUntil: requiresMeasurement ? addDays(now, 7) : null,
      payload: input,
      preparedItems,
    });
  }

  async actOnCustomOrder(
    id: number,
    input: CustomOrderActionInput
  ): Promise<PublicCustomOrder> {
    const order = await this.customOrderRepository.findById(id);
    if (!order) {
      throw new CustomOrderNotFoundError();
    }

    if (!canTransitionStatus(order.status, input.action)) {
      throw new CustomOrderStatusTransitionError();
    }

    if (input.action === "START_CONFECTION") {
      const approvedPaid = await this.customOrderRepository.getApprovedPaymentsTotal(id);
      const requiredAdvance = order.total.mul(new Prisma.Decimal(0.5));

      if (approvedPaid.lt(requiredAdvance)) {
        throw new CustomOrderAdvancePaymentRequiredError();
      }
    }

    const nextStatus = actionToStatus(input.action);

    return this.customOrderRepository.updateStatus({
      id,
      status: nextStatus,
      note: input.note,
      deliveredAt:
        nextStatus === CustomOrderStatus.ENTREGADO ? new Date() : order.deliveredAt,
      requiresMeasurement:
        nextStatus === CustomOrderStatus.MEDIDAS_TOMADAS
          ? false
          : order.requiresMeasurement,
    });
  }
}

export const customOrderService = new CustomOrderService(
  new CustomOrderRepository()
);
