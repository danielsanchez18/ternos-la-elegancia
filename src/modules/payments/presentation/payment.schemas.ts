import {
  ComprobanteStatus,
  ComprobanteType,
  PaymentConcept,
  PaymentMethod,
  PaymentStatus,
  VoucherProvider,
} from "@prisma/client";
import { z } from "zod";

export const customOrderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const saleOrderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listCustomOrderPaymentsQuerySchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  concept: z.nativeEnum(PaymentConcept).optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const createCustomOrderPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  concept: z.nativeEnum(PaymentConcept).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  provider: z.nativeEnum(VoucherProvider).optional(),
  operationCode: z.string().trim().max(120).optional(),
  approvalCode: z.string().trim().max(120).optional(),
  voucherUrl: z.string().url().max(500).optional(),
  paidAt: z.coerce.date().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const listCustomOrderComprobantesQuerySchema = z.object({
  status: z.nativeEnum(ComprobanteStatus).optional(),
  type: z.nativeEnum(ComprobanteType).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const createCustomOrderComprobanteSchema = z.object({
  type: z.nativeEnum(ComprobanteType),
  status: z.nativeEnum(ComprobanteStatus).optional(),
  serie: z.string().trim().max(20).optional(),
  numero: z.string().trim().max(20).optional(),
  subtotal: z.number().min(0).optional(),
  impuesto: z.number().min(0).optional(),
  total: z.number().min(0),
  issuedAt: z.coerce.date().optional(),
  pdfUrl: z.string().url().max(500).optional(),
  xmlUrl: z.string().url().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const listSaleOrderPaymentsQuerySchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  concept: z.nativeEnum(PaymentConcept).optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const createSaleOrderPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  concept: z.nativeEnum(PaymentConcept).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  provider: z.nativeEnum(VoucherProvider).optional(),
  operationCode: z.string().trim().max(120).optional(),
  approvalCode: z.string().trim().max(120).optional(),
  voucherUrl: z.string().url().max(500).optional(),
  paidAt: z.coerce.date().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const listSaleOrderComprobantesQuerySchema = z.object({
  status: z.nativeEnum(ComprobanteStatus).optional(),
  type: z.nativeEnum(ComprobanteType).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const createSaleOrderComprobanteSchema = z.object({
  type: z.nativeEnum(ComprobanteType),
  status: z.nativeEnum(ComprobanteStatus).optional(),
  serie: z.string().trim().max(20).optional(),
  numero: z.string().trim().max(20).optional(),
  subtotal: z.number().min(0).optional(),
  impuesto: z.number().min(0).optional(),
  total: z.number().min(0),
  issuedAt: z.coerce.date().optional(),
  pdfUrl: z.string().url().max(500).optional(),
  xmlUrl: z.string().url().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
