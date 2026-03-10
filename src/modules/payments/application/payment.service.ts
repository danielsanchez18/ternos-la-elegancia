import { Prisma } from "@prisma/client";

import {
  ComprobanteOverchargeError,
  PaymentCustomOrderNotFoundError,
  PaymentOverchargeError,
} from "@/src/modules/payments/domain/payment.errors";
import {
  CreateCustomOrderComprobanteInput,
  CreateCustomOrderPaymentInput,
  CustomOrderPaymentSummary,
  ListCustomOrderComprobantesFilters,
  ListCustomOrderPaymentsFilters,
  PublicComprobante,
  PublicPayment,
} from "@/src/modules/payments/domain/payment.types";
import { PaymentRepository } from "@/src/modules/payments/infrastructure/payment.repository";

export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async listCustomOrderPayments(
    customOrderId: number,
    filters: ListCustomOrderPaymentsFilters
  ): Promise<PublicPayment[]> {
    const order = await this.paymentRepository.findCustomOrderById(customOrderId);
    if (!order) {
      throw new PaymentCustomOrderNotFoundError();
    }

    return this.paymentRepository.listCustomOrderPayments(customOrderId, filters);
  }

  async createCustomOrderPayment(
    customOrderId: number,
    payload: CreateCustomOrderPaymentInput
  ): Promise<{ payment: PublicPayment; summary: CustomOrderPaymentSummary }> {
    const order = await this.paymentRepository.findCustomOrderById(customOrderId);
    if (!order) {
      throw new PaymentCustomOrderNotFoundError();
    }

    const approvedPaid = await this.paymentRepository.sumApprovedPayments(customOrderId);
    const nextApprovedPaid =
      payload.status === undefined || payload.status === "APROBADO"
        ? approvedPaid.add(new Prisma.Decimal(payload.amount))
        : approvedPaid;

    if (nextApprovedPaid.gt(order.total)) {
      throw new PaymentOverchargeError();
    }

    const payment = await this.paymentRepository.createCustomOrderPayment({
      customOrderId,
      customerId: order.customerId,
      payload,
    });

    const minAdvanceRequired = order.total.mul(new Prisma.Decimal(0.5));

    return {
      payment,
      summary: {
        customOrderId: order.id,
        orderTotal: order.total,
        approvedPaymentsTotal: nextApprovedPaid,
        pendingBalance: order.total.sub(nextApprovedPaid),
        minAdvanceRequired,
        hasRequiredAdvance: !nextApprovedPaid.lt(minAdvanceRequired),
      },
    };
  }

  async getCustomOrderPaymentSummary(
    customOrderId: number
  ): Promise<CustomOrderPaymentSummary> {
    const order = await this.paymentRepository.findCustomOrderById(customOrderId);
    if (!order) {
      throw new PaymentCustomOrderNotFoundError();
    }

    const approvedPaid = await this.paymentRepository.sumApprovedPayments(customOrderId);
    const minAdvanceRequired = order.total.mul(new Prisma.Decimal(0.5));

    return {
      customOrderId: order.id,
      orderTotal: order.total,
      approvedPaymentsTotal: approvedPaid,
      pendingBalance: order.total.sub(approvedPaid),
      minAdvanceRequired,
      hasRequiredAdvance: !approvedPaid.lt(minAdvanceRequired),
    };
  }

  async listCustomOrderComprobantes(
    customOrderId: number,
    filters: ListCustomOrderComprobantesFilters
  ): Promise<PublicComprobante[]> {
    const order = await this.paymentRepository.findCustomOrderById(customOrderId);
    if (!order) {
      throw new PaymentCustomOrderNotFoundError();
    }

    return this.paymentRepository.listCustomOrderComprobantes(customOrderId, filters);
  }

  async createCustomOrderComprobante(
    customOrderId: number,
    payload: CreateCustomOrderComprobanteInput
  ): Promise<PublicComprobante> {
    const order = await this.paymentRepository.findCustomOrderById(customOrderId);
    if (!order) {
      throw new PaymentCustomOrderNotFoundError();
    }

    if (new Prisma.Decimal(payload.total).gt(order.total)) {
      throw new ComprobanteOverchargeError();
    }

    return this.paymentRepository.createCustomOrderComprobante({
      customOrderId,
      customerId: order.customerId,
      payload,
    });
  }
}

export const paymentService = new PaymentService(new PaymentRepository());
