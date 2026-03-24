import { Prisma } from "@prisma/client";

import {
  PaymentAlterationOrderNotFoundError,
  ComprobanteOverchargeError,
  PaymentCustomOrderNotFoundError,
  PaymentRentalOrderNotFoundError,
  PaymentSaleOrderNotFoundError,
  PaymentOverchargeError,
} from "@/src/modules/payments/domain/payment.errors";
import {
  AlterationOrderPaymentSummary,
  CreateAlterationOrderComprobanteInput,
  CreateAlterationOrderPaymentInput,
  CreateRentalOrderComprobanteInput,
  CreateRentalOrderPaymentInput,
  CreateSaleOrderComprobanteInput,
  CreateSaleOrderPaymentInput,
  CreateCustomOrderComprobanteInput,
  CreateCustomOrderPaymentInput,
  ListAlterationOrderComprobantesFilters,
  ListAlterationOrderPaymentsFilters,
  ListRentalOrderComprobantesFilters,
  ListRentalOrderPaymentsFilters,
  ListSaleOrderComprobantesFilters,
  ListSaleOrderPaymentsFilters,
  CustomOrderPaymentSummary,
  RentalOrderPaymentSummary,
  SaleOrderPaymentSummary,
  ListCustomOrderComprobantesFilters,
  ListCustomOrderPaymentsFilters,
  PublicComprobante,
  PublicPayment,
} from "@/src/modules/payments/domain/payment.types";
import { PaymentRepository } from "@/src/modules/payments/infrastructure/payment.repository";

export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async listCustomOrderPayments(
    customOrderId: string,
    filters: ListCustomOrderPaymentsFilters
  ): Promise<PublicPayment[]> {
    const order = await this.paymentRepository.findCustomOrderById(customOrderId);
    if (!order) {
      throw new PaymentCustomOrderNotFoundError();
    }

    return this.paymentRepository.listCustomOrderPayments(customOrderId, filters);
  }

  async createCustomOrderPayment(
    customOrderId: string,
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
    customOrderId: string
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
    customOrderId: string,
    filters: ListCustomOrderComprobantesFilters
  ): Promise<PublicComprobante[]> {
    const order = await this.paymentRepository.findCustomOrderById(customOrderId);
    if (!order) {
      throw new PaymentCustomOrderNotFoundError();
    }

    return this.paymentRepository.listCustomOrderComprobantes(customOrderId, filters);
  }

  async createCustomOrderComprobante(
    customOrderId: string,
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

  async listSaleOrderPayments(
    saleOrderId: string,
    filters: ListSaleOrderPaymentsFilters
  ): Promise<PublicPayment[]> {
    const order = await this.paymentRepository.findSaleOrderById(saleOrderId);
    if (!order) {
      throw new PaymentSaleOrderNotFoundError();
    }

    return this.paymentRepository.listSaleOrderPayments(saleOrderId, filters);
  }

  async createSaleOrderPayment(
    saleOrderId: string,
    payload: CreateSaleOrderPaymentInput
  ): Promise<{ payment: PublicPayment; summary: SaleOrderPaymentSummary }> {
    const order = await this.paymentRepository.findSaleOrderById(saleOrderId);
    if (!order) {
      throw new PaymentSaleOrderNotFoundError();
    }

    const approvedPaid =
      await this.paymentRepository.sumSaleOrderApprovedPayments(saleOrderId);
    const nextApprovedPaid =
      payload.status === undefined || payload.status === "APROBADO"
        ? approvedPaid.add(new Prisma.Decimal(payload.amount))
        : approvedPaid;

    if (nextApprovedPaid.gt(order.total)) {
      throw new PaymentOverchargeError();
    }

    const payment = await this.paymentRepository.createSaleOrderPayment({
      saleOrderId,
      customerId: order.customerId,
      payload,
    });

    return {
      payment,
      summary: {
        saleOrderId: order.id,
        orderTotal: order.total,
        approvedPaymentsTotal: nextApprovedPaid,
        pendingBalance: order.total.sub(nextApprovedPaid),
        isFullyPaid: !nextApprovedPaid.lt(order.total),
      },
    };
  }

  async getSaleOrderPaymentSummary(
    saleOrderId: string
  ): Promise<SaleOrderPaymentSummary> {
    const order = await this.paymentRepository.findSaleOrderById(saleOrderId);
    if (!order) {
      throw new PaymentSaleOrderNotFoundError();
    }

    const approvedPaid =
      await this.paymentRepository.sumSaleOrderApprovedPayments(saleOrderId);

    return {
      saleOrderId: order.id,
      orderTotal: order.total,
      approvedPaymentsTotal: approvedPaid,
      pendingBalance: order.total.sub(approvedPaid),
      isFullyPaid: !approvedPaid.lt(order.total),
    };
  }

  async listSaleOrderComprobantes(
    saleOrderId: string,
    filters: ListSaleOrderComprobantesFilters
  ): Promise<PublicComprobante[]> {
    const order = await this.paymentRepository.findSaleOrderById(saleOrderId);
    if (!order) {
      throw new PaymentSaleOrderNotFoundError();
    }

    return this.paymentRepository.listSaleOrderComprobantes(saleOrderId, filters);
  }

  async createSaleOrderComprobante(
    saleOrderId: string,
    payload: CreateSaleOrderComprobanteInput
  ): Promise<PublicComprobante> {
    const order = await this.paymentRepository.findSaleOrderById(saleOrderId);
    if (!order) {
      throw new PaymentSaleOrderNotFoundError();
    }

    if (new Prisma.Decimal(payload.total).gt(order.total)) {
      throw new ComprobanteOverchargeError();
    }

    return this.paymentRepository.createSaleOrderComprobante({
      saleOrderId,
      customerId: order.customerId,
      payload,
    });
  }

  async listRentalOrderPayments(
    rentalOrderId: string,
    filters: ListRentalOrderPaymentsFilters
  ): Promise<PublicPayment[]> {
    const order = await this.paymentRepository.findRentalOrderById(rentalOrderId);
    if (!order) {
      throw new PaymentRentalOrderNotFoundError();
    }

    return this.paymentRepository.listRentalOrderPayments(rentalOrderId, filters);
  }

  async createRentalOrderPayment(
    rentalOrderId: string,
    payload: CreateRentalOrderPaymentInput
  ): Promise<{ payment: PublicPayment; summary: RentalOrderPaymentSummary }> {
    const order = await this.paymentRepository.findRentalOrderById(rentalOrderId);
    if (!order) {
      throw new PaymentRentalOrderNotFoundError();
    }

    const approvedPaid =
      await this.paymentRepository.sumRentalOrderApprovedPayments(rentalOrderId);
    const nextApprovedPaid =
      payload.status === undefined || payload.status === "APROBADO"
        ? approvedPaid.add(new Prisma.Decimal(payload.amount))
        : approvedPaid;

    if (nextApprovedPaid.gt(order.total)) {
      throw new PaymentOverchargeError();
    }

    const payment = await this.paymentRepository.createRentalOrderPayment({
      rentalOrderId,
      customerId: order.customerId,
      payload,
    });

    return {
      payment,
      summary: {
        rentalOrderId: order.id,
        orderTotal: order.total,
        approvedPaymentsTotal: nextApprovedPaid,
        pendingBalance: order.total.sub(nextApprovedPaid),
        isFullyPaid: !nextApprovedPaid.lt(order.total),
      },
    };
  }

  async getRentalOrderPaymentSummary(
    rentalOrderId: string
  ): Promise<RentalOrderPaymentSummary> {
    const order = await this.paymentRepository.findRentalOrderById(rentalOrderId);
    if (!order) {
      throw new PaymentRentalOrderNotFoundError();
    }

    const approvedPaid =
      await this.paymentRepository.sumRentalOrderApprovedPayments(rentalOrderId);

    return {
      rentalOrderId: order.id,
      orderTotal: order.total,
      approvedPaymentsTotal: approvedPaid,
      pendingBalance: order.total.sub(approvedPaid),
      isFullyPaid: !approvedPaid.lt(order.total),
    };
  }

  async listRentalOrderComprobantes(
    rentalOrderId: string,
    filters: ListRentalOrderComprobantesFilters
  ): Promise<PublicComprobante[]> {
    const order = await this.paymentRepository.findRentalOrderById(rentalOrderId);
    if (!order) {
      throw new PaymentRentalOrderNotFoundError();
    }

    return this.paymentRepository.listRentalOrderComprobantes(rentalOrderId, filters);
  }

  async createRentalOrderComprobante(
    rentalOrderId: string,
    payload: CreateRentalOrderComprobanteInput
  ): Promise<PublicComprobante> {
    const order = await this.paymentRepository.findRentalOrderById(rentalOrderId);
    if (!order) {
      throw new PaymentRentalOrderNotFoundError();
    }

    if (new Prisma.Decimal(payload.total).gt(order.total)) {
      throw new ComprobanteOverchargeError();
    }

    return this.paymentRepository.createRentalOrderComprobante({
      rentalOrderId,
      customerId: order.customerId,
      payload,
    });
  }

  async listAlterationOrderPayments(
    alterationOrderId: string,
    filters: ListAlterationOrderPaymentsFilters
  ): Promise<PublicPayment[]> {
    const order = await this.paymentRepository.findAlterationOrderById(
      alterationOrderId
    );
    if (!order) {
      throw new PaymentAlterationOrderNotFoundError();
    }

    return this.paymentRepository.listAlterationOrderPayments(
      alterationOrderId,
      filters
    );
  }

  async createAlterationOrderPayment(
    alterationOrderId: string,
    payload: CreateAlterationOrderPaymentInput
  ): Promise<{ payment: PublicPayment; summary: AlterationOrderPaymentSummary }> {
    const order = await this.paymentRepository.findAlterationOrderById(
      alterationOrderId
    );
    if (!order) {
      throw new PaymentAlterationOrderNotFoundError();
    }

    const approvedPaid =
      await this.paymentRepository.sumAlterationOrderApprovedPayments(
        alterationOrderId
      );
    const nextApprovedPaid =
      payload.status === undefined || payload.status === "APROBADO"
        ? approvedPaid.add(new Prisma.Decimal(payload.amount))
        : approvedPaid;

    if (nextApprovedPaid.gt(order.total)) {
      throw new PaymentOverchargeError();
    }

    const payment = await this.paymentRepository.createAlterationOrderPayment({
      alterationOrderId,
      customerId: order.customerId,
      payload,
    });

    return {
      payment,
      summary: {
        alterationOrderId: order.id,
        orderTotal: order.total,
        approvedPaymentsTotal: nextApprovedPaid,
        pendingBalance: order.total.sub(nextApprovedPaid),
        isFullyPaid: !nextApprovedPaid.lt(order.total),
      },
    };
  }

  async getAlterationOrderPaymentSummary(
    alterationOrderId: string
  ): Promise<AlterationOrderPaymentSummary> {
    const order = await this.paymentRepository.findAlterationOrderById(
      alterationOrderId
    );
    if (!order) {
      throw new PaymentAlterationOrderNotFoundError();
    }

    const approvedPaid =
      await this.paymentRepository.sumAlterationOrderApprovedPayments(
        alterationOrderId
      );

    return {
      alterationOrderId: order.id,
      orderTotal: order.total,
      approvedPaymentsTotal: approvedPaid,
      pendingBalance: order.total.sub(approvedPaid),
      isFullyPaid: !approvedPaid.lt(order.total),
    };
  }

  async listAlterationOrderComprobantes(
    alterationOrderId: string,
    filters: ListAlterationOrderComprobantesFilters
  ): Promise<PublicComprobante[]> {
    const order = await this.paymentRepository.findAlterationOrderById(
      alterationOrderId
    );
    if (!order) {
      throw new PaymentAlterationOrderNotFoundError();
    }

    return this.paymentRepository.listAlterationOrderComprobantes(
      alterationOrderId,
      filters
    );
  }

  async createAlterationOrderComprobante(
    alterationOrderId: string,
    payload: CreateAlterationOrderComprobanteInput
  ): Promise<PublicComprobante> {
    const order = await this.paymentRepository.findAlterationOrderById(
      alterationOrderId
    );
    if (!order) {
      throw new PaymentAlterationOrderNotFoundError();
    }

    if (new Prisma.Decimal(payload.total).gt(order.total)) {
      throw new ComprobanteOverchargeError();
    }

    return this.paymentRepository.createAlterationOrderComprobante({
      alterationOrderId,
      customerId: order.customerId,
      payload,
    });
  }
}

export const paymentService = new PaymentService(new PaymentRepository());
