import { Prisma, RentalOrderStatus, RentalPriceTier } from "@prisma/client";

export type RentalOrderAction =
  | "MARK_RETURNED"
  | "MARK_LATE"
  | "CLOSE"
  | "CANCEL";

export type ListRentalOrdersFilters = {
  customerId?: string;
  status?: RentalOrderStatus;
  code?: string;
  hasDelay?: boolean;
  hasDamage?: boolean;
  pickupFrom?: Date;
  pickupTo?: Date;
  dueFrom?: Date;
  dueTo?: Date;
  page: number;
  pageSize: number;
  orderBy: "createdAt" | "pickupAt" | "dueBackAt" | "total";
  order: "asc" | "desc";
};

export type RentalOrderListResult = {
  items: PublicRentalOrder[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type CreateRentalOrderItemInput = {
  rentalUnitId: string;
  productId?: string;
  itemNameSnapshot?: string;
  tierAtRental?: RentalPriceTier;
  unitPrice?: number;
  notes?: string;
};

export type CreateRentalOrderInput = {
  customerId: string;
  pickupAt?: Date;
  dueBackAt: Date;
  notes?: string;
  items: CreateRentalOrderItemInput[];
};

export type RentalOrderActionInput = {
  action: RentalOrderAction;
  note?: string;
  hasDamage?: boolean;
  returnNotes?: string;
};

export type PublicRentalOrder = {
  id: string;
  customerId: string;
  code: string;
  status: RentalOrderStatus;
  subtotal: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  total: Prisma.Decimal;
  pickupAt: Date;
  dueBackAt: Date;
  returnedAt: Date | null;
  hasDelay: boolean;
  hasDamage: boolean;
  returnNotes: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    rentalOrderId: string;
    productId: string | null;
    rentalUnitId: string;
    itemNameSnapshot: string;
    tierAtRental: RentalPriceTier;
    unitPrice: Prisma.Decimal;
    returnedAt: Date | null;
    returnCondition: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
};
