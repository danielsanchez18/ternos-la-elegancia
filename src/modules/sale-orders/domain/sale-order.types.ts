import { Prisma, SaleOrderStatus } from "@prisma/client";

export type SaleOrderAction =
  | "MARK_PAID"
  | "START_PREPARATION"
  | "MARK_READY_FOR_PICKUP"
  | "MARK_DELIVERED"
  | "CANCEL";

export type ListSaleOrdersFilters = {
  customerId?: string;
  status?: SaleOrderStatus;
  code?: string;
  requestedFrom?: Date;
  requestedTo?: Date;
  page: number;
  pageSize: number;
  orderBy: "createdAt" | "requestedAt" | "total";
  order: "asc" | "desc";
};

export type SaleOrderListResult = {
  items: PublicSaleOrder[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type CreateSaleOrderItemComponentInput = {
  productId?: string;
  variantId?: string;
  quantity?: number;
};

export type CreateSaleOrderItemInput = {
  productId?: string;
  bundleId?: string;
  itemNameSnapshot?: string;
  quantity?: number;
  unitPrice: number;
  discountAmount?: number;
  notes?: string;
  components?: CreateSaleOrderItemComponentInput[];
};

export type CreateSaleOrderInput = {
  customerId: string;
  notes?: string;
  requestedAt?: Date;
  items: CreateSaleOrderItemInput[];
};

export type SaleOrderActionInput = {
  action: SaleOrderAction;
  note?: string;
};

export type PublicSaleOrder = {
  id: string;
  customerId: string;
  code: string;
  status: SaleOrderStatus;
  subtotal: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  total: Prisma.Decimal;
  notes: string | null;
  requestedAt: Date;
  preparedAt: Date | null;
  readyAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    saleOrderId: string;
    productId: string | null;
    bundleId: string | null;
    itemNameSnapshot: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    subtotal: Prisma.Decimal;
    notes: string | null;
    components: {
      id: string;
      saleOrderItemId: string;
      productId: string | null;
      variantId: string | null;
      quantity: number;
    }[];
  }[];
};
