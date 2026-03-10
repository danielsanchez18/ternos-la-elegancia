import { Prisma, PaymentStatus, PaymentConcept, ComprobanteStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CreateSaleOrderComprobanteInput,
  CreateSaleOrderPaymentInput,
  CreateCustomOrderComprobanteInput,
  CreateCustomOrderPaymentInput,
  ListSaleOrderComprobantesFilters,
  ListSaleOrderPaymentsFilters,
  ListCustomOrderComprobantesFilters,
  ListCustomOrderPaymentsFilters,
  PublicComprobante,
  PublicPayment,
} from "@/src/modules/payments/domain/payment.types";

const publicPaymentSelect = {
  id: true,
  customerId: true,
  customOrderId: true,
  amount: true,
  method: true,
  concept: true,
  status: true,
  provider: true,
  operationCode: true,
  approvalCode: true,
  voucherUrl: true,
  paidAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PaymentSelect;

const publicComprobanteSelect = {
  id: true,
  customerId: true,
  customOrderId: true,
  type: true,
  status: true,
  serie: true,
  numero: true,
  subtotal: true,
  impuesto: true,
  total: true,
  issuedAt: true,
  pdfUrl: true,
  xmlUrl: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ComprobanteSelect;

export class PaymentRepository {
  async findCustomOrderById(customOrderId: number) {
    return prisma.customOrder.findUnique({
      where: { id: customOrderId },
      select: {
        id: true,
        customerId: true,
        total: true,
      },
    });
  }

  async listCustomOrderPayments(
    customOrderId: number,
    filters: ListCustomOrderPaymentsFilters
  ): Promise<PublicPayment[]> {
    return prisma.payment.findMany({
      where: {
        customOrderId,
        status: filters.status,
        concept: filters.concept,
        method: filters.method,
        paidAt:
          filters.from || filters.to
            ? {
                gte: filters.from,
                lte: filters.to,
              }
            : undefined,
      },
      orderBy: { paidAt: "desc" },
      select: publicPaymentSelect,
    });
  }

  async listCustomOrderComprobantes(
    customOrderId: number,
    filters: ListCustomOrderComprobantesFilters
  ): Promise<PublicComprobante[]> {
    return prisma.comprobante.findMany({
      where: {
        customOrderId,
        status: filters.status,
        type: filters.type,
        issuedAt:
          filters.from || filters.to
            ? {
                gte: filters.from,
                lte: filters.to,
              }
            : undefined,
      },
      orderBy: { createdAt: "desc" },
      select: publicComprobanteSelect,
    });
  }

  async findSaleOrderById(saleOrderId: number) {
    return prisma.saleOrder.findUnique({
      where: { id: saleOrderId },
      select: {
        id: true,
        customerId: true,
        total: true,
      },
    });
  }

  async listSaleOrderPayments(
    saleOrderId: number,
    filters: ListSaleOrderPaymentsFilters
  ): Promise<PublicPayment[]> {
    return prisma.payment.findMany({
      where: {
        saleOrderId,
        status: filters.status,
        concept: filters.concept,
        method: filters.method,
        paidAt:
          filters.from || filters.to
            ? {
                gte: filters.from,
                lte: filters.to,
              }
            : undefined,
      },
      orderBy: { paidAt: "desc" },
      select: publicPaymentSelect,
    });
  }

  async listSaleOrderComprobantes(
    saleOrderId: number,
    filters: ListSaleOrderComprobantesFilters
  ): Promise<PublicComprobante[]> {
    return prisma.comprobante.findMany({
      where: {
        saleOrderId,
        status: filters.status,
        type: filters.type,
        issuedAt:
          filters.from || filters.to
            ? {
                gte: filters.from,
                lte: filters.to,
              }
            : undefined,
      },
      orderBy: { createdAt: "desc" },
      select: publicComprobanteSelect,
    });
  }

  async sumApprovedPayments(customOrderId: number): Promise<Prisma.Decimal> {
    const aggregate = await prisma.payment.aggregate({
      where: {
        customOrderId,
        status: PaymentStatus.APROBADO,
      },
      _sum: {
        amount: true,
      },
    });

    return aggregate._sum.amount ?? new Prisma.Decimal(0);
  }

  async sumSaleOrderApprovedPayments(saleOrderId: number): Promise<Prisma.Decimal> {
    const aggregate = await prisma.payment.aggregate({
      where: {
        saleOrderId,
        status: PaymentStatus.APROBADO,
      },
      _sum: {
        amount: true,
      },
    });

    return aggregate._sum.amount ?? new Prisma.Decimal(0);
  }

  async createCustomOrderPayment(input: {
    customOrderId: number;
    customerId: number;
    payload: CreateCustomOrderPaymentInput;
  }): Promise<PublicPayment> {
    return prisma.payment.create({
      data: {
        customerId: input.customerId,
        customOrderId: input.customOrderId,
        amount: new Prisma.Decimal(input.payload.amount),
        method: input.payload.method,
        concept: input.payload.concept ?? PaymentConcept.ADELANTO,
        status: input.payload.status ?? PaymentStatus.APROBADO,
        provider: input.payload.provider,
        operationCode: input.payload.operationCode,
        approvalCode: input.payload.approvalCode,
        voucherUrl: input.payload.voucherUrl,
        paidAt: input.payload.paidAt,
        notes: input.payload.notes,
      },
      select: publicPaymentSelect,
    });
  }

  async createCustomOrderComprobante(input: {
    customOrderId: number;
    customerId: number;
    payload: CreateCustomOrderComprobanteInput;
  }): Promise<PublicComprobante> {
    return prisma.comprobante.create({
      data: {
        customerId: input.customerId,
        customOrderId: input.customOrderId,
        type: input.payload.type,
        status: input.payload.status ?? ComprobanteStatus.BORRADOR,
        serie: input.payload.serie,
        numero: input.payload.numero,
        subtotal:
          input.payload.subtotal !== undefined
            ? new Prisma.Decimal(input.payload.subtotal)
            : new Prisma.Decimal(0),
        impuesto:
          input.payload.impuesto !== undefined
            ? new Prisma.Decimal(input.payload.impuesto)
            : new Prisma.Decimal(0),
        total: new Prisma.Decimal(input.payload.total),
        issuedAt: input.payload.issuedAt,
        pdfUrl: input.payload.pdfUrl,
        xmlUrl: input.payload.xmlUrl,
        notes: input.payload.notes,
      },
      select: publicComprobanteSelect,
    });
  }

  async createSaleOrderPayment(input: {
    saleOrderId: number;
    customerId: number;
    payload: CreateSaleOrderPaymentInput;
  }): Promise<PublicPayment> {
    return prisma.payment.create({
      data: {
        customerId: input.customerId,
        saleOrderId: input.saleOrderId,
        amount: new Prisma.Decimal(input.payload.amount),
        method: input.payload.method,
        concept: input.payload.concept ?? PaymentConcept.PAGO_TOTAL,
        status: input.payload.status ?? PaymentStatus.APROBADO,
        provider: input.payload.provider,
        operationCode: input.payload.operationCode,
        approvalCode: input.payload.approvalCode,
        voucherUrl: input.payload.voucherUrl,
        paidAt: input.payload.paidAt,
        notes: input.payload.notes,
      },
      select: publicPaymentSelect,
    });
  }

  async createSaleOrderComprobante(input: {
    saleOrderId: number;
    customerId: number;
    payload: CreateSaleOrderComprobanteInput;
  }): Promise<PublicComprobante> {
    return prisma.comprobante.create({
      data: {
        customerId: input.customerId,
        saleOrderId: input.saleOrderId,
        type: input.payload.type,
        status: input.payload.status ?? ComprobanteStatus.BORRADOR,
        serie: input.payload.serie,
        numero: input.payload.numero,
        subtotal:
          input.payload.subtotal !== undefined
            ? new Prisma.Decimal(input.payload.subtotal)
            : new Prisma.Decimal(0),
        impuesto:
          input.payload.impuesto !== undefined
            ? new Prisma.Decimal(input.payload.impuesto)
            : new Prisma.Decimal(0),
        total: new Prisma.Decimal(input.payload.total),
        issuedAt: input.payload.issuedAt,
        pdfUrl: input.payload.pdfUrl,
        xmlUrl: input.payload.xmlUrl,
        notes: input.payload.notes,
      },
      select: publicComprobanteSelect,
    });
  }
}
