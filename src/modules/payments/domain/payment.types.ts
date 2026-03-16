import {
  ComprobanteStatus,
  ComprobanteType,
  PaymentConcept,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  VoucherProvider,
} from "@prisma/client";

export type ListCustomOrderPaymentsFilters = {
  status?: PaymentStatus;
  concept?: PaymentConcept;
  method?: PaymentMethod;
  from?: Date;
  to?: Date;
};

export type CreateCustomOrderPaymentInput = {
  amount: number;
  method: PaymentMethod;
  concept?: PaymentConcept;
  status?: PaymentStatus;
  provider?: VoucherProvider;
  operationCode?: string;
  approvalCode?: string;
  voucherUrl?: string;
  paidAt?: Date;
  notes?: string;
};

export type ListCustomOrderComprobantesFilters = {
  status?: ComprobanteStatus;
  type?: ComprobanteType;
  from?: Date;
  to?: Date;
};

export type CreateCustomOrderComprobanteInput = {
  type: ComprobanteType;
  status?: ComprobanteStatus;
  serie?: string;
  numero?: string;
  subtotal?: number;
  impuesto?: number;
  total: number;
  issuedAt?: Date;
  pdfUrl?: string;
  xmlUrl?: string;
  notes?: string;
};

export type PublicPayment = {
  id: number;
  customerId: number;
  customOrderId: number | null;
  alterationOrderId: number | null;
  amount: Prisma.Decimal;
  method: PaymentMethod;
  concept: PaymentConcept;
  status: PaymentStatus;
  provider: VoucherProvider | null;
  operationCode: string | null;
  approvalCode: string | null;
  voucherUrl: string | null;
  paidAt: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicComprobante = {
  id: number;
  customerId: number;
  customOrderId: number | null;
  alterationOrderId: number | null;
  type: ComprobanteType;
  status: ComprobanteStatus;
  serie: string | null;
  numero: string | null;
  subtotal: Prisma.Decimal;
  impuesto: Prisma.Decimal;
  total: Prisma.Decimal;
  issuedAt: Date | null;
  pdfUrl: string | null;
  xmlUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CustomOrderPaymentSummary = {
  customOrderId: number;
  orderTotal: Prisma.Decimal;
  approvedPaymentsTotal: Prisma.Decimal;
  pendingBalance: Prisma.Decimal;
  minAdvanceRequired: Prisma.Decimal;
  hasRequiredAdvance: boolean;
};

export type ListSaleOrderPaymentsFilters = {
  status?: PaymentStatus;
  concept?: PaymentConcept;
  method?: PaymentMethod;
  from?: Date;
  to?: Date;
};

export type CreateSaleOrderPaymentInput = {
  amount: number;
  method: PaymentMethod;
  concept?: PaymentConcept;
  status?: PaymentStatus;
  provider?: VoucherProvider;
  operationCode?: string;
  approvalCode?: string;
  voucherUrl?: string;
  paidAt?: Date;
  notes?: string;
};

export type ListSaleOrderComprobantesFilters = {
  status?: ComprobanteStatus;
  type?: ComprobanteType;
  from?: Date;
  to?: Date;
};

export type CreateSaleOrderComprobanteInput = {
  type: ComprobanteType;
  status?: ComprobanteStatus;
  serie?: string;
  numero?: string;
  subtotal?: number;
  impuesto?: number;
  total: number;
  issuedAt?: Date;
  pdfUrl?: string;
  xmlUrl?: string;
  notes?: string;
};

export type SaleOrderPaymentSummary = {
  saleOrderId: number;
  orderTotal: Prisma.Decimal;
  approvedPaymentsTotal: Prisma.Decimal;
  pendingBalance: Prisma.Decimal;
  isFullyPaid: boolean;
};

export type ListRentalOrderPaymentsFilters = {
  status?: PaymentStatus;
  concept?: PaymentConcept;
  method?: PaymentMethod;
  from?: Date;
  to?: Date;
};

export type CreateRentalOrderPaymentInput = {
  amount: number;
  method: PaymentMethod;
  concept?: PaymentConcept;
  status?: PaymentStatus;
  provider?: VoucherProvider;
  operationCode?: string;
  approvalCode?: string;
  voucherUrl?: string;
  paidAt?: Date;
  notes?: string;
};

export type ListRentalOrderComprobantesFilters = {
  status?: ComprobanteStatus;
  type?: ComprobanteType;
  from?: Date;
  to?: Date;
};

export type CreateRentalOrderComprobanteInput = {
  type: ComprobanteType;
  status?: ComprobanteStatus;
  serie?: string;
  numero?: string;
  subtotal?: number;
  impuesto?: number;
  total: number;
  issuedAt?: Date;
  pdfUrl?: string;
  xmlUrl?: string;
  notes?: string;
};

export type RentalOrderPaymentSummary = {
  rentalOrderId: number;
  orderTotal: Prisma.Decimal;
  approvedPaymentsTotal: Prisma.Decimal;
  pendingBalance: Prisma.Decimal;
  isFullyPaid: boolean;
};

export type ListAlterationOrderPaymentsFilters = {
  status?: PaymentStatus;
  concept?: PaymentConcept;
  method?: PaymentMethod;
  from?: Date;
  to?: Date;
};

export type CreateAlterationOrderPaymentInput = {
  amount: number;
  method: PaymentMethod;
  concept?: PaymentConcept;
  status?: PaymentStatus;
  provider?: VoucherProvider;
  operationCode?: string;
  approvalCode?: string;
  voucherUrl?: string;
  paidAt?: Date;
  notes?: string;
};

export type ListAlterationOrderComprobantesFilters = {
  status?: ComprobanteStatus;
  type?: ComprobanteType;
  from?: Date;
  to?: Date;
};

export type CreateAlterationOrderComprobanteInput = {
  type: ComprobanteType;
  status?: ComprobanteStatus;
  serie?: string;
  numero?: string;
  subtotal?: number;
  impuesto?: number;
  total: number;
  issuedAt?: Date;
  pdfUrl?: string;
  xmlUrl?: string;
  notes?: string;
};

export type AlterationOrderPaymentSummary = {
  alterationOrderId: number;
  orderTotal: Prisma.Decimal;
  approvedPaymentsTotal: Prisma.Decimal;
  pendingBalance: Prisma.Decimal;
  isFullyPaid: boolean;
};
