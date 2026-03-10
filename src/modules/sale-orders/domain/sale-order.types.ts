import { Prisma, SaleOrderStatus } from "@prisma/client";

export type SaleOrderAction =
  | "MARK_PAID"
  | "START_PREPARATION"
  | "MARK_READY_FOR_PICKUP"
  | "MARK_DELIVERED"
  | "CANCEL";

export type ListSaleOrdersFilters = {
  customerId?: number;
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
  productId?: number;
  variantId?: number;
  quantity?: number;
};

export type CreateSaleOrderItemInput = {
  productId?: number;
  bundleId?: number;
  itemNameSnapshot?: string;
  quantity?: number;
  unitPrice: number;
  discountAmount?: number;
  notes?: string;
  components?: CreateSaleOrderItemComponentInput[];
};

export type CreateSaleOrderInput = {
  customerId: number;
  notes?: string;
  requestedAt?: Date;
  items: CreateSaleOrderItemInput[];
};

export type SaleOrderActionInput = {
  action: SaleOrderAction;
  note?: string;
};

export type PublicSaleOrder = {
  id: number;
  customerId: number;
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
    id: number;
    saleOrderId: number;
    productId: number | null;
    bundleId: number | null;
    itemNameSnapshot: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    subtotal: Prisma.Decimal;
    notes: string | null;
    components: {
      id: number;
      saleOrderItemId: number;
      productId: number | null;
      variantId: number | null;
      quantity: number;
    }[];
  }[];
};
